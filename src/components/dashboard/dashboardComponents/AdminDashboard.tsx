import React from 'react'
import HolidayCarousel from '../../holiday/HolidayCarousal'
import PendingRequestsList from '@/components/leave/leaveComponents/leaveRequests/PendingRequestsList'

const AdminDashboard: React.FC = () => {
  return (
    <div className='grid grid-cols-2 gap-4'>
      <PendingRequestsList />
      <HolidayCarousel/>
    </div>
  )
}

export default AdminDashboard
