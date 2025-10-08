import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RiUser3Line, RiTeamLine, RiLoader2Line } from "@remixicon/react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getBackendURL } from "@/lib/utils";
import { useSelector , useDispatch } from "react-redux";
import type { RootState } from "@/lib/store/store";
import { setRelations } from "@/lib/store/slices/organizationSlice";
import type { RelationData, RelationType } from "@/lib/types/type";

const OrgRelations: React.FC = () => {
  const baseURL = getBackendURL();
  const dispatch = useDispatch();
  const { users , relations} = useSelector((state: RootState) => state.organization);
  const [loading, setLoading] = useState(true);

  const fetchRelations = async () => {
  try {
    setLoading(true);
    const res = await fetch(`${baseURL}/employee/relations/all`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) {
      toast.error("Failed to fetch organization relations");
      return;
    }
    const data = await res.json();
    if (data?.relations) {
      dispatch(setRelations(data.relations));
    } else {
      dispatch(
        setRelations({
          "employee-manager": [],
          "manager-hr": [],
        })
      );
    }
  } catch (err: any) {
    console.error("Error fetching relations:", err);
    toast.error("Failed to fetch organization relations");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (users?.length > 0) fetchRelations();
  }, [users]);

  const getUserName = (userId?: string) => {
    const u = users.find((x: any) => x.id === userId);
    return u ? `${u.first_name} ${u.last_name ?? ""}`.trim() : "—";
  };

  const relationTitles: Record<RelationType, string> = {
    "employee-manager": "Employee → Manager",
    "manager-hr": "Manager → HR",
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RiLoader2Line className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 "
    >
      <h2 className="text-2xl text-left font-bold">Organization Relations</h2>
      {Object.entries(relations).map(([key, list]) => {
        const type = key as RelationType;
        const unique = Array.from(
          new Map(list.map((item) => [JSON.stringify(item), item])).values()
        ); 
        return (
          <Card key={key} className="shadow-sm border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 ">
                <RiTeamLine className="w-5 h-5 text-ts12" />
                {relationTitles[type]}
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-3">
              {unique.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No relations found.
                </p>
              ) : (
                unique.map((rel: RelationData, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="flex items-center justify-between bg-accent/30 rounded-xl p-1"
                  >
                    <div className="flex items-center gap-2">
                      <RiUser3Line className="w-4 h-4 text-primary" />
                      {type === "employee-manager" && (
                        <span className="text-sm">
                          <strong>{getUserName(rel.employee_id)}</strong> →{" "}
                          {getUserName(rel.manager_id)}
                        </span>
                      )}
                      {type === "manager-hr" && (
                        <span className="text-sm">
                          <strong>{getUserName(rel.manager_id)}</strong> →{" "}
                          {getUserName(rel.hr_id)}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        );
      })}
    </motion.div>
  );
};

export default OrgRelations;
