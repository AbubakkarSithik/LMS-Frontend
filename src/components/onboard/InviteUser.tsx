import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { type RootState } from "@/lib/store/store";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RiUserAddLine, RiCheckLine, RiLoader2Line } from "@remixicon/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InviteUserProps {
  onFinish: () => void;
}

const InviteUser: React.FC<InviteUserProps> = ({ onFinish }) => {
  const  organization = useSelector((state: RootState) => state.organization);
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [roles, setRoles] = useState<{ role_id: number; role_name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch("http://localhost:4005/invite/roles", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setRoles(data);
        }
      } catch (err) {
        console.error("Failed to load roles", err);
      }
    };
    fetchRoles();
  }, []);

  const handleInvite = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4005/invite/invite-user", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role_id: roleId,
          organization_id: organization.organization_id,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setEmail("");
        setRoleId("");
        setTimeout(() => setSuccess(false), 2000);
      } else {
        const err = await res.json();
        alert(err.error || "Invite failed");
      }
    } catch (err) {
      console.error("Invite error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <h2 className="text-2xl font-semibold text-left text-ts12 mb-6">
        Let&apos;s invite your team
      </h2>
      <div className="space-y-4">
        <div>
          <Label className="block text-gray-700 text-left mb-2">User Email</Label>
          <Input
            type="email"
            className="w-full border rounded-md p-2"
            value={email}
            placeholder="user@example.com"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label className="block text-gray-700 text-left mb-2">Select Role</Label>
          <Select onValueChange={setRoleId} value={roleId}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a Role" />
            </SelectTrigger>
            <SelectContent>                
                {roles.map((r) => (
                <SelectItem 
                    key={r.role_id} 
                    value={String(r.role_id)} 
                >
                    {r.role_name}
                </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between items-center gap-4 mt-6">
        <Button
          onClick={handleInvite}
          disabled={loading}
          className="w-1/4 cursor-pointer flex bg-ts12 hover:bg-orange-400 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-md hover:shadow-ts12 text-white"
        >
          {loading ? (
            <>
              <RiLoader2Line className="animate-spin" size={20} /> Sending...
            </>
          ) : (
            <>
              <RiUserAddLine size={20} /> Invite
            </>
          )}
        </Button>
        <Button
          variant="secondary"
          onClick={onFinish}
          className="hover:bg-ts12 hover:text-white transition-all duration-300 cursor-pointer"
        >
          Finish <RiCheckLine size={20} />
        </Button>
      </div>

      {success && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="mt-5 text-green-600 text-xs font-semibold flex items-center gap-2"
        >
          <RiCheckLine size={22} /> Invitation sent!
        </motion.div>
      )}
    </motion.div>
  );
};

export default InviteUser;
