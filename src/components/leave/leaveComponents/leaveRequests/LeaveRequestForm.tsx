import React, { useState, useEffect, useMemo } from "react";
import { requestLeave, fetchLeaveTypes, fetchAllLeaveRequests } from "@/lib/store/slices/leaveRequestSlice";
import type { LeaveRequestPayload, LeaveBalance, Holiday } from "@/lib/types/type";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RiCalendarLine, RiMailSendLine, RiLoader2Line, RiInfinityLine } from "@remixicon/react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { formatDateInput, getBackendURL } from "@/lib/utils";
import { setLeaveBalance } from "@/lib/store/slices/leaveSlice";
import { setHoliday } from "@/lib/store/slices/organizationSlice";
import { Calendar } from "@/components/ui/calendar"; 
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

const LeaveRequestForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { leaveTypes } = useAppSelector((state) => state.leaveRequest);
  const { organization } = useAppSelector((state) => state.organization);
  const { leaveBalance } = useAppSelector((state) => state.leave);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [typesLoading, setTypesLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<LeaveRequestPayload>({
    leave_type_id: 0,
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [liveError, setLiveError] = useState<string>("");
  const selectedType = leaveTypes.find((t) => t.leave_type_id === formData.leave_type_id);
  const isLossOfPay = selectedType?.name?.toLowerCase().includes("loss of pay");
  useEffect(() => {
    const loadAll = async () => {
      setTypesLoading(true);
      await dispatch(fetchLeaveTypes());
      await fetchLeaveBalances();
      await loadHolidays();
      setTypesLoading(false);
    };
    loadAll();
  }, [dispatch]);

  const loadHolidays = async () => {
    if (!organization?.organization_id) return;
    try {
      const res = await fetch(`${getBackendURL()}/organization/holidays`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data: Holiday[] = await res.json();
      const normalized = data.map((h) => ({
        ...h,
        holiday_date: formatDateInput(h.holiday_date),
      }));
      setHolidays(normalized);
      dispatch(setHoliday(normalized));
    } catch (err) {
      console.error("Load holidays error:", err);
    }
  };

  const fetchLeaveBalances = async () => {
    try {
      const res = await fetch(`${getBackendURL()}/leave/leave-balances`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data: LeaveBalance[] = await res.json();
      dispatch(setLeaveBalance(data));
    } catch (err) {
      console.error("Load leave balances error:", err);
    }
  };

  const durationInDays = useMemo(() => {
    const { start_date, end_date } = formData;
    if (start_date && end_date) {
      const days =
        Math.ceil(
          (new Date(end_date).getTime() - new Date(start_date).getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1;
      return days > 0 ? days : 0;
    }
    return 0;
  }, [formData.start_date, formData.end_date]);

  const selectedBalance = useMemo(() => {
    return leaveBalance.find(
      (lb) => lb.leave_type_id === formData.leave_type_id
    );
  }, [formData.leave_type_id, leaveBalance]);

  useEffect(() => {
    const { start_date, end_date, leave_type_id } = formData;
    if (!start_date || !end_date || !leave_type_id) {
      setLiveError("");
      return;
    }

    if (new Date(start_date) > new Date(end_date)) {
      setLiveError("Start date cannot be after end date.");
      return;
    }

    if (new Date(start_date) < new Date(Date.now())) {
      setLiveError("You cannot apply leave for past days.");
      return;
    }

    const selectedDates = getDatesBetween(start_date, end_date);
    if (selectedDates.some((d) => holidays.some((h) => h.holiday_date === d))) {
      setLiveError("Selected range includes a holiday.");
      return;
    }

    if (!isLossOfPay && selectedBalance && selectedBalance.remaining === 0) {
      setLiveError("Leave balance for this type is exhausted.");
      return;
    }

    setLiveError("");
  }, [formData.start_date, formData.end_date, formData.leave_type_id, holidays]);

  const getDatesBetween = (start: string, end: string): string[] => {
    const dates = [];
    const current = new Date(start);
    const last = new Date(end);
    while (current <= last) {
      dates.push(formatDateInput(new Date(current).toISOString()));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (liveError) {
      toast.error(liveError);
      return;
    }
    if (!formData.reason || !formData.start_date || !formData.end_date) {
      toast.error("Please provide necessary details.");
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(requestLeave(formData)).unwrap();
      toast.success("Leave request submitted successfully!");
      dispatch(fetchAllLeaveRequests());
      setFormData({ leave_type_id: 0, start_date: "", end_date: "", reason: "" });
    } catch (err: any) {
      toast.error(err || "Failed to submit leave request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-none border-none bg-transparent">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center">
          <RiCalendarLine className="mr-2 text-ts12" /> Request New Leave
        </CardTitle>
        <CardDescription>
          Fill out the details for your leave of absence.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Leave Type */}
          <div className="flex justify-between items-baseline">
            <div>
            <Label htmlFor="leave_type" className="text-sm font-medium mb-2">
              Leave Type
            </Label>
            <Select
              onValueChange={(value) =>
                setFormData({ ...formData, leave_type_id: parseInt(value) })
              }
              value={
                formData.leave_type_id === 0
                  ? ""
                  : String(formData.leave_type_id)
              }
              disabled={typesLoading}
            >
              <SelectTrigger id="leave_type" className="bg-muted/30 cursor-pointer">
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((type) => (
                  <SelectItem
                    key={type.leave_type_id}
                    value={String(type.leave_type_id)}
                  >
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>
            {selectedBalance && (
              <p className="text-xs text-gray-500 flex items-center gap-0.5 mt-1">
                Remaining balance:{" "}
                {isLossOfPay ? (
                    <span className="inline-flex items-center gap-1">
                      <RiInfinityLine className="inline-block" size={12} /> days
                    </span>
                  ) : (
                    `${selectedBalance.remaining ?? 0} days`
                  )}
              </p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-4">
            <DatePickerField
              label="Start Date"
              value={formData.start_date}
              onSelect={(date) =>
                setFormData({ ...formData, start_date: date })
              }
            />
            <div className="space-y-2 text-center">
              <Label className="text-sm font-medium">Days</Label>
              <div className="flex items-center justify-center h-9 bg-gray-100 border rounded-lg">
                {durationInDays || "-"}
              </div>
            </div>
            <DatePickerField
              label="End Date"
              value={formData.end_date}
              onSelect={(date) => setFormData({ ...formData, end_date: date })}
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Reason
            </Label>
            <Textarea
              id="reason"
              name="reason"
              placeholder="State the reason for your leave..."
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              // required
              rows={4}
              className="bg-muted/30 resize-none"
            />
          </div>

          {/* Error */}
          {liveError && (
            <p className="text-sm text-red-500 font-medium">{liveError}</p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="w-1/3 mt-3.5 cursor-pointer flex bg-ts12 hover:bg-orange-400 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-md hover:shadow-ts12 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <RiLoader2Line className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RiMailSendLine className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const DatePickerField: React.FC<{
  label: string;
  value: string;
  onSelect: (date: string) => void;
}> = ({ label, value, onSelect }) => {
  const [open, setOpen] = useState(false);
  const selectedDate = value ? new Date(value) : undefined;
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal bg-muted/30 cursor-pointer"
          >
            {selectedDate ? selectedDate.toDateString() : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-0 w-fit">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => {
              if (d) onSelect(formatDateInput(d.toISOString()));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default LeaveRequestForm;