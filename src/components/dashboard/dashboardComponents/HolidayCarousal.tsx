import React, { useEffect, useState } from "react";
import type { RootState } from "@/lib/store/store";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { RiCalendar2Line, RiLoader2Line } from "@remixicon/react";
import type { Holiday } from "@/lib/types/type";
import { getBackendURL } from "@/lib/utils";

const HolidayCarousel: React.FC = () => {
  const { organization } = useSelector((state: RootState) => state.organization);
  const orgId = organization?.organization_id;
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const baseURL = getBackendURL();

  const formatDateDisplay = (d: string | Date) => {
    const date = typeof d === "string" ? new Date(d) : d;
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const loadUpcomingHolidays = async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/organization/holidays`, { credentials: "include" });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || "Failed to load holidays");
        setLoading(false);
        return;
      }
      const data: Holiday[] = await res.json();
      const today = new Date();
      const upcoming = data
        .filter((h) => new Date(h.holiday_date) >= today)
        .sort((a, b) => new Date(a.holiday_date).getTime() - new Date(b.holiday_date).getTime());

      setHolidays(upcoming);
    } catch (err) {
      console.error("Error loading holidays:", err);
      toast.error("Server error while loading holidays");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUpcomingHolidays();
  }, [orgId]);

  return (
    <div className="space-y-4 bg-white border rounded p-6">
        <h2 className="text-2xl font-semibold text-gray-800 flex gap-2 items-center border-b pb-2"><RiCalendar2Line className="text-ts12" />Upcoming Holidays</h2>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <RiLoader2Line className="animate-spin text-ts12" size={24} />
        </div>
      ) : holidays.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No upcoming holidays found.
        </div>
      ) : (
        <Carousel className="w-[80%] mx-auto">
          <CarouselContent>
            {holidays.map((h) => (
              <CarouselItem key={h.holiday_id}>
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="rounded-xl border-none w-[98%] mx-auto bg-gradient-to-br from-orange-100 via-orange-50 to-white hover:shadow-md transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-3xl font-light text-gray-800">
                        {h.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-1">
                      <div className="text-lg text-gray-600">
                        {formatDateDisplay(h.holiday_date)}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="cursor-pointer"/>
          <CarouselNext className="cursor-pointer"/>
        </Carousel>
      )}
    </div>
  );
};

export default HolidayCarousel;
