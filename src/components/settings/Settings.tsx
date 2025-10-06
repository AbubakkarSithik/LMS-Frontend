import React, { useEffect } from 'react'
import InviteUser from '../onboard/onboardComponents/InviteUser'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ListingUsers from './settingsComponents/ListingUsers'
import Holidays from './settingsComponents/Holidays'
import LeaveTypes from './settingsComponents/LeaveTypes'
import OrganizationSetup from './settingsComponents/OrganizationSetup'
import type { RootState } from '@/lib/store/store'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const Settings:React.FC = () => {
  const navigate = useNavigate();
  const {isAdmin} = useSelector((state: RootState) => state.auth);
  useEffect(() => {
    if(!isAdmin){
      navigate("/dashboard");
    }
  },[])
  return (
        <Tabs defaultValue="invite-user" className="w-full" >
          <TabsList className="flex w-full bg-orange-100">
            <TabsTrigger className='data-[state=active]:bg-ts12 data-[state=active]:text-white cursor-pointer' value="invite-user">Invite Team</TabsTrigger>
            <TabsTrigger className='data-[state=active]:bg-ts12 data-[state=active]:text-white cursor-pointer' value="holidays">Holidays</TabsTrigger>
            <TabsTrigger className='data-[state=active]:bg-ts12 data-[state=active]:text-white cursor-pointer' value="leave-types">Leave Types</TabsTrigger>
          </TabsList>
          <TabsContent value="invite-user" className="w-full my-3 grid grid-cols-2 gap-0">
            <InviteUser />
            <ListingUsers />
            <div className='col-span-2 mt-4'>
                <OrganizationSetup />
            </div>
          </TabsContent>
          <TabsContent value="holidays" className="w-full my-3">
            <Holidays />
          </TabsContent>
          <TabsContent value="leave-types" className="w-full my-3">
            <LeaveTypes/>
          </TabsContent>
        </Tabs>
  )
}

export default Settings