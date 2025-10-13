import React, { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchAllLeaveHistory } from "@/lib/store/slices/leaveRequestSlice";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RiBarChartLine, RiLoader2Line } from "@remixicon/react";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const LeavePatternAnalyzer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { history, error } = useAppSelector((state) => state.leaveRequest);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      await dispatch(fetchAllLeaveHistory());
      setIsLoading(false);
      if (error) toast.error(error);
    };
    fetchHistory();
  }, [dispatch, error]);

  const getDayName = (date: string) =>
    ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][new Date(date).getDay()];

  const getMonthName = (date: string) =>
    ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][
      new Date(date).getMonth()
    ];

  const approvedLeaves = useMemo(
    () => history?.filter((l) => l.status === "Approved") || [],
    [history]
  );

  const weeklyStats = useMemo(() => {
    const counts: Record<string, number> = {
      SUN: 0,
      MON: 0,
      TUE: 0,
      WED: 0,
      THU: 0,
      FRI: 0,
      SAT: 0,
    };

    approvedLeaves.forEach((leave) => {
      let current = new Date(leave.start_date);
      const end = new Date(leave.end_date);
      while (current <= end) {
        const day = getDayName(current.toISOString());
        counts[day]++;
        current.setDate(current.getDate() + 1);
      }
    });
    return counts;
  }, [approvedLeaves]);

  const monthlyStats = useMemo(() => {
    const counts: Record<string, number> = {
      JAN: 0,
      FEB: 0,
      MAR: 0,
      APR: 0,
      MAY: 0,
      JUN: 0,
      JUL: 0,
      AUG: 0,
      SEP: 0,
      OCT: 0,
      NOV: 0,
      DEC: 0,
    };

    approvedLeaves.forEach((leave) => {
      let current = new Date(leave.start_date);
      const end = new Date(leave.end_date);
      while (current <= end) {
        const month = getMonthName(current.toISOString());
        counts[month]++;
        current.setDate(current.getDate() + 1);
      }
    });
    return counts;
  }, [approvedLeaves]);

  const weeklyData = {
    labels: Object.keys(weeklyStats),
    datasets: [
      {
        label: "Days on Leave",
        data: Object.values(weeklyStats),
        backgroundColor: "rgba(46, 34, 82 , 0.8)",
      },
    ],
  };

  const monthlyData = {
    labels: Object.keys(monthlyStats),
    datasets: [
      {
        label: "Days on Leave",
        data: Object.values(monthlyStats),
        backgroundColor: "rgba(46, 34, 82,0.8)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.raw} days`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#6B7280", font: { size: 12 } },
      },
      y: {
        grid: { display : false },
        ticks: { color: "#6B7280", stepSize: 1 },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
      {/* Weekly Stats */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="shadow-none border rounded p-6">
          <CardHeader className="pb-4 border-b p-0">
            <CardTitle className="text-2xl font-semibold text-black text-left flex items-center gap-2">
              <RiBarChartLine size={25} className="text-ts12"/> Weekly Stats
            </CardTitle>
            <CardDescription className="text-sm text-left text-gray-800">
              Your days-over-week leave utilization during the year.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center p-0">
            {isLoading ? (
              <RiLoader2Line className="animate-spin text-blue-500 w-6 h-6" />
            ) : (
              <Bar data={weeklyData} options={chartOptions} />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Monthly Stats */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="shadow-none border rounded p-6">
          <CardHeader className="pb-4 border-b p-0">
            <CardTitle className="text-2xl text-left font-semibold text-black flex items-center gap-2">
              <RiBarChartLine size={25} className="text-ts12"/> Monthly Stats
            </CardTitle>
            <CardDescription className="text-sm text-left text-gray-800">
              Your days-over-month leave utilization during the year.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center p-0">
            {isLoading ? (
              <RiLoader2Line className="animate-spin text-green-500 w-6 h-6" />
            ) : (
              <Bar data={monthlyData} options={chartOptions} />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LeavePatternAnalyzer;
