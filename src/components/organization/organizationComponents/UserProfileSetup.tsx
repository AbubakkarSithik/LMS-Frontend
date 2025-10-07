import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { RiAddLine, RiDeleteBin6Line, RiLoader2Line } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { getBackendURL } from "@/lib/utils";
import type { Relation, UserRow } from "@/lib/types/type";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store/store";


type UserProfileSetupProps = { user: UserRow | null };

const UserProfileSetup: React.FC<UserProfileSetupProps> = ({user}) => {
  const baseURL = getBackendURL();
  const [loading, setLoading] = useState(false);

  return (
    <div className="p-6 min-h-fit bg-transparent">
      hello {user?.first_name}
    </div>
  );
};

export default UserProfileSetup;
