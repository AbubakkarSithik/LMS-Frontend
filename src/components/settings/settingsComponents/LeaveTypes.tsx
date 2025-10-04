import React, { useEffect, useState } from "react";
import type { RootState } from "@/lib/store/store";
import { useSelector, useDispatch } from "react-redux";
import { setLeaveTypes } from "@/lib/store/slices/organizationSlice";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { RiAddLine, RiEditLine, RiDeleteBin6Line, RiLoader2Line } from "@remixicon/react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { LeaveTypes as LeaveProps } from "@/lib/types/type";

interface FormState {
  name: string;
  description: string;
  max_days_per_year: number;
}

const initialFormState: FormState = {
  name: "",
  description: "",
  max_days_per_year: 0,
};

const LeaveTypes: React.FC = () => {
  const dispatch = useDispatch();
  const { organization, leave_types } = useSelector((state: RootState) => state.organization);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editLeaveTypeId, setEditLeaveTypeId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(initialFormState);

  const fetchLeaveTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4005/organization/leave-types", { credentials: "include" });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || "Failed to load leave types");
        return;
      }
      const data: LeaveProps[] = await res.json();
      dispatch(setLeaveTypes(data));
    } catch (err) {
      console.error("Load leave types error:", err);
      toast.error("Server error while loading leave types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({
      ...s,
      [name]: name === "max_days_per_year" ? (parseInt(value) >= 0 ? parseInt(value) : 0) : value,
    }));
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setEditLeaveTypeId(null);
    setForm(initialFormState);
    setOpenModal(true);
  };

  const openEditModal = (lt: LeaveProps) => {
    setIsEditing(true);
    setEditLeaveTypeId(lt.leave_type_id);
    setForm({
      name: lt.name,
      description: lt.description,
      max_days_per_year: lt.max_days_per_year,
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.description || form.max_days_per_year < 0) {
      toast.error("Please provide a name, description, and valid max days.");
      return;
    }
    
    setSaving(true);
    const bodyData = {
      name: form.name,
      description: form.description,
      max_days_per_year: Number(form.max_days_per_year),
    };

    try {
      let res: Response;
      if (isEditing && editLeaveTypeId) {
        res = await fetch(`http://localhost:4005/organization/leave-types/${editLeaveTypeId}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        });
      } else {
        res = await fetch("http://localhost:4005/organization/leave-types", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || `Failed to ${isEditing ? "update" : "create"} leave type`);
        return;
      }

      const savedLeaveType: LeaveProps = await res.json();
      if (isEditing) {
        const updatedList = (leave_types || []).map((lt) =>
          lt.leave_type_id === savedLeaveType.leave_type_id ? savedLeaveType : lt
        );
        dispatch(setLeaveTypes(updatedList));
        toast.success("Leave type updated successfully");
      } else {
        dispatch(setLeaveTypes([...(leave_types || []), savedLeaveType]));
        toast.success("Leave type created successfully");
      }

      setOpenModal(false);
    } catch (err) {
      console.error("Save leave type error:", err);
      toast.error("Server error while saving leave type");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirm = window.confirm("Are you sure you want to delete this leave type? This action cannot be undone.");
    if (!confirm) return;

    setDeletingId(id);
    try {
      const res = await fetch(`http://localhost:4005/organization/leave-types/${id}`, { 
        method: "DELETE", 
        credentials: "include" 
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || "Failed to delete leave type");
        return;
      }

      const filtered = (leave_types || []).filter((lt) => lt.leave_type_id !== id);
      dispatch(setLeaveTypes(filtered));
      toast.success("Leave type deleted");
    } catch (err) {
      console.error("Delete leave type error:", err);
      toast.error("Server error while deleting leave type");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-black">Leave Types</h2>
        <div className="flex items-center gap-2">
          <Button 
            onClick={openCreateModal} 
            className="cursor-pointer bg-gradient-to-r from-ts12 via-orange-400 to-orange-700 hover:bg-orange-400 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-md hover:shadow-ts12 text-white"
          >
            <RiAddLine />
            Add Leave Type
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Organization Leave Types</h3>
            <div className="text-sm text-gray-500">{organization?.name || ""}</div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center ">
              <RiLoader2Line className="animate-spin text-ts12" size={26} />
            </div>
          ) : (leave_types && leave_types.length > 0) ? (
            <div className="grid gap-2">
              {leave_types.map((lt: LeaveProps) => (
                <motion.div
                  key={lt.leave_type_id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center justify-between gap-4 p-3 rounded-lg border border-gray-100 bg-white shadow-sm"
                >
                  <div className="flex flex-col justify-center items-start gap-1">
                    <span className="font-semibold text-black">{lt.name}</span>
                    <span className="text-sm text-gray-500">{lt.description}</span>
                    <span className="text-xs inline-block px-2 py-1 rounded bg-orange-50 text-ts12">
                      Max Days: {lt.max_days_per_year}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      className="cursor-pointer" 
                      onClick={() => openEditModal(lt)} 
                      aria-label="Edit leave type"
                    >
                      <RiEditLine />
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="cursor-pointer" 
                      onClick={() => handleDelete(lt.leave_type_id)} 
                      aria-label="Delete leave type" 
                      disabled={deletingId === lt.leave_type_id}
                    >
                      {deletingId === lt.leave_type_id ? <RiLoader2Line className="animate-spin" /> : <RiDeleteBin6Line />}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No leave types found. Click <strong>Add Leave Type</strong> to create one.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={openModal} onOpenChange={setOpenModal} aria-describedby="dialog-create-update-leave-type">
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Leave Type" : "Create Leave Type"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label htmlFor="name" className="mb-2 text-ts12">Name</Label>
              <Input 
                id="name" 
                name="name"
                value={form.name} 
                onChange={handleChange} 
                placeholder="Sick Leave" 
              />
            </div>
            <div>
              <Label htmlFor="description" className="mb-2 text-ts12">Description</Label>
              <Input 
                id="description" 
                name="description"
                value={form.description} 
                onChange={handleChange} 
                placeholder="Brief description of this leave type" 
              />
            </div>
            <div>
              <Label htmlFor="max_days_per_year" className="mb-2 text-ts12">Max Days per Year</Label>
              <Input 
                id="max_days_per_year" 
                name="max_days_per_year"
                type="number" 
                min="0"
                value={form.max_days_per_year} 
                onChange={handleChange} 
              />
            </div>
          </div>
          <DialogFooter className="mt-4 flex items-center justify-end gap-2">
            <Button variant="ghost" className="cursor-pointer" onClick={() => setOpenModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving} 
              className="cursor-pointer bg-gradient-to-r from-ts12 via-orange-400 to-orange-700 hover:bg-orange-400 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-md hover:shadow-ts12 text-white"
            >
              {saving ? <RiLoader2Line className="animate-spin" /> : (isEditing ? "Update" : "Create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveTypes;