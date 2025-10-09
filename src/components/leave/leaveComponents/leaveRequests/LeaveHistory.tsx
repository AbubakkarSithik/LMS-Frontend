import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchAllLeaveRequests, fetchAuditLog } from '@/lib/store/slices/leaveRequestSlice';
import type { LeaveRequest } from '@/lib/types/type';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RiHistoryLine, RiEyeLine, RiLoader2Line, RiCalendarCheckLine } from "@remixicon/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from 'framer-motion';
import { Separator } from "@/components/ui/separator";

const getStatusBadge = (status: LeaveRequest['status']) => {
  switch (status) {
    case 'Approved':
      return <Badge className="bg-green-600 hover:bg-green-700">Approved</Badge>;
    case 'Rejected':
      return <Badge variant="destructive">Rejected</Badge>;
    case 'Under Review':
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">Under Review</Badge>;
    case 'Pending':
    default:
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
  }
};

const LeaveHistory: React.FC = () => {
  const dispatch = useAppDispatch();
  const { appUser , isAdmin } = useAppSelector(state => state.auth);
  const { history, isLoading, error, activeRequestLog } = useAppSelector(state => state.leaveRequest);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [loadingLog, setLoadingLog] = useState(false);
  const currentUserHistory =  isAdmin ? history :  history.filter((req) => req.app_user.id === appUser?.id);  
  const isDasboard = window.location.pathname === '/dashboard';
  useEffect(() => {
    dispatch(fetchAllLeaveRequests());
  }, [dispatch]);

  const handleViewDetails = async (id: number) => {
    setLoadingLog(true);
    try {
      await dispatch(fetchAuditLog(id)).unwrap();
      setIsLogDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch audit log:', error);
    } finally {
      setLoadingLog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <RiLoader2Line className="h-8 w-8 text-primary animate-spin" />
        <p className="ml-2 text-primary">Loading Leave History...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center p-4 rounded-lg bg-red-100 text-red-700 border border-red-300">
        <p>Error loading history: {error}</p>
      </div>
    );
  }

  return (
    <Card className={`${isDasboard ? 'shadow-none rounded': 'shadow-lg'}`}>
      <CardHeader>
        <CardTitle className="text-2xl text-primary border-b pb-2 flex items-center">
          <RiHistoryLine className="mr-2 text-ts12" /> Leave History <span className='rounded-full flex items-center ml-1.5 text-sm justify-center bg-orange-100 text-ts12 w-6 h-6'>{currentUserHistory.length}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/10">
                {isAdmin && <TableHead>Employee</TableHead>}
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUserHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No leave requests history found.
                  </TableCell>
                </TableRow>
              ) : (
                currentUserHistory.map((request, index) => (
                  <motion.tr
                    key={request.leave_request_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-accent/50"
                  >
                    { isAdmin && <TableCell className="font-medium">
                      {request.app_user.first_name} {request.app_user.last_name}
                    </TableCell>}
                    <TableCell>{request.leave_type.name}</TableCell>
                    <TableCell>
                      {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate text-sm" title={request.reason}>
                      {request.reason}
                    </TableCell>
                    <TableCell className="text-center">{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewDetails(request.leave_request_id)}
                        disabled={loadingLog}
                        className='hover:bg-orange-100 cursor-pointer'
                      >
                        {loadingLog ? (
                          <RiLoader2Line className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <RiEyeLine className="h-4 w-4 mr-1 text-primary" />
                        )}
                        Log
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Audit Log Dialog */}
      <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className='text-primary flex items-center'>
              <RiCalendarCheckLine className="mr-2" /> Leave Request Log
            </DialogTitle>
          </DialogHeader>
          <Separator className="my-2" />
          <div className="max-h-[70vh] overflow-y-auto space-y-4">
            {!activeRequestLog || activeRequestLog.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No audit trail found.</p>
            ) : (
              activeRequestLog.map((log, index) => (
                <motion.div 
                  key={log.log_id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-3 border-l-4 border-ts12/40 bg-secondary/30 rounded-md"
                >
                  <p className="font-semibold text-sm">
                    {log.action}
                    <span className="text-xs font-normal text-muted-foreground ml-2">
                      ({log.old_status ?? "Initiated"} &rarr; {log.new_status})
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    By {log.app_user.first_name} {log.app_user.last_name} at {new Date(log.performed_at).toLocaleString()}
                  </p>
                  {log.remarks && (
                    <p className="text-sm italic mt-1 text-gray-700">
                      <span className="font-semibold not-italic">Remarks:</span> {log.remarks}
                    </p>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default LeaveHistory;