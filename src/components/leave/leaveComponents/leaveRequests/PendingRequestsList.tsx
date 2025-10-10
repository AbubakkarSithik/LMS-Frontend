import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchAllLeaveRequests, approveLeave, rejectLeave } from '@/lib/store/slices/leaveRequestSlice';
import type { LeaveRequest } from '@/lib/types/type';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiCheckLine, RiCloseLine, RiAlertLine, RiLoader2Line, RiVerifiedBadgeLine } from "@remixicon/react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store/store';
import { useNavigate } from 'react-router-dom';

const PendingRequestCard: React.FC<{ request: LeaveRequest }> = ({ request }) => {
  const dispatch = useAppDispatch();
  const [remarks, setRemarks] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isAdmin , isEmployee , appUser } = useSelector((state: RootState) => state.auth);
  const cuurentAppUser = appUser?.id;
  const isDasboard = window.location.pathname === '/dashboard';
  const navigate = useNavigate();

  const handleAction = async () => {
    if (!actionType) return;
  
    if (actionType === 'reject' && remarks.trim().length === 0) {
      toast.error('Remarks are mandatory for rejection.');
      return;
    }

    setIsProcessing(true);
    const action = actionType === 'approve' ? approveLeave : rejectLeave;
    
    try {
      await dispatch(action({ id: request.leave_request_id, remarks })).unwrap();
      toast.success(`Request for ${request.app_user.first_name} ${actionType}d successfully.`);
      setIsDialogOpen(false);
      setRemarks('');
      setActionType(null);
      
      // Refresh the list
      dispatch(fetchAllLeaveRequests());
    } catch (error: any) {
      toast.error(error || `Failed to ${actionType} request.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDashboardClick = () => {
      if(isDasboard){
        navigate('/leave');
      }else{
        return
      }
  };
  
  const formattedDateRange = `${new Date(request.start_date).toLocaleDateString()} - ${new Date(request.end_date).toLocaleDateString()}`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={"border rounded-lg p-4 mb-4 hover:shadow-md transition-shadow bg-card" + (isDasboard && ' cursor-pointer')}
      onClick={handleDashboardClick}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="font-bold text-lg text-primary" >{request.app_user.first_name} {request.app_user.last_name}</p>
          {!isDasboard && <><p className="text-sm text-muted-foreground">{request.leave_type.name} | {formattedDateRange}</p>
          <p className="text-xs text-gray-500 italic pt-1">Applied: {new Date(request.applied_at).toLocaleDateString()}</p> </>}
          {request.reason && !isDasboard && (
            <p className="text-sm pt-2"><span className="font-semibold">Reason:</span> {request.reason}</p>
          )}
        </div>
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          {request.status}
        </Badge>
      </div>
      {(!isAdmin && !isEmployee && !(request.app_user.id === cuurentAppUser) && !isDasboard) &&<Separator className="my-3" />}
      <div className="flex justify-end space-x-2">
        
        {/* Approve Dialog */}
        <Dialog open={isDialogOpen && actionType === 'approve'} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setRemarks('');
            setActionType(null);
          }
        }}>
          <DialogTrigger asChild>
            {(!isAdmin && !isEmployee && !(request.app_user.id === cuurentAppUser) && !isDasboard) &&<Button 
              variant="default" 
              className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
              onClick={() => { setActionType('approve'); setIsDialogOpen(true); }}
            >
              <RiCheckLine className="mr-2" /> Approve
            </Button>}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Leave Request</DialogTitle>
              <DialogDescription>
                Provide any remarks before approving {request.app_user.first_name}'s request.
              </DialogDescription>
            </DialogHeader>
            <Textarea 
              placeholder="Optional remarks" 
              value={remarks} 
              onChange={(e) => setRemarks(e.target.value)}
              disabled={isProcessing}
            />
            <DialogFooter>
              <Button onClick={() => setIsDialogOpen(false)} variant="outline" disabled={isProcessing} className='cursor-pointer'>
                Cancel
              </Button>
              <Button 
                onClick={handleAction} 
                className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <RiLoader2Line className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Approval'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={isDialogOpen && actionType === 'reject'} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setRemarks('');
            setActionType(null);
          }
        }}>
          <DialogTrigger asChild>
            {(!isAdmin && !isEmployee && !(request.app_user.id === cuurentAppUser) && !isDasboard) &&<Button 
              variant="destructive" 
              className="bg-red-600 hover:bg-red-700 cursor-pointer"
              onClick={() => { setActionType('reject'); setIsDialogOpen(true); }}
            >
              <RiCloseLine className="mr-2" /> Reject
            </Button>}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Leave Request</DialogTitle>
              <DialogDescription>
                Provide mandatory remarks explaining the rejection.
              </DialogDescription>
            </DialogHeader>
            <Textarea 
              placeholder="Mandatory remarks *" 
              value={remarks} 
              onChange={(e) => setRemarks(e.target.value)}
              disabled={isProcessing}
              className="min-h-[100px]"
            />
            <DialogFooter>
              <Button onClick={() => setIsDialogOpen(false)} variant="outline" disabled={isProcessing} className='cursor-pointer'>
                Cancel
              </Button>
              <Button 
                onClick={handleAction} 
                variant="destructive"
                disabled={isProcessing || remarks.trim().length === 0}
                className='cursor-pointer'
              >
                {isProcessing ? (
                  <>
                    <RiLoader2Line className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Rejection'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
};

const PendingRequestsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { pendingRequests, error } = useAppSelector(state => state.leaveRequest);
  const [isLoading, setIsLoading] = useState(true);
  const isDasboard = window.location.pathname === '/dashboard';
  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchAllLeaveRequests());
    setIsLoading(false);
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <RiLoader2Line className="h-8 w-8 text-ts12 animate-spin" />
        <p className="ml-2 text-primary">Loading Pending Requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center p-4 rounded-lg bg-red-100 text-red-700 border border-red-300">
        <RiAlertLine className="h-5 w-5 mr-2" />
        <p>Error loading requests: {error}</p>
      </div>
    );
  }

  return (
    <Card className={`${isDasboard ? 'shadow-none rounded': 'shadow-lg'}`}>
      <CardHeader>
        <CardTitle className="text-2xl text-primary border-b pb-2 flex items-center">
          <RiVerifiedBadgeLine className="mr-2 text-ts12" /> Pending Approvals <span className='rounded-full flex items-center ml-1.5 text-sm justify-center bg-orange-100 text-ts12 w-6 h-6'>{pendingRequests.length}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingRequests.length === 0 ? (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted-foreground p-6"
          >
            🎉 No pending leave requests! Enjoy the peace.
          </motion.p>
        ) : (
          <div>
            {pendingRequests.map((request) => (
              <PendingRequestCard key={request.leave_request_id} request={request} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingRequestsList;