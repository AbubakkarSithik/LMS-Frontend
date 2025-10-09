import React, { useEffect, useState } from "react";
import type { RootState } from "@/lib/store/store";
import { useDispatch, useSelector } from "react-redux";
import { setLeaveBalance } from "@/lib/store/slices/leaveSlice";
import { setLeaveTypes } from "@/lib/store/slices/organizationSlice";
import { toast } from "sonner";
import type { LeaveBalance, LeaveTypes } from "@/lib/types/type";
import { RiLoader2Line } from "@remixicon/react";
import { getBackendURL } from "@/lib/utils";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const LeaveBalanceStats: React.FC = () => {
  const dispatch = useDispatch();
  const { leaveBalance } = useSelector((state: RootState) => state.leave);
  const { leave_types } = useSelector((state: RootState) => state.organization);
  const [loading, setLoading] = useState<boolean>(true);
  const baseURL = getBackendURL();

  const fetchLeaveTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/organization/leave-types`, { credentials: "include" });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || "Failed to load leave types");
        return;
      }
      const data: LeaveTypes[] = await res.json();
      dispatch(setLeaveTypes(data));
    } catch (err) {
      console.error("Load leave types error:", err);
      toast.error("Server error while loading leave types");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveBalances = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/leave/leave-balances`, { credentials: "include" });
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
    fetchLeaveBalances();
  }, []);

  function extractAbbreviation(name: string): string {
    const match = name.match(/\(([^)]+)\)/);
    return match ? match[1] : name === "Maternity/Paternity Leave" ? "ML" : name;
  }

  const filteredBalances =
    leaveBalance
      ?.map((lb) => {
        const lt = leave_types.find((lt) => lt.leave_type_id === lb.leave_type_id);
        if (!lt) return null;
        const abbr = extractAbbreviation(lt.name);
        if (abbr === "LOP") return null;
        return { ...lb, abbreviation: abbr, fullName: lt.name };
      })
      .filter((lb) => lb !== null) || [];

  return (
    <>
    <h2 className="text-2xl font-semibold text-black mb-2 text-left">Leave Balance</h2>
    <div className="p-0 bg-transparent grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {loading ? (
        <div className="flex items-center justify-center py-8 col-span-full">
          <RiLoader2Line className="animate-spin text-ts12" size={26} />
        </div>
      ) : filteredBalances.length > 0 ? (
        filteredBalances.map((lb, i) => {
          const chartData = {
            labels: ["Used", "Remaining"],
            datasets: [
              {
                data: [lb!.total_used, lb!.remaining],
                backgroundColor: ["#FFB81C", "#2E2252"],
                borderWidth: 2,
                hoverOffset: 6,
              },
            ],
          };

          const chartOptions = {
            cutout: "70%",
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (tooltipItem: any) =>
                    `${tooltipItem.label}: ${tooltipItem.formattedValue}`,
                },
              },
            },
          };

          return (
            <motion.div
              key={lb!.leave_type_id}
              className="bg-white/80 backdrop-blur-lg rounded shadow-sm p-0 flex flex-col items-center justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 m-2">{lb!.fullName}</h3>
              <div className="w-40 h-40 flex items-center justify-center">
                <Doughnut data={chartData} options={chartOptions} />
              </div>
              <div className="text-sm text-gray-600 mt-4 w-full text-center grid grid-cols-2 gap-2 border p-1">
                <div className="border-r">
                  <p className="text-xs text-gray-500">Available</p>
                  <p className="font-semibold">{lb!.remaining}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Consumed</p>
                  <p className="font-semibold">{lb!.total_used}</p>
                </div>
                <div className="col-span-2 border-t flex justify-center p-1">
                  <div>
                  <p className="text-xs text-gray-500">Annual Quota</p>
                  <p className="font-semibold">{lb!.total_allocated}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })
      ) : (
        <p className="text-center text-gray-400 col-span-full">
          No leave balance data available.
        </p>
      )}
    </div>
    </>
  );
};

export default LeaveBalanceStats;
