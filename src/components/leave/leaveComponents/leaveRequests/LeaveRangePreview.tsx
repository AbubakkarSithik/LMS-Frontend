import React, { useMemo } from "react";
import { DialogContent, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { RiCalendarCheckLine, RiInfinityLine } from "@remixicon/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Holiday, LeaveBalance } from "@/lib/types/type";

interface LeaveRangePreviewProps {
  open: boolean; 
  formData: { start_date?: string; end_date?: string };
  holidays: Holiday[];
  totalDays: number;
  weekendDates: string[];
  holidayDates: string[];
  effectiveDays: number;
  selectedBalance: LeaveBalance| undefined;
  isLossOfPay: boolean;
  getDatesBetween: (start: string, end: string) => string[];
}

const LeaveRangePreview: React.FC<LeaveRangePreviewProps> = ({
  open,
  formData,
  holidays,
  totalDays,
  weekendDates,
  holidayDates,
  effectiveDays,
  selectedBalance,
  isLossOfPay,
  getDatesBetween,
}) => {

  const safeDays = useMemo(() => {
    if (!formData?.start_date || !formData?.end_date) return [];
    try {
      const days = getDatesBetween(formData.start_date, formData.end_date);
      return Array.isArray(days) ? days : [];
    } catch {
      return [];
    }
  }, [formData, getDatesBetween]);

  const formattedSafeDays = safeDays
  .filter((date): date is string => typeof date === "string" && date.trim() !== "")
  .map((date) => date);

  const hasValidDates =
    safeDays.length > 0 &&
    !isNaN(new Date(formData.start_date ?? "").getTime()) &&
    !isNaN(new Date(formData.end_date ?? "").getTime());

  const firstDayIndex = hasValidDates
    ? Math.max(0, new Date(safeDays[0]).getDay())
    : 0;
  const emptySlots = Array.from({ length: firstDayIndex });

  if (!open) return null;

  return (
    <DialogContent className="max-w-3xl">
      <DialogDescription className="sr-only"></DialogDescription>
      <DialogTitle className="flex items-center gap-1 mb-3">
        <RiCalendarCheckLine className="text-ts12" size={20} />
        Leave Range Preview
      </DialogTitle>

      {!hasValidDates ? (
        <p className="text-sm text-muted-foreground text-center mt-3">
          Please select a valid date range to preview your leave pattern.
        </p>
      ) : (
        <>
          {/* Calendar Grid */}
          <div className="p-4 border rounded-lg bg-muted/30">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground mb-2">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {[...emptySlots, ...formattedSafeDays].map((date, idx) => {
                  if (!date)
                    return (
                      <div key={`empty-${idx}`} className="h-20 bg-transparent"></div>
                    );

                  const d = new Date(String(date));
                  if (isNaN(d.getTime()))
                    return (
                      <div key={`invalid-${idx}`} className="h-20 bg-transparent"></div>
                    );

                  const isWeekend = d.getDay() === 6 || d.getDay() === 0;
                  const holiday = holidays.find((h) => h.holiday_date === date);

                  let bgClass =
                    "bg-green-100 text-green-800 border-green-300 hover:border-green-400";
                  let tooltipText = "Working day";

                  if (holiday) {
                    bgClass =
                      "bg-yellow-100 text-yellow-800 border-yellow-300 hover:border-yellow-400";
                    tooltipText = holiday.name || "Holiday";
                  } else if (isWeekend) {
                    bgClass =
                      "bg-gray-100 text-gray-700 border-gray-300 hover:border-gray-400";
                    tooltipText = "Weekend";
                  }

                  return (
                    <TooltipProvider key={String(date)}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className={`h-16 flex flex-col items-center justify-center rounded-lg border text-sm font-medium cursor-default transition-all ${bgClass}`}
                          >
                            <div className="text-base font-semibold">{d.getDate()}</div>
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{tooltipText}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
            </div>
          </div>

          {/* Legend */}
          <div className=" flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-100 border border-green-300"></div>
              <span>Working Day</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gray-100 border border-gray-300"></div>
              <span>Weekend</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300"></div>
              <span>Holiday</span>
            </div>
          </div>

          {/* Summary */}
          <div className="p-3 border rounded-lg bg-muted/30 text-sm space-y-2">
            <div className="flex justify-between">
              <span>Total days:</span>
              <span className="font-medium">{totalDays || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Excluded Week-off days:</span>
              <span className="font-medium">{weekendDates?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Excluded Holidays:</span>
              <span className="font-medium">{holidayDates?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Effective days:</span>
              <span className="font-semibold">{effectiveDays || 0}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Remaining balance for selected type:
              </span>
              <div className="text-xs font-medium">
                {isLossOfPay ? (
                  <span className="inline-flex items-center gap-1">
                    <RiInfinityLine size={14} /> Unlimited (LOP)
                  </span>
                ) : selectedBalance ? (
                  `${selectedBalance.remaining ?? 0} days`
                ) : (
                  "No Leave Type selected"
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <DialogFooter className="sr-only"></DialogFooter>
    </DialogContent>
  );
};

export default LeaveRangePreview;
