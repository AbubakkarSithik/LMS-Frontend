import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchAllUsersLeaveRequests } from "@/lib/store/slices/leaveRequestSlice";
import { Calendar, momentLocalizer, type View } from "react-big-calendar";
import moment from "moment";
import { motion } from "framer-motion";
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { RootState } from "@/lib/store/store";
import { formatDateInput, getBackendURL } from "@/lib/utils";
import type { Holiday } from "@/lib/types/type";
import { setHoliday } from "@/lib/store/slices/organizationSlice";
import { Button } from "@/components/ui/button";

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  resource: {
    type: 'leave' | 'holiday';
    leaveType?: string;
    userId?: string;
    userName?: string;
  };
}

const TeamGridCalender: React.FC = () => {
  const dispatch = useAppDispatch();
  const { allUsersRequests } = useAppSelector((state: RootState) => state.leaveRequest);
  const { relations, holiday, organization } = useAppSelector((state: RootState) => state.organization);
  const { appUser } = useAppSelector((state: RootState) => state.auth);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('month');

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

  // --- Team logic
  const teammates = useMemo(() => {
    if (!relations || !appUser) return [];
    const managerRel = relations["employee-manager"] || [];

    const isManager = managerRel.some(r => r.manager_id === appUser.id);
    let teamIds: (string | undefined)[] = [];

    if (isManager) {
      teamIds = managerRel
        .filter(r => r.manager_id === appUser.id)
        .map(r => r.employee_id);
      teamIds.push(appUser.id);
    } else {
      const myRelation = managerRel.find(r => r.employee_id === appUser.id);
      if (!myRelation?.manager_id) return [appUser.id];

      const peers = managerRel
        .filter(r => r.manager_id === myRelation.manager_id)
        .map(r => r.employee_id);
      teamIds = [...peers, myRelation.manager_id, appUser.id];
    }

    return Array.from(new Set(teamIds));
  }, [relations, appUser]);

  const hasLeavesForCurrentMonth = useMemo(() => {
    const monthStart = moment(currentDate).startOf('month');
    const monthEnd = moment(currentDate).endOf('month');

    return allUsersRequests.some(req => {
      if (req.status !== 'Approved' || !teammates.includes(req.app_user.id)) {
        return false;
      }

      const leaveStart = moment(req.start_date);
      const leaveEnd = moment(req.end_date);
      return leaveStart.isSameOrBefore(monthEnd) && leaveEnd.isSameOrAfter(monthStart);
    });
  }, [allUsersRequests, teammates, currentDate]);

  // --- Check if user is alone (only their ID in teammates) ---
  const isUserAlone = useMemo(() => {
    return teammates.length === 1 && appUser && teammates.includes(appUser.id);
  }, [teammates, appUser]);

  // --- Should show empty state ---
  const shouldShowEmptyState = useMemo(() => {
    return isUserAlone || !hasLeavesForCurrentMonth;
  }, [isUserAlone, hasLeavesForCurrentMonth]);

  // --- Create events for calendar ---
  const events = useMemo((): CalendarEvent[] => {
    const calendarEvents: CalendarEvent[] = [];

    allUsersRequests
      .filter(req => req.status === 'Approved' && teammates.includes(req.app_user.id))
      .forEach(req => {
        const start = new Date(req.start_date + 'T00:00:00');
        const end = new Date(req.end_date + 'T23:59:59');
        
        const startStr = moment(start).format('DD/MM/YY');
        const endStr = moment(end).format('DD/MM/YY');
        const dateRange = startStr === endStr ? startStr : `${startStr} - ${endStr}`;
        
        calendarEvents.push({
          title: `${req.app_user.first_name} ${req.app_user.last_name} (${dateRange})`,
          start,
          end,
          resource: {
            type: 'leave',
            leaveType: req.leave_type.name,
            userId: req.app_user.id,
            userName: `${req.app_user.first_name} ${req.app_user.last_name}`,
          },
        });
      });

    // Add holidays
    holiday.forEach(h => {
      const start = new Date(h.holiday_date + 'T00:00:00');
      const end = new Date(h.holiday_date + 'T23:59:59');
      calendarEvents.push({
        title: `🎉 ${h.name}`,
        start,
        end,
        resource: {
          type: 'holiday',
        },
      });
    });

    return calendarEvents;
  }, [allUsersRequests, teammates, holiday]);

  // --- Event styling ---
  const eventStyleGetter = (event: CalendarEvent) => {
    const { type, leaveType } = event.resource;

    if (type === 'holiday') {
      return {
        style: {
          backgroundColor: '#008236',
          borderColor: '#16a34a',
          color: 'white',
          borderRadius: '4px',
          opacity: 0.9,
        },
      };
    }

    if (type === 'leave') {
      const isUnpaid = leaveType?.toLowerCase().includes('loss of pay');
      return {
        style: {
          backgroundColor: isUnpaid ? '#9ca3af' : '#f97316',
          borderColor: isUnpaid ? '#6b7280' : '#ea580c',
          color: 'white',
          borderRadius: '4px',
          opacity: 0.85,
        },
      };
    }

    return {};
  };

  // --- Day styling ---
  const dayStyleGetter = (date: Date) => {
    const day = date.getDay();
    if (day === 0 || day === 6) {
      return {
        style: {
          backgroundColor: '#fef3c7',
        },
      };
    }
    return {};
  };

  // --- Handle navigation ---
  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  return (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }} 
        className="bg-white">
      {shouldShowEmptyState ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }} 
          className="flex flex-col items-center justify-center my-5">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-ts12 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nobody is on leave for {moment(currentDate).format('MMMM YYYY')}
            </h3>
            <p className="text-sm text-gray-500">
              Navigate to a different month to check team availability
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <Button
                onClick={() => handleNavigate(moment(currentDate).subtract(1, 'month').toDate())}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-800 rounded-md hover:bg-orange-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-ts12 cursor-pointer"
              >
                Previous Month
              </Button>
              <Button
                onClick={() => handleNavigate(moment(currentDate).add(1, 'month').toDate())}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-800 rounded-md hover:bg-orange-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-ts12 cursor-pointer"
              >
                Next Month
              </Button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div style={{ height: '530px' }} className="my-5">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={setView}
            date={currentDate}
            onNavigate={handleNavigate}
            eventPropGetter={eventStyleGetter}
            dayPropGetter={dayStyleGetter}
            views={['month', 'week']}
            popup
            style={{ height: '100%' }}
            tooltipAccessor={(event) => event.title}
          />
        </div>
      )}

      {!shouldShowEmptyState && (
        <div className="flex gap-6 mt-6 text-sm text-gray-700 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-700" /> Holiday
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#fef3c7' }} /> Weekly Off
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500" /> Paid Leave
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-400" /> Unpaid Leave
          </div>
        </div>
      )}
    </motion.div>
  );
};
 
export default TeamGridCalender;  