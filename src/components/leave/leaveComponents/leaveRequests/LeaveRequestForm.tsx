import React, { useState, useEffect } from 'react';
import { requestLeave, fetchLeaveTypes, fetchAllLeaveRequests } from '@/lib/store/slices/leaveRequestSlice';
import type { LeaveRequestPayload } from '@/lib/types/type';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RiCalendarLine, RiMailSendLine, RiLoader2Line } from "@remixicon/react";
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';

const LeaveRequestForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { leaveTypes, isLoading: typesLoading } = useAppSelector((state) => state.leaveRequest);
  
  const [formData, setFormData] = useState<LeaveRequestPayload>({
    leave_type_id: 0,
    start_date: '',
    end_date: '',
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    dispatch(fetchLeaveTypes());
  }, [dispatch]);

  useEffect(() => {
    if (leaveTypes.length > 0 && formData.leave_type_id === 0) {
      setFormData(prev => ({ ...prev, leave_type_id: leaveTypes[0].leave_type_id }));
    }
  }, [leaveTypes]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, leave_type_id: parseInt(value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Basic validation
      if (!formData.start_date || !formData.end_date || !formData.reason) {
        toast.error("Please fill all required fields.");
        setIsSubmitting(false);
        return;
      }

      // Validate date range
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        toast.error("End date must be after start date.");
        setIsSubmitting(false);
        return;
      }
      
      await dispatch(requestLeave(formData)).unwrap();
      toast.success('Leave request submitted successfully!');

      dispatch(fetchAllLeaveRequests());
      setFormData({ 
        leave_type_id: leaveTypes[0]?.leave_type_id || 0, 
        start_date: '', 
        end_date: '', 
        reason: '' 
      });
    } catch (error: any) {
      toast.error(error || 'Failed to submit leave request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-none border-none bg-transparent">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center">
          <RiCalendarLine className="mr-2 text-ts12" /> Request New Leave
        </CardTitle>
        <CardDescription>
          Fill out the details for your leave of absence.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="leave_type" className="text-sm font-medium">Leave Type</label>
            <Select 
              onValueChange={handleSelectChange} 
              value={String(formData.leave_type_id)}
              disabled={typesLoading || leaveTypes.length === 0}
            >
              <SelectTrigger id="leave_type" className="bg-muted/30">
                <SelectValue placeholder={typesLoading ? "Loading..." : "Select a leave type"} />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((type) => (
                  <SelectItem key={type.leave_type_id} value={String(type.leave_type_id)}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="start_date" className="text-sm font-medium">Start Date</label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="bg-muted/30"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="end_date" className="text-sm font-medium">End Date</label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
                required
                className="bg-muted/30"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium">Reason</label>
            <Textarea
              id="reason"
              name="reason"
              placeholder="State the reason for your leave..."
              value={formData.reason}
              onChange={handleChange}
              required
              rows={4}
              className="bg-muted/30 resize-none"
            />
          </div>
          <Button 
            type="submit" 
            className="w-1/3 mt-3.5 cursor-pointer bg-ts12 hover:bg-orange-400 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-md hover:shadow-ts12 text-white" 
            disabled={isSubmitting || leaveTypes.length === 0}
          >
            {isSubmitting ? (
              <RiLoader2Line className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RiMailSendLine className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LeaveRequestForm;