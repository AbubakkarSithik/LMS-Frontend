import React, { useEffect, useState, useMemo } from "react";
import { requestLeave, fetchLeaveTypes, fetchAllLeaveRequests } from "@/lib/store/slices/leaveRequestSlice";
import type { LeaveRequestPayload, LeaveBalance, Holiday } from "@/lib/types/type";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RiCalendarLine, RiMailSendLine, RiLoader2Line, RiInfinityLine, RiCalendarCheckLine } from "@remixicon/react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { formatDateInput, getBackendURL } from "@/lib/utils";
import { setLeaveBalance } from "@/lib/store/slices/leaveSlice";
import { setHoliday } from "@/lib/store/slices/organizationSlice";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import LeaveRangePreview from "./LeaveRangePreview";

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

  const selectedType = useMemo(
    () => leaveTypes.find((t) => t.leave_type_id === formData.leave_type_id),
    [leaveTypes, formData.leave_type_id]
  );
  const isLossOfPay = useMemo(
    () => !!selectedType?.name?.toLowerCase().includes("loss of pay"),
    [selectedType]
  );

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

  const normalize = (d: Date) => formatDateInput(d);
  const getDatesBetween = (start: string, end: string): string[] => {
    const dates: string[] = [];
    const curr = new Date(start);
    const last = new Date(end);
    while (curr <= last) {
      dates.push(normalize(new Date(curr)));
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  const selectedBalance = useMemo(() => {
    return leaveBalance.find((lb) => lb.leave_type_id === formData.leave_type_id);
  }, [formData.leave_type_id, leaveBalance]);

  const {
    totalDays,
    weekendDates,
    holidayDates,
    workingDates,
  } = useMemo(() => {
    const start = formData.start_date;
    const end = formData.end_date;
    if (!start || !end) {
      return { totalDays: 0, weekendDates: [], holidayDates: [], excludedDatesSet: new Set<string>(), workingDates: [] };
    }

    const allDates = getDatesBetween(start, end);
    const weekendDates: string[] = [];
    const holidayDates: string[] = [];

    for (const d of allDates) {
      const dt = new Date(d);
      const day = dt.getDay();
      if (day === 0 || day === 6) weekendDates.push(d);
      if (holidays.some((h) => h.holiday_date === d)) holidayDates.push(d);
    }

    const excludedDatesSet = new Set<string>([...weekendDates, ...holidayDates]);
    const workingDates = allDates.filter((d) => !excludedDatesSet.has(d));

    return {
      totalDays: allDates.length,
      weekendDates,
      holidayDates,
      excludedDatesSet,
      workingDates,
    };
  }, [formData.start_date, formData.end_date, holidays]);

  const effectiveDays = workingDates.length;

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

    const today = new Date();
    today.setHours(0,0,0,0);
    if (new Date(start_date) < today) {
      setLiveError("You cannot apply leave for past days.");
      return;
    }

    if (start_date === end_date) {
      const d = normalize(new Date(start_date));
      const isWeekend = (new Date(d).getDay() === 0) || (new Date(d).getDay() === 6);
      const isHoliday = holidays.some((h) => h.holiday_date === d);
      if (isWeekend || isHoliday) {
        setLiveError("Selected single day is a weekend or a holiday.");
        return;
      }
    }

    if (effectiveDays === 0) {
      setLiveError("Selected range contains no valid leave days (all are weekends or holidays).");
      return;
    }

    if (!isLossOfPay && selectedBalance && selectedBalance.remaining !== null) {
      if (selectedBalance.remaining < effectiveDays) {
        setLiveError(`Insufficient balance: you have ${selectedBalance.remaining} days remaining but selected ${effectiveDays} leave days.`);
        return;
      }
    }

    setLiveError("");
  }, [
    formData.start_date,
    formData.end_date,
    formData.leave_type_id,
    holidays,
    effectiveDays,
    isLossOfPay,
    selectedBalance,
  ]);

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

  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <Card className="max-w-4xl mx-auto shadow-none border-none bg-transparent">
      <CardHeader className="flex items-start justify-between">
        <div>
          <CardTitle className="text-2xl text-primary flex items-center">
            <RiCalendarLine className="mr-2 text-ts12" /> Request New Leave
          </CardTitle>
          <CardDescription>Fill out the details for your leave of absence.</CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            {formData.start_date && formData.end_date && <DialogTrigger asChild>
              <Button variant="outline" className="text-sm cursor-pointer">
                <RiCalendarCheckLine className="mr-2" /> Preview Calender
              </Button>
            </DialogTrigger>}
            <LeaveRangePreview open={previewOpen} formData={formData} holidays={holidays} totalDays={totalDays} weekendDates={weekendDates} holidayDates={holidayDates} effectiveDays={effectiveDays} selectedBalance={selectedBalance} isLossOfPay={isLossOfPay} getDatesBetween={getDatesBetween} />
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="w-3/4">
              <Label htmlFor="leave_type" className="text-sm font-medium mb-2">
                Leave Type
              </Label>
              <Select
                onValueChange={(value) =>
                  setFormData({ ...formData, leave_type_id: parseInt(value) })
                }
                value={formData.leave_type_id === 0 ? "" : String(formData.leave_type_id)}
                disabled={typesLoading}
              >
                <SelectTrigger id="leave_type" className="bg-muted/30 cursor-pointer">
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type.leave_type_id} value={String(type.leave_type_id)}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-1/4 pl-4">
              {selectedBalance && (
                <p className="text-xs text-gray-500 flex items-center gap-0.5">
                  Remaining:&nbsp;
                  {isLossOfPay ? (
                    <span className="inline-flex items-center gap-1">
                      <RiInfinityLine size={12} /> Unlimited
                    </span>
                  ) : (
                    <span className="font-semibold text-gray-700">{selectedBalance.remaining ?? 0} days</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-4">
            <DatePickerField
              label="Start Date"
              value={formData.start_date}
              onSelect={(date) => setFormData({ ...formData, start_date: date })}
            />
            <div className="space-y-2 text-center">
              <Label className="text-sm font-medium">Days</Label>
              <div className="flex items-center justify-center h-9 bg-gray-100 border rounded-lg">
                {effectiveDays || "-"}
              </div>
              <div className="text-xs text-muted-foreground">Total: {totalDays}</div>
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
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={4}
              className="bg-muted/30 resize-none"
            />
          </div>

          {/* Error */}
          {liveError && <p className="text-sm text-red-500 font-medium">{liveError}</p>}

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