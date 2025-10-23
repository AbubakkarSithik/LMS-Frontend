import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchAllUsersLeaveRequests } from "@/lib/store/slices/leaveRequestSlice";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RiArrowLeftSLine, RiArrowRightSLine, RiCalendarLine } from "@remixicon/react";
import type { RootState } from "@/lib/store/store";
import { cn, formatDateInput, getBackendURL } from "@/lib/utils";
import type { Holiday } from "@/lib/types/type";
import { setHoliday } from "@/lib/store/slices/organizationSlice";

const TeamListCalendar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { allUsersRequests } = useAppSelector((state: RootState) => state.leaveRequest);
  const { relations, holiday , organization } = useAppSelector((state: RootState) => state.organization);
  const { appUser } = useAppSelector((state: RootState) => state.auth);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
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
        dispatch(setHoliday(normalized));
      } catch (err) {
        console.error("Load holidays error:", err);
      }
    };
    dispatch(fetchAllUsersLeaveRequests());
    loadHolidays();
  }, [dispatch, organization?.organization_id]);

  // --- Date utils ---
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short", year: "numeric" });

  const formatDateLong = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const daysInMonth = getDaysInMonth(currentDate);
  const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  // Team logic
  const teammates = useMemo(() => {
    if (!relations || !appUser) return [];
    const managerRel = relations["employee-manager"] || [];
    const isManager = managerRel.some(r => r.manager_id === appUser.id);
    let teamIds: (string | undefined)[] = [];

    if (isManager) {
      // manager → show their team + self
      teamIds = managerRel
        .filter(r => r.manager_id === appUser.id)
        .map(r => r.employee_id);
      teamIds.push(appUser.id);
    } else {
      // employee → show peers + manager + self
      const myRelation = managerRel.find(r => r.employee_id === appUser.id);
      if (!myRelation?.manager_id) return [appUser.id];

      const peers = managerRel
        .filter(r => r.manager_id === myRelation.manager_id)
        .map(r => r.employee_id);
      teamIds = [...peers, myRelation.manager_id, appUser.id];
    }

    return Array.from(new Set(teamIds));
  }, [relations, appUser]);

  const visibleRequests = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return allUsersRequests.filter(req => {
      const start = new Date(req.start_date);
      return (
        req.status === 'Approved' && 
        teammates.includes(req.app_user.id) &&
        (start.getFullYear() === year && start.getMonth() === month)
      );
    });
  }, [allUsersRequests, teammates, currentDate]);

  const visibleHolidays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return holiday.filter(h => {
      const [y, m, d] = h.holiday_date.split('-').map(Number);
      const date = new Date(y, m - 1, d); // Create date using local timezone
      return date.getFullYear() === year && date.getMonth() === month;
    });
  }, [holiday, currentDate]);

  // empty state
  const shouldShowEmptyState = useMemo(() => {
    const hasOnlyAppUser = teammates.length === 1 && teammates[0] === appUser?.id;
    const hasNoApprovedLeaves = visibleRequests.length === 0;
    
    return hasOnlyAppUser ? hasNoApprovedLeaves : hasNoApprovedLeaves;
  }, [teammates, appUser, visibleRequests]);

  const goToPrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const isHoliday = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate(); 
    return visibleHolidays.some(h => {
      const [y, m, d] = h.holiday_date.split('-').map(Number);
      return y === year && m === month + 1 && d === day;
    });
  };

  const getLeaveRange = (date: Date, userId: string) => {
    return visibleRequests.find(req => {
      const start = new Date(req.start_date + 'T00:00:00');
      const end = new Date(req.end_date + 'T00:00:00');
      return req.app_user.id === userId && date >= start && date <= end;
    });
  };

  //dot 
  const getDayColor = (date: Date, userId: string) => {
    const day = date.getDay();

    if (isHoliday(date)) return "bg-green-500";

    if (day === 0 || day === 6) return "bg-yellow-400";
    const leave = getLeaveRange(date, userId);
    if (leave) {
      if (leave.leave_type.name.toLowerCase().includes("loss of pay"))
        return "bg-gray-400";
      return "bg-orange-500";
    }

    return "bg-transparent border border-gray-200";
  };

  const getBackgroundColor = (date: Date, userId: string) => {
    const leave = getLeaveRange(date, userId);
    if (!leave) return null;
    if (isHoliday(date)) {
      return "bg-green-500/20";
    }
    if (leave.leave_type.name.toLowerCase().includes("loss of pay")) {
      return "bg-gray-400/20";
    }
    return "bg-orange-500/20"; 
  };

  return (
    <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }} 
          className="bg-white">
      {/* Header */}
      <div className="flex justify-between items-center my-4">
        <Button variant="ghost" onClick={goToPrevMonth} size="icon">
          <RiArrowLeftSLine className="text-orange-500" />
        </Button>
        <h2 className="text-lg font-semibold text-gray-800">
          {formatDate(currentDate)}
        </h2>
        <Button variant="ghost" onClick={goToNextMonth} size="icon">
          <RiArrowRightSLine className="text-orange-500" />
        </Button>
      </div>

      {/* Empty State  */}
      {shouldShowEmptyState ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center py-8 px-4"
        >
          <div className="bg-orange-50 rounded-full p-6 mb-4">
            <RiCalendarLine className="w-12 h-12 text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Nobody is on leave for {formatDateLong(currentDate)}
          </h3>
          <p className="text-sm text-gray-500 text-center max-w-md">
            Check previous or next months to see team leave schedules
          </p>
        </motion.div>
      ) : (
        <>
          {/* Calendar Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                {/* Weekday names */}
                <tr className="text-gray-500 text-xs">
                  <th className="text-left py-1 w-32"></th>
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const date = new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      i + 1
                    );
                    const weekday = weekdays[(date.getDay() + 6) % 7];
                    return (
                      <th key={`day-${i}`} className="text-center w-8">
                        {weekday}
                      </th>
                    );
                  })}
                </tr>

                {/* Date numbers */}
                <tr className="text-gray-500 text-sm">
                  <th className="text-left py-2 w-32"></th>
                  {Array.from({ length: daysInMonth }, (_, i) => (
                    <th key={`num-${i}`} className="text-center w-8">
                      {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {teammates.map(empId => {
                  const userReq = allUsersRequests.find(r => r.app_user.id === empId);
                  const user = userReq?.app_user;
                  if (!user) return null;
                  return (
                    <tr key={empId} className="text-sm border-t">
                      <td className="py-2 pr-2 text-gray-700 font-medium whitespace-nowrap">
                        {user.first_name} {user.last_name}
                      </td>
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const date = new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth(),
                          i + 1
                        );
                        const bgColor = getBackgroundColor(date, empId!);
                        return (
                          <td key={i} className="text-center relative">
                            {bgColor && (
                              <div className={cn("absolute inset-0", bgColor)} />
                            )}
                            <div
                              className={cn(
                                "h-6 w-6 mx-auto rounded-full relative z-10",
                                getDayColor(date, empId!)
                              )}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Legend  */}
          <div className="flex gap-6 mt-6 text-sm text-gray-700 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" /> Holiday
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400" /> Weekly Off
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" /> Paid Leave
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400" /> Unpaid Leave
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default TeamListCalendar;