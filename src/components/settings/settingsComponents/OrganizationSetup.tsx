import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { RiAddLine, RiDeleteBin6Line, RiLoader2Line } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { getBackendURL } from "@/lib/utils";
import type { Relation } from "@/lib/types/type";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store/store";

const relationConfig: Record<string, string[]> = {
  "employee-manager": ["employee", "manager"],
  "hr-admin": ["hr", "admin"],
  "manager-hr": ["manager", "hr"],
};

interface SavedRelation {
  id: string;
  type: string;
  employee?: string;
  manager?: string;
  hr?: string;
  admin?: string;
}

const OrganizationSetup: React.FC = () => {
  const baseURL = getBackendURL();
  const { users } = useSelector((state: RootState) => state.organization);

  const [loading, setLoading] = useState(false);
  const [relationType, setRelationType] = useState<keyof typeof relationConfig>("employee-manager");
  const [formData, setFormData] = useState<Relation>({});
  const [savedRelations, setSavedRelations] = useState<SavedRelation[]>([]);

  const selectedUserIds = useMemo(() => Object.values(formData).filter(Boolean), [formData]);

  const fetchRelations = async () => {
    setLoading(true);
    try {
      const allRelations: SavedRelation[] = [];

      for (const type of Object.keys(relationConfig)) {
        for (const user of users) {
          const res = await fetch(`${baseURL}/employee/relations/${type}/${user.id}`, {
            credentials: "include",
          });

          if (res.ok) {
            const data = await res.json();
            if (data && Object.keys(data).length > 0) {
              allRelations.push({ id: Date.now() + Math.random().toString(), type, ...data });
            }
          }
        }
      }

      setSavedRelations(allRelations);
    } catch (err) {
      console.error("Fetch relations error:", err);
      toast.error("Server error while fetching relations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRelations();
  }, [users]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };


  const saveRelation = async () => {
    const requiredFields = relationConfig[relationType];
    if (!requiredFields.every((field) => formData[field as keyof Relation])) {
      toast.error("Please fill all required fields!");
      return;
    }

    setLoading(true);
    const payload: any = {};
    requiredFields.forEach((field) => {
      switch (field) {
        case "employee": payload["employee_id"] = formData[field as keyof Relation]; break;
        case "manager": payload["manager_id"] = formData[field as keyof Relation]; break;
        case "hr": payload["hr_id"] = formData[field as keyof Relation]; break;
        case "admin": payload["admin_id"] = formData[field as keyof Relation]; break;
      }
    });

    try {
      const res = await fetch(`${baseURL}/employee/${relationType}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || "Failed to save relation");
      } else {
        toast.success("Saved successfully!");
        setFormData({});
        fetchRelations(); // Refresh list after save
      }
    } catch (err) {
      console.error("Save relation error:", err);
      toast.error("Server error while saving relation");
    } finally {
      setLoading(false);
    }
  };


  const deleteRelation = async (rel: SavedRelation) => {
    const keyField = rel.type === "employee-manager" ? rel.employee :
                     rel.type === "hr-admin" ? rel.hr : rel.manager;
    if (!keyField) return;

    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/employee/${rel.type}/${keyField}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || "Failed to delete relation");
      } else {
        toast.success("Deleted successfully!");
        fetchRelations(); // Refresh list after delete
      }
    } catch (err) {
      console.error("Delete relation error:", err);
      toast.error("Server error while deleting relation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-fit bg-transparent">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold mb-2 text-ts12">
        Organization Setup
      </motion.h1>

      <Card className="shadow-none border-none bg-transparent mb-4">
        <CardHeader className="mt-0">
          <CardTitle>Relation Type</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 flex-col justify-center">
        <div className="flex justify-center gap-4">
          {Object.keys(relationConfig).map((type) => (
            <Button
              key={type}
              variant={relationType === type ? "default" : "outline"}
              onClick={() => {
                setRelationType(type as keyof typeof relationConfig);
                setFormData({});
              }}
              className="cursor-pointer"
            >
              {type.replace("-", " ").toUpperCase()}
            </Button>
          ))}
          </div>
          <Separator className="my-2 bg-ts12/50" />
          <div className="space-y-4">
            {relationConfig[relationType].map((field) => (
            <Select
              key={field}
              value={formData[field as keyof Relation] || ""}
              onValueChange={(val) => handleChange(field, val)}
            >
              <SelectTrigger className="w-full cursor-pointer">
                <SelectValue placeholder={field.replace("_", " ").toUpperCase()} />
              </SelectTrigger>
              <SelectContent className="cursor-pointer w-1/3">
                {users
                  .filter((user) => !selectedUserIds.includes(user.id) || formData[field as keyof Relation] === user.id)
                  .map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          ))}

          <Button
            onClick={saveRelation}
            className="w-max cursor-pointer flex bg-ts12 hover:bg-orange-400 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-md hover:shadow-ts12 text-white"
            disabled={loading}
          >
            {loading ? <RiLoader2Line className="animate-spin" /> : <RiAddLine />} Save
          </Button>

          </div>
        </CardContent>
      </Card>
      
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex flex-col gap-2">
        {savedRelations.length > 0 && (
          <Card className="shadow-none border-none bg-transparent">
            <CardHeader>
              <CardTitle className="text-2xl font-bold mb-2 text-ts12">Employee Relations</CardTitle>
            </CardHeader>
            <CardContent>
            {loading ? (
                <div className="flex items-center justify-center py-12">
                <RiLoader2Line className="animate-spin text-ts12" size={26} />
                </div>
            ) : savedRelations.length > 0 ? (
                <div className="grid gap-2">
                {savedRelations.map((rel) => (
                    <motion.div
                    key={rel.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg border border-gray-100 bg-white shadow-sm"
                    >

                    <div className="flex flex-col justify-center items-start gap-1">
                        <span className="bg-orange-50 text-ts12 rounded px-2 py-1 text-xs">
                        {rel.type.replace("-", " ").toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-600">
                        {Object.entries(rel)
                            .filter(([k, v]) => k !== "id" && k !== "type" && v)
                            .map(([k, v]) => {
                            const user = users.find((u) => u.id === v);
                            const label = k.replace("_id", "").replace("_", " ");
                            return user
                                ? `${label[0].toUpperCase() + label.slice(1)}: ${
                                    user.first_name
                                } ${user.last_name}`
                                : `${label[0].toUpperCase() + label.slice(1)}: ${v}`;
                            })
                            .join(", ")}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                        variant="ghost"
                        className="cursor-pointer text-red-600 hover:text-red-700"
                        onClick={() => deleteRelation(rel)}
                        aria-label="Delete relation"
                        >
                            <RiDeleteBin6Line />
                        </Button>
                    </div>
                    </motion.div>
                ))}
                </div>
            ) : (
                <div className="py-8 text-center text-gray-500">
                No relations found. Click <strong>Add Relation</strong> to create one.
                </div>
            )}
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default OrganizationSetup;
