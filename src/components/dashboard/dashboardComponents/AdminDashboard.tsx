import LeaveHistory from '@/components/leave/leaveComponents/leaveRequests/LeaveHistory'
import OrgRelations from '@/components/organization/organizationComponents/OrgRelations'
import React from 'react'
import HolidayCarousel from './HolidayCarousal'
import PendingRequestsList from '@/components/leave/leaveComponents/leaveRequests/PendingRequestsList'

const AdminDashboard: React.FC = () => {
  return (
    <div className='grid grid-cols-2 gap-4'>
      <HolidayCarousel/>
      <PendingRequestsList />
      <div className='col-span-2'><LeaveHistory/></div>
      <div className='col-span-2'> <OrgRelations /></div>
    </div>
  )
}

export default AdminDashboard
