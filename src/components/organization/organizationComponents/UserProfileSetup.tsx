import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { RiSaveLine, RiLoader2Line } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { getBackendURL } from "@/lib/utils";
import type { UserRow } from "@/lib/types/type";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store/store";

type UserProfileSetupProps = { user: UserRow | null };

const ROLE_IDS = {
  ADMIN: 1001,
  HR: 1002,
  MANAGER: 1003,
} as const;

const UserProfileSetup: React.FC<UserProfileSetupProps> = ({ user }) => {
  const baseURL = getBackendURL();
  const { roles, users } = useSelector((s: RootState) => s.organization);
  const { isAdmin } = useSelector((s: RootState) => s.auth);
  const [roleId, setRoleId] = useState<string>(String(user?.role_id ?? ""));
  const [local, setLocal] = useState<UserRow | null>(null);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingRelations, setSavingRelations] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");
  const [selectedHrId, setSelectedHrId] = useState<string>("");

  useEffect(() => {
    if (user) {
      setLocal(user);
      setRoleId(String(user.role_id));
      setSelectedManagerId("");
      setSelectedHrId("");
    } else {
      setLocal(null);
    }
  }, [user]);

  const otherUsers = useMemo(
    () => users?.filter((u) => u.id !== user?.id) ?? [],
    [users, user?.id]
  );

  const managersList = useMemo(
    () => otherUsers.filter((u) => u.role_id === ROLE_IDS.MANAGER),
    [otherUsers]
  );

  const hrsList = useMemo(
    () => otherUsers.filter((u) => u.role_id === ROLE_IDS.HR),
    [otherUsers]
  );

  const displayName = useCallback(
    (u: UserRow | null) =>
      `${u?.first_name ?? ""} ${u?.last_name ?? ""}`.trim() ||
      u?.username ||
      u?.id,
    []
  );

  const editingUserIsManager = user?.role_id === ROLE_IDS.MANAGER;
  const editingUserIsAdmin = user?.role_id === ROLE_IDS.ADMIN;

  const handleInputChange = useCallback(
    (field: keyof UserRow) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocal((s) => (s ? { ...s, [field]: e.target.value } : s));
    },
    []
  );

  const handleSaveInfo = useCallback(async () => {
    if (!local || !user) return;
    
    setSavingInfo(true);
    try {
      const payload: any = {
        username: local.username,
        first_name: local.first_name,
        last_name: local.last_name,
        organization_id: local.organization_id,
      };

      if (isAdmin && typeof local.role_id !== "undefined") {
        payload.role_id = Number(roleId);
      }

      const res = await fetch(`${baseURL}/users/${user.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || "Failed to update user");
      } else {
        const updated = await res.json();
        toast.success("User updated");
        setLocal(updated);
      }
    } catch (err) {
      console.error("Update user error", err);
      toast.error("Server error while updating user");
    } finally {
      setSavingInfo(false);
    }
  }, [local, user, isAdmin, roleId, baseURL]);

  const handleSaveRelations = useCallback(async () => {
    if (!user || !isAdmin) {
      if (!isAdmin) toast.error("Only admins can manage relations");
      return;
    }

    if (!selectedManagerId && !selectedHrId) {
      toast.error("Choose manager and/or HR (if applicable) before saving");
      return;
    }

    setSavingRelations(true);
    try {
      if (selectedManagerId) {
        const payload = { employee_id: user.id, manager_id: selectedManagerId };
        const res = await fetch(`${baseURL}/employee/employee-manager`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.error || "Failed to save manager relation");
        }
        toast.success("Manager relation saved");
      }

      if (selectedHrId) {
        if (!editingUserIsManager) {
          toast.error("Assigning HR is only supported for managers right now");
        } else {
          const payload = { manager_id: user.id, hr_id: selectedHrId };
          const res = await fetch(`${baseURL}/employee/manager-hr`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          
          if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.error || "Failed to save manager→HR mapping");
          }
          toast.success("HR relation saved");
        }
      }
    } catch (err: any) {
      console.error("Save relations error", err);
      toast.error(err?.message || "Server error saving relations");
    } finally {
      setSavingRelations(false);
    }
  }, [user, isAdmin, selectedManagerId, selectedHrId, editingUserIsManager, baseURL]);

  const roleName = useMemo(
    () => roles?.find((r: any) => r.id === local?.role_id)?.role_name ?? "—",
    [roles, local?.role_id]
  );

  const saveButtonClasses = isAdmin
    ? "cursor-pointer bg-ts12 hover:bg-orange-400 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-md hover:shadow-ts12 text-white"
    : "opacity-60 cursor-not-allowed";

  return (
    <div className="bg-transparent">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-semibold mb-3 text-ts12"
      >
        Edit user {displayName(user)}
      </motion.h2>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Employee details</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Username</label>
              <Input
                value={local?.username ?? ""}
                onChange={handleInputChange("username")}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">First name</label>
              <Input
                value={local?.first_name ?? ""}
                onChange={handleInputChange("first_name")}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Last name</label>
              <Input
                value={local?.last_name ?? ""}
                onChange={handleInputChange("last_name")}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Role</label>
              {isAdmin ? (
                <Select onValueChange={setRoleId} value={roleId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.role_id} value={String(r.role_id)}>
                        {r.role_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={roleName}
                  readOnly
                  className="cursor-not-allowed"
                />
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 justify-end">
            <Button
              onClick={handleSaveInfo}
              disabled={savingInfo}
              className="flex items-center gap-2 cursor-pointer bg-ts12 hover:bg-orange-400 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-md hover:shadow-ts12 text-white"
            >
              {savingInfo ? (
                <RiLoader2Line className="animate-spin" />
              ) : (
                <RiSaveLine />
              )}
              Save user
            </Button>
          </div>
        </CardContent>
      </Card>

      {!editingUserIsAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Relations / Reporting</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Reporting to manager
                </label>
                <Select
                  value={selectedManagerId}
                  onValueChange={setSelectedManagerId}
                >
                  <SelectTrigger className="w-full cursor-pointer">
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {managersList.length === 0 ? (
                      <SelectItem value=" ">No managers found</SelectItem>
                    ) : (
                      managersList.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.first_name} {m.last_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="mt-2 text-xs text-gray-500">
                  Choose who this user reports to.
                </p>
              </div>

              {editingUserIsManager && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Reporting to HR
                  </label>
                  <Select value={selectedHrId} onValueChange={setSelectedHrId}>
                    <SelectTrigger className="w-full cursor-pointer">
                      <SelectValue placeholder="Select HR" />
                    </SelectTrigger>
                    <SelectContent>
                      {hrsList.length === 0 ? (
                        <SelectItem value=" ">No HRs found</SelectItem>
                      ) : (
                        hrsList.map((h) => (
                          <SelectItem key={h.id} value={h.id}>
                            {h.first_name} {h.last_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="mt-2 text-xs text-gray-500">
                    Assign an HR for this manager.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-3 justify-end">
              <Button
                onClick={handleSaveRelations}
                disabled={!isAdmin || savingRelations}
                className={`flex items-center gap-2 ${saveButtonClasses}`}
                title={!isAdmin ? "Only admins can manage relations" : ""}
              >
                {savingRelations ? (
                  <RiLoader2Line className="animate-spin" />
                ) : (
                  <RiSaveLine />
                )}
                Save relations
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserProfileSetup;