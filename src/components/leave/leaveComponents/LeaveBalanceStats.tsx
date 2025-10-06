import React, { useEffect, useState } from "react";
import type { RootState } from "@/lib/store/store";
import { useDispatch, useSelector } from "react-redux";
import { setLeaveBalance } from "@/lib/store/slices/leaveSlice";
import { setLeaveTypes } from "@/lib/store/slices/organizationSlice";
import { toast } from "sonner";
import type { LeaveBalance, LeaveTypes } from "@/lib/types/type";
import { RiLoader2Line } from "@remixicon/react";
import { getBackendURL } from "@/lib/utils";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import type { ChartOptions , TooltipItem } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LeaveBalanceStats: React.FC = () => {
  const dispatch = useDispatch();
  const { leaveBalance } = useSelector((state: RootState) => state.leave);
  const { leave_types } = useSelector((state: RootState) => state.organization);
  const [loading, setLoading] = useState<boolean>(true);
  const baseURL = getBackendURL();

  // --- Fetch Leave Types ---
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

  // --- Fetch Leave Balances ---
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

  const labels = filteredBalances.map((lb) => lb!.abbreviation);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Allocated",
        data: filteredBalances.map((lb) => lb!.total_allocated),
        backgroundColor: "rgba(255, 165, 0, 0.8)",
      },
      {
        label: "Used",
        data: filteredBalances.map((lb) => lb!.total_used),
        backgroundColor: "rgba(255, 99, 71, 0.8)",
      },
      {
        label: "Remaining",
        data: filteredBalances.map((lb) => lb!.remaining),
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderColor: "rgba(255, 165, 0, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#000" },
      },
      title: {
        display: true,
        text: "Leave Stats",
        color: "#ff4d00",
        font: { size: 18 },
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems: TooltipItem<"bar">[]) => {
            const index = tooltipItems[0].dataIndex;
            const fullName = filteredBalances[index]?.fullName || "Unknown Leave";
            return fullName;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#000" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      y: {
        ticks: { color: "#000" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  };

  return (
    <div className="p-6 bg-transparent max-w-[500px] backdrop-blur-md border border-gray-300 shadow-md text-white">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <RiLoader2Line className="animate-spin text-ts12" size={26} />
        </div>
      ) : (
        <>
          {filteredBalances.length > 0 ? (
            <Bar options={chartOptions} data={chartData} />
          ) : (
            <p className="text-center text-gray-300">No leave balance data available.</p>
          )}
        </>
      )}
    </div>
  );
};

export default LeaveBalanceStats;
