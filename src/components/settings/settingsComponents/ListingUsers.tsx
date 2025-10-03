import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store/store";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RiShieldUserLine } from "@remixicon/react";
import type { UserRow } from "@/lib/types/type";
import { Skeleton } from "@/components/ui/skeleton";

const ListingUsers: React.FC = () => {
  const { isAdmin } = useSelector((state: RootState) => state.auth);
  const { organization } = useSelector((state: RootState) => state.organization);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const userRoles = [{ role_name :"Admin" , id: 1001}, { role_name :"HR" , id: 1002}, { role_name :"Manager" , id: 1003} , { role_name :"Employee" , id: 1004}];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!organization?.organization_id || !isAdmin) return;
        const res = await fetch(
          `http://localhost:4005/users/org/${organization?.organization_id}`,
          { credentials: "include" , method: "GET"}
        );
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
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

  if (loading) {
    return (
      <div className="space-y-3 p-4">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
        </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-semibold mb-4 text-ts12">Organization Users</h2>
      <Table className="max-w-md mx-auto border rounded-xl">
        <TableHeader>
          <TableRow>
            <TableHead className="text-ts12">Name</TableHead>
            <TableHead className="text-ts12">Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="hover:bg-orange-50"
              >
                <TableCell className="font-medium flex justify-start gap-2 items-center">
                  {user.first_name} {user.last_name}
                  <Badge
                    className="text-xs flex px-2 py-1 rounded-full bg-orange-50 text-ts12"
                  >
                    <RiShieldUserLine size={14} />{" "}
                    {userRoles.find((role) => role.id === user.role_id)?.role_name}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
              </motion.tr>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-gray-500">
                No users found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </motion.div>
  );
};

export default ListingUsers;