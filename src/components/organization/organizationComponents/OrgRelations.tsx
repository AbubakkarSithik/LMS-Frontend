// import React, { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { RiUser3Line, RiTeamLine, RiLoader2Line } from "@remixicon/react";
// import { toast } from "sonner";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { getBackendURL } from "@/lib/utils";
// import { useSelector , useDispatch } from "react-redux";
// import type { RootState } from "@/lib/store/store";
// import { setRelations } from "@/lib/store/slices/organizationSlice";
// import type { RelationData, RelationType } from "@/lib/types/type";

// const OrgRelations: React.FC = () => {
//   const baseURL = getBackendURL();
//   const dispatch = useDispatch();
//   const { users , relations} = useSelector((state: RootState) => state.organization);
//   const [loading, setLoading] = useState(true);

//   const fetchRelations = async () => {
//   try {
//     setLoading(true);
//     const res = await fetch(`${baseURL}/employee/relations/all`, {
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//     });

//     if (!res.ok) {
//       toast.error("Failed to fetch organization relations");
//       return;
//     }
//     const data = await res.json();
//     if (data?.relations) {
//       dispatch(setRelations(data.relations));
//     } else {
//       dispatch(
//         setRelations({
//           "employee-manager": [],
//           "manager-hr": [],
//         })
//       );
//     }
//   } catch (err: any) {
//     console.error("Error fetching relations:", err);
//     toast.error("Failed to fetch organization relations");
//   } finally {
//     setLoading(false);
//   }
// };

//   useEffect(() => {
//     if (users?.length > 0) fetchRelations();
//   }, [users]);

//   const getUserName = (userId?: string) => {
//     const u = users.find((x: any) => x.id === userId);
//     return u ? `${u.first_name} ${u.last_name ?? ""}`.trim() : "—";
//   };

//   const relationTitles: Record<RelationType, string> = {
//     "employee-manager": "Employee → Manager",
//     "manager-hr": "Manager → HR",
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <RiLoader2Line className="w-8 h-8 animate-spin text-muted-foreground" />
//       </div>
//     );
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 15 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.3 }}
//       className="space-y-6 "
//     >
//       <h2 className="text-2xl text-left font-bold">Organization Relations</h2>
//       {Object.entries(relations).map(([key, list]) => {
//         const type = key as RelationType;
//         const unique = Array.from(
//           new Map(list.map((item) => [JSON.stringify(item), item])).values()
//         ); 
//         return (
//           <Card key={key} className="shadow-sm border border-border">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2 ">
//                 <RiTeamLine className="w-5 h-5 text-ts12" />
//                 {relationTitles[type]}
//               </CardTitle>
//             </CardHeader>
//             <Separator />
//             <CardContent className="space-y-3">
//               {unique.length === 0 ? (
//                 <p className="text-sm text-muted-foreground italic">
//                   No relations found.
//                 </p>
//               ) : (
//                 unique.map((rel: RelationData, idx) => (
//                   <motion.div
//                     key={idx}
//                     initial={{ opacity: 0, y: 5 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: idx * 0.03 }}
//                     className="flex items-center justify-between bg-accent/30 rounded-xl p-1"
//                   >
//                     <div className="flex items-center gap-2">
//                       <RiUser3Line className="w-4 h-4 text-primary" />
//                       {type === "employee-manager" && (
//                         <span className="text-sm">
//                           <strong>{getUserName(rel.employee_id)}</strong> →{" "}
//                           {getUserName(rel.manager_id)}
//                         </span>
//                       )}
//                       {type === "manager-hr" && (
//                         <span className="text-sm">
//                           <strong>{getUserName(rel.manager_id)}</strong> →{" "}
//                           {getUserName(rel.hr_id)}
//                         </span>
//                       )}
//                     </div>
//                   </motion.div>
//                 ))
//               )}
//             </CardContent>
//           </Card>
//         );
//       })}
//     </motion.div>
//   );
// };

// export default OrgRelations;

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import RelationGraph, { type RelationGraphExpose } from "relation-graph-react";
import type {
  RGOptions,
  RGNode,
  RGLine,
  RGLink,
} from "relation-graph-react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/lib/store/store";
import { setRelations } from "@/lib/store/slices/organizationSlice";
import { getBackendURL } from "@/lib/utils";
import { toast } from "sonner";
import { RiLoader2Line } from "@remixicon/react";

