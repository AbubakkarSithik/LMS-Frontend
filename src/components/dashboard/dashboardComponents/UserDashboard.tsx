import LeaveBalanceStats from '@/components/leave/leaveComponents/LeaveBalanceStats'
import PendingRequestsList from '@/components/leave/leaveComponents/leaveRequests/PendingRequestsList';
import type { RootState } from '@/lib/store/store';
import React from 'react'
import { useSelector } from 'react-redux'
import HolidayCarousel from '../../holiday/HolidayCarousal';
import LeavePatternAnalyzer from '@/components/leave/leaveComponents/LeavePatternAnalyzer';

const UserDashboard: React.FC = () => {
  const { isEmployee } = useSelector((state: RootState) => state.auth);
  return (
    <>
    <div className='grid grid-cols-2 gap-4'>
        {!isEmployee && <PendingRequestsList />}
        <div><HolidayCarousel /></div>
        <div className='col-span-2'><LeaveBalanceStats /></div>
        <div className='col-span-2'><LeavePatternAnalyzer/></div>
    </div>
    </>
  )
}

export default UserDashboard