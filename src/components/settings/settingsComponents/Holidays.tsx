import React, { useEffect, useState } from "react";
import type { RootState } from "@/lib/store/store";
import { useSelector, useDispatch } from "react-redux";
import { setHoliday } from "@/lib/store/slices/organizationSlice";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { RiAddLine, RiEditLine, RiDeleteBin6Line, RiLoader2Line } from "@remixicon/react";
import type { Holiday } from "@/lib/types/type";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { getBackendURL } from "@/lib/utils";

const Holidays: React.FC = () => {
  const dispatch = useDispatch();
  const { organization, holiday } = useSelector((state: RootState) => state.organization);
  const orgId = organization?.organization_id;
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editHolidayId, setEditHolidayId] = useState<number | null>(null);
  const baseURL = getBackendURL();

  const [form, setForm] = useState<{
    name: string;
    holiday_date: string; 
    is_recurring: boolean;
  }>({
    name: "",
    holiday_date: "",
    is_recurring: false,
  });

  const formatDateInput = (d: string | Date) => {
    const date = typeof d === "string" ? new Date(d) : d;
    if (Number.isNaN(date.getTime())) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const loadHolidays = async () => {
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
      const normalized = data.map((h) => ({ ...h, holiday_date: formatDateInput(h.holiday_date) }));
      dispatch(setHoliday(normalized));
    } catch (err) {
      console.error("Load holidays error:", err);
      toast.error("Server error while loading holidays");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHolidays();
  }, [orgId]);  

  const openCreateModal = () => {
    setIsEditing(false);
    setEditHolidayId(null);
    setForm({ name: "", holiday_date: "", is_recurring: false });
    setOpenModal(true);
  };

  const openEditModal = (h: Holiday) => {
    setIsEditing(true);
    setEditHolidayId(h.holiday_id);
    setForm({
      name: h.name,
      holiday_date: formatDateInput(h.holiday_date),
      is_recurring: !!h.is_recurring,
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.holiday_date) {
      toast.error("Please provide name and date.");
      return;
    }
    setSaving(true);
    try {
      if (isEditing && editHolidayId) {
        const res = await fetch(`${baseURL}/organization/holidays/${editHolidayId}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            holiday_date: form.holiday_date,
            is_recurring: form.is_recurring,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          toast.error(err?.error || "Failed to update holiday");
          setSaving(false);
          return;
        }
        const updated: Holiday = await res.json();
        const updatedList = (holiday || []).map((h) => (h.holiday_id === updated.holiday_id ? { ...updated, holiday_date: formatDateInput(updated.holiday_date) } : h));
        dispatch(setHoliday(updatedList));
        toast.success("Holiday updated");
      } else {
        // POST
        const res = await fetch(`${baseURL}/organization/holidays`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            holiday_date: form.holiday_date,
            is_recurring: form.is_recurring,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          toast.error(err?.error || "Failed to create holiday");
          setSaving(false);
          return;
        }
        const created: Holiday = await res.json();
        const normalized = { ...created, holiday_date: formatDateInput(created.holiday_date) };
        dispatch(setHoliday([...(holiday || []), normalized]));
        toast.success("Holiday created");
      }
      setOpenModal(false);
    } catch (err) {
      console.error("Save holiday error:", err);
      toast.error("Server error while saving holiday");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirm = window.confirm("Are you sure you want to delete this holiday?");
    if (!confirm) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${baseURL}/organization/holidays/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || "Failed to delete holiday");
        setDeletingId(null);
        return;
      }
      const filtered = (holiday || []).filter((h) => h.holiday_id !== id);
      dispatch(setHoliday(filtered));
      toast.success("Holiday deleted");
    } catch (err) {
      console.error("Delete holiday error:", err);
      toast.error("Server error while deleting holiday");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-black">Holidays</h2>
        <div className="flex items-center gap-2">
          <Button onClick={openCreateModal} className="cursor-pointer bg-gradient-to-r from-ts12 via-orange-400 to-orange-700 hover:bg-orange-400 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-md hover:shadow-ts12 text-white">
            <RiAddLine />
            Add Holiday
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Organization Holidays</h3>
            <div className="text-sm text-gray-500">{organization?.name || ""}</div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RiLoader2Line className="animate-spin text-ts12" size={26} />
            </div>
          ) : (holiday && holiday.length > 0) ? (
            <div className="grid gap-2">
              {holiday.map((h: Holiday) => (
                <motion.div
                  key={h.holiday_id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center justify-between gap-4 p-3 rounded-lg border border-gray-100 bg-white shadow-sm"
                >
                  <div className="flex justify-center items-start gap-2">
                    <div className="flex flex-col justify-center items-start gap-1">
                      <span className="font-semibold text-black">{h.name}</span>
                      <span className="text-sm text-gray-500">{formatDateInput(h.holiday_date)}</span>
                    </div>
                    {h.is_recurring && <span className="text-xs inline-block px-2 py-1 rounded bg-orange-50 text-ts12">Recurring</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" className="cursor-pointer" onClick={() => openEditModal(h)} aria-label="Edit holiday">
                      <RiEditLine />
                    </Button>
                    <Button variant="ghost" className="cursor-pointer" onClick={() => handleDelete(h.holiday_id)} aria-label="Delete holiday" disabled={deletingId === h.holiday_id}>
                      {deletingId === h.holiday_id ? <RiLoader2Line className="animate-spin" /> : <RiDeleteBin6Line />}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No holidays found. Click <strong>Add Holiday</strong> to create one.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={openModal} onOpenChange={setOpenModal} aria-describedby="dialog-create-update-holiday">
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Holiday" : "Create Holiday"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <Label htmlFor="name" className="mb-2 text-ts12">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} placeholder="Independence Day" />
            </div>

            <div>
              <Label htmlFor="holiday_date" className="mb-2 text-ts12">Date</Label>
              <Input id="holiday_date" type="date" value={form.holiday_date} onChange={(e) => setForm((s) => ({ ...s, holiday_date: e.target.value }))} />
            </div>

            <div className="flex items-baseline justify-start gap-2">
              <input id="rec" type="checkbox" className="w-3 h-3 data-[state=checked]:bg-ts12 cursor-pointer" checked={form.is_recurring} onChange={(e) => setForm((s) => ({ ...s, is_recurring: e.target.checked }))} />
              <Label htmlFor="rec">Recurring annually</Label>
            </div>
          </div>

          <DialogFooter className="mt-4 flex items-center justify-end gap-2">
            <Button variant="ghost"  className="cursor-pointer" onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="cursor-pointer bg-gradient-to-r from-ts12 via-orange-400 to-orange-700 hover:bg-orange-400 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-md hover:shadow-ts12 text-white">
              {saving ? <RiLoader2Line className="animate-spin" /> : (isEditing ? "Update" : "Create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Holidays;
