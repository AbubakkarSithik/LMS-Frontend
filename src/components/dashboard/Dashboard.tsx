import React from 'react'
import type { RootState } from '@/lib/store/store'
import { useSelector } from 'react-redux'
import AdminDashboard from './dashboardComponents/AdminDashboard';
import UserDashboard from './dashboardComponents/UserDashboard';

const Dashboard: React.FC = () => {
  const { isAdmin } = useSelector((state: RootState) => state.auth);
  return (
        <div>
            {isAdmin ? <AdminDashboard /> : <UserDashboard />}
        </div>
  )
}

export default Dashboard