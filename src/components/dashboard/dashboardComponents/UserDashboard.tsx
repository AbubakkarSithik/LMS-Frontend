import React from 'react'
import type { RootState } from '@/lib/store/store'
import { useDispatch, useSelector } from 'react-redux'

const UserDashboard: React.FC = () => {
    const dispatch = useDispatch();
    const {leaveBalance} = useSelector((state: RootState) => state.leave);

  return (
    <div>
      Helo User
    </div>
  )
}

export default UserDashboard