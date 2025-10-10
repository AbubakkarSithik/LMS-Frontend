import LeaveHistory from '@/components/leave/leaveComponents/leaveRequests/LeaveHistory'
import React from 'react'
import HolidayCarousel from '../../holiday/HolidayCarousal'
import PendingRequestsList from '@/components/leave/leaveComponents/leaveRequests/PendingRequestsList'

const AdminDashboard: React.FC = () => {
  return (
    <div className='grid grid-cols-2 gap-4'>
      <PendingRequestsList />
      <HolidayCarousel/>
      <div className='col-span-2'><LeaveHistory/></div>
    </div>
  )
}

export default AdminDashboard