// Types
type RelationType = "employee-manager" | "manager-hr";
type RelationData = {
  employee_id?: string;
  manager_id?: string;
  hr_id?: string;
};
type OrgRelationsShape = Record<RelationType, RelationData[]>;

type SimpleUser = {
  id: string;
  first_name: string;
  last_name: string;
};

// The JSON shape that relation-graph expects:
type GraphJson = {
  rootId?: string;
  nodes: { id: string; text: string }[];
  lines: { from: string; to: string; text?: string }[];
};

// Helper: build JSON for relation-graph
function buildGraphJson(
  users: SimpleUser[],
  relations: OrgRelationsShape
): GraphJson {
  const nodesMap = new Map<string, string>();
  const lines: GraphJson["lines"] = [];

  const ensureNode = (uid: string) => {
    if (!nodesMap.has(uid)) {
      const u = users.find((x) => x.id === uid);
      const text = u ? `${u.first_name} ${u.last_name}` : uid;
      nodesMap.set(uid, text);
    }
  };

  // Employee → Manager
  (relations["employee-manager"] || []).forEach((rel) => {
    if (rel.employee_id && rel.manager_id) {
      ensureNode(rel.employee_id);
      ensureNode(rel.manager_id);
      lines.push({ from: rel.employee_id, to: rel.manager_id, text: "mgr" });
    }
  });

  // Manager → HR
  (relations["manager-hr"] || []).forEach((rel) => {
    if (rel.manager_id && rel.hr_id) {
      ensureNode(rel.manager_id);
      ensureNode(rel.hr_id);
      lines.push({ from: rel.manager_id, to: rel.hr_id, text: "hr" });
    }
  });

  // Also ensure isolated users show up
  users.forEach((u) => {
    ensureNode(u.id);
  });

  const nodes = Array.from(nodesMap.entries()).map(([id, text]) => ({
    id,
    text,
  }));

  // Optionally pick a rootId (for a tree layout); e.g. first manager or HR
  let rootId: string | undefined = undefined;
  if (nodes.length > 0) rootId = nodes[0].id;

  return {
    rootId,
    nodes,
    lines,
  };
}

const OrgRelations: React.FC = () => {
  const dispatch = useDispatch();
  const { users, relations } = useSelector((state: RootState) => state.organization);
  const graphRef = useRef<RelationGraphExpose>(null);

  const baseURL = getBackendURL();

  // Fetch relations from backend
  const fetchRelations = async () => {
    try {
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
      toast.error("Fetch relations failed");
    }
  };

  // On mount / when users list changes
  useEffect(() => {
    if (users && users.length > 0) {
      fetchRelations();
    }
  }, [users]);

  // When relations or users change, re-render the graph
  useEffect(() => {
    if (!graphRef.current) return;
    const json = buildGraphJson(users, relations);
    graphRef.current.setJsonData(json, (graphInstance) => {
      // Optional callback when the graph is ready
      // e.g. center, zoom etc.
      graphInstance.doLayout();
      graphInstance.moveToCenter();
      graphInstance.zoomToFit();
    });
  }, [users, relations]);

  // Loading guard
  if (!users || users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <RiLoader2Line className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Graph options (layout, styling etc)
  const options: RGOptions = {
    layout: {
      layoutName: "tree", // or “tree”
      maxLayoutTimes: 3000,
    },
    defaultLineShape: 1,
    debug: false,
    defaultExpandHolderPosition: "right",
  };

  const onNodeClick = (node: RGNode, _e: MouseEvent | TouchEvent) => {
    toast.info(`Clicked ${node.id}`);
    return true;
  };

  const onLineClick = (line: RGLine, _link: RGLink, _e: MouseEvent | TouchEvent) => {
    toast.info(`Link from ${line.from} → ${line.to}`);
    return true;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold">Organization Structure</h2>
      <div className="h-[600px] w-full border border-border rounded-lg bg-background overflow-hidden">
        <RelationGraph
          ref={graphRef}
          options={options}
          onNodeClick={onNodeClick}
          onLineClick={onLineClick}
        />
      </div>
    </motion.div>
  );
};

export default OrgRelations;
