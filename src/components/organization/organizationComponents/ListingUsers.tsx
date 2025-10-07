import React, { useEffect, useState } from "react";
import { useSelector , useDispatch } from "react-redux";
import type { RootState } from "@/lib/store/store";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { RiEdit2Line, RiLoader2Line, RiShieldUserLine } from "@remixicon/react";
import { getBackendURL } from "@/lib/utils";
import { setUsers } from "@/lib/store/slices/organizationSlice";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog , DialogContent , DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { UserRow } from "@/lib/types/type";
import UserProfileSetup from "./UserProfileSetup";

const ListingUsers: React.FC = () => {
  const dispatch = useDispatch();
  const { isAdmin } = useSelector((state: RootState) => state.auth);
  const { organization , users } = useSelector((state: RootState) => state.organization);
  const [loading, setLoading] = useState<boolean>(true);
  const [openDialog , setOpenDialog] = useState<boolean>(false);
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);  
  const userRoles = [{ role_name :"Admin" , id: 1001}, { role_name :"HR" , id: 1002}, { role_name :"Manager" , id: 1003} , { role_name :"Employee" , id: 1004}];
  const baseURL = getBackendURL();
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!organization?.organization_id || !isAdmin) return;
        const res = await fetch(
          `${baseURL}/users/org/${organization?.organization_id}`,
          { credentials: "include" , method: "GET"}
        );
        if (res.ok) {
          const data = await res.json();
          dispatch(setUsers(data));
        } else {
          console.error("Failed to fetch users");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [organization?.organization_id, isAdmin]);

  const handleEditClick = (user: UserRow) => {
    setEditingUser(user);
    setOpenDialog(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Directory</h3>
            <span className="text-sm text-gray-500">
              Total: {users?.length || 0}
            </span>
          </div>
        </CardHeader>
        <Separator />
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RiLoader2Line className="animate-spin text-ts12" size={26} />
            </div>
          ) : users && users.length > 0 ? (
            <div className="grid gap-2">
              {users.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  onMouseEnter={() => setHoveredUserId(user.id)}
                  onMouseLeave={() => setHoveredUserId(null)}
                  className="relative flex items-center justify-between gap-4 p-3 rounded-lg border border-gray-100 bg-white shadow-sm group"
                >
                  <div className="flex justify-center items-start gap-3">
                    <div className="flex flex-col justify-center items-start gap-1">
                      <span className="font-semibold text-black">
                        {user.first_name} {user.last_name}
                      </span>
                      <span className="text-sm text-gray-500">
                        Joined:{" "}
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <Badge className="text-xs flex items-center gap-1 px-2 py-1 rounded bg-orange-50 text-ts12">
                      <RiShieldUserLine size={14} />
                      {userRoles.find((role) => role.id === user.role_id)
                        ?.role_name || "User"}
                    </Badge>
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: hoveredUserId === user.id ? 1 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {handleEditClick(user)} }
                      className="flex items-center gap-1 cursor-pointer border-none hover:bg-orange-50"
                    >
                      <RiEdit2Line size={14} /> Edit
                    </Button>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No users found.
            </div>
          )}
        </CardContent>
      </Card>
     
      <Dialog open={openDialog} onOpenChange={setOpenDialog} >
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only"></DialogTitle>
          <DialogDescription className="sr-only"></DialogDescription>
          <UserProfileSetup user={editingUser} />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ListingUsers;