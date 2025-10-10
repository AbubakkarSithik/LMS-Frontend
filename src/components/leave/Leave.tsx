import React from 'react'
import LeaveTypes from './leaveComponents/LeaveTypes'
import { Tabs , TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import LeaveRequestForm from './leaveComponents/leaveRequests/LeaveRequestForm'
import PendingRequestsList from './leaveComponents/leaveRequests/PendingRequestsList'
import LeaveHistory from './leaveComponents/leaveRequests/LeaveHistory'
import { useSelector } from 'react-redux'
import type { RootState } from '@/lib/store/store'

const Leave: React.FC = () => {
  const { isAdmin , isEmployee } = useSelector((state: RootState) => state.auth);
  return (
    <Tabs defaultValue="leave-request" className="w-full" >
          <TabsList className="flex w-full bg-transparent">
            <TabsTrigger className='data-[state=active]:border data-[state=active]:border-b-ts12 data-[state=active]:text-ts12 data-[state=active]:shadow-none data-[state=active]:bg-transparent` rounded-none cursor-pointer' value="leave-request">Request Leave</TabsTrigger>
            <TabsTrigger className='data-[state=active]:border data-[state=active]:border-b-ts12 data-[state=active]:text-ts12 data-[state=active]:shadow-none data-[state=active]:bg-transparent` rounded-none cursor-pointer' value="leave-types">Leave Types</TabsTrigger>
          </TabsList>
          <TabsContent value="leave-request" className="w-full">
            <Tabs defaultValue={isAdmin ? "pending-approvals" : "leave-form"} className="w-full" orientation='horizontal'>
                <TabsList className="flex justify-start  h-full bg-transparent">
                  {!isAdmin && <TabsTrigger className='data-[state=active]:border data-[state=active]:border-b-ts12 data-[state=active]:text-ts12 data-[state=active]:shadow-none data-[state=active]:bg-transparent` rounded-none cursor-pointer' value="leave-form">Apply Leave</TabsTrigger>}
                  {!isEmployee && <TabsTrigger className='data-[state=active]:border data-[state=active]:border-b-ts12 data-[state=active]:text-ts12 data-[state=active]:shadow-none data-[state=active]:bg-transparent` rounded-none cursor-pointer' value="pending-approvals">Pending Approvals</TabsTrigger>}
                  {<TabsTrigger className='data-[state=active]:border data-[state=active]:border-b-ts12 data-[state=active]:text-ts12 data-[state=active]:shadow-none data-[state=active]:bg-transparent` rounded-none cursor-pointer' value="leave-history">Leave History</TabsTrigger>}
                </TabsList>
                <TabsContent value="leave-form" className="w-full my-3">
                  <LeaveRequestForm/>
                </TabsContent>
                <TabsContent value="pending-approvals" className="w-full my-3">
                  <PendingRequestsList/>
                </TabsContent>
                <TabsContent value="leave-history" className="w-full my-3">
                  <LeaveHistory/>
                </TabsContent>
              </Tabs>
          </TabsContent>
          <TabsContent value="leave-types" className="w-full my-3">
            <LeaveTypes/>
          </TabsContent>
        </Tabs>
  )
}

export default Leave
