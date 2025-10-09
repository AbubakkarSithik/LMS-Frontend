import React from 'react'
import type { RootState } from '@/lib/store/store'
import { useSelector } from 'react-redux'
import AdminDashboard from './dashboardComponents/AdminDashboard';
import UserDashboard from './dashboardComponents/UserDashboard';
import { Separator } from '../ui/separator';

const Dashboard: React.FC = () => {
  const { isAdmin } = useSelector((state: RootState) => state.auth);
  return (
        <div className='space-y-2'>
              <h1 className="text-2xl font-semibold text-left text-ts12">Summary</h1>
              <Separator className='bg-ts12' />
            {isAdmin ? <AdminDashboard /> : <UserDashboard />}
        </div>
  )
}

export default Dashboard