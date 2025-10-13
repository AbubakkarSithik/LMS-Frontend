import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store/store";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RiBarChartBoxLine, RiLoader2Line } from "@remixicon/react";
import { getBackendURL } from "@/lib/utils";
import { toast } from "sonner";
import type { LeaveBalance } from "@/lib/types/type";
import { setLeaveBalance } from "@/lib/store/slices/leaveSlice";
import { useAppDispatch } from "@/lib/hooks";
import { fetchLeaveTypes } from "@/lib/store/slices/leaveRequestSlice";

const ConsumptionStatus: React.FC = () => {
  const { leaveBalance } = useSelector((state: RootState) => state.leave);
  const { leaveTypes } = useSelector((state: RootState) => state.leaveRequest);
  const [typesLoading, setTypesLoading] = React.useState(false);
  const dispatch = useAppDispatch();

  const fetchLeaveBalances = async () => {
      try {
        const res = await fetch(`${getBackendURL()}/leave/leave-balances`, { credentials: "include" });
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          toast.error(err?.error || "Failed to load leave balances");
          return;
        }
        const data: LeaveBalance[] = await res.json();
        dispatch(setLeaveBalance(data));
      } catch (err) {
        console.error("Load leave balances error:", err);
        toast.error("Server error while loading leave balances");
      } 
    };

  useEffect(() => {
    setTypesLoading(true);
    dispatch(fetchLeaveTypes());
    fetchLeaveBalances();
    setTypesLoading(false);
  }, [dispatch]);

  const merged = leaveBalance
    ?.map((lb) => {
      const lt = leaveTypes.find((lt) => lt.leave_type_id === lb.leave_type_id);
      if (!lt) return null;
      return {
        ...lb,
        name: lt.name,
        abbreviation: lt.name.match(/\(([^)]+)\)/)?.[1] || lt.name,
      };
    })
    .filter((item) => item !== null);

  if (!merged || merged.length === 0) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-400 text-sm">

        No leave data available.
      </div>
    );
  }

  if (typesLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
        <RiLoader2Line className="h-8 w-8 text-ts12 animate-spin" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <motion.div
        className="bg-white rounded border p-6 shadow-none max-w-sm"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 border-b pb-2 mb-4">
          <RiBarChartBoxLine size={20} className="text-ts12" />
           Leave Consumption
        </h2>

        <Card className="shadow-none border-none rounded-none p-0">
          <CardContent className="space-y-2">
            {merged.map((lb, i) => {
              if (!lb) return null;
              const percentage =
                lb.total_allocated > 0
                  ? Math.round(((lb.total_used || 0) / lb.total_allocated) * 100)
                  : 0;

              const remaining = lb.remaining;
              const total = lb.total_allocated;

              return (
                <Tooltip key={lb.leave_type_id}>
                  <TooltipTrigger asChild>
                    <motion.div
                      className="space-y-0"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-medium text-gray-700 truncate">{lb.name}</h3>
                        <span
                          className={`text-xs font-semibold ${
                            percentage > 80 ? "text-red-500" : "text-green-600"
                          }`}
                        >
                          {percentage}%
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2 rounded-full" />
                    </motion.div>
                  </TooltipTrigger>

                  <TooltipContent
                    side="top"
                    className="bg-gray-900 text-white p-3 rounded-md text-xs"
                  >
                    <div className="space-y-1">
                      <p>
                        <span className="font-medium text-gray-300">Annual Quota:</span>{" "}
                        {total}
                      </p>
                      <p>
                        <span className="font-medium text-gray-300">Consumed:</span>{" "}
                        {lb.total_used}
                      </p>
                      <p>
                        <span className="font-medium text-gray-300">Available:</span>{" "}
                        {remaining}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
};

export default ConsumptionStatus;
