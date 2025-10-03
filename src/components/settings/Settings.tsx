import React from 'react'
import InviteUser from '../onboard/InviteUser'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ListingUsers from './settingsComponents/ListingUsers'
import Holidays from './settingsComponents/Holidays'

const Settings:React.FC = () => {
  return (
        <Tabs defaultValue="invite-user" className="w-full" >
          <TabsList className="flex w-full bg-orange-100">
            <TabsTrigger className='data-[state=active]:bg-ts12 data-[state=active]:text-white cursor-pointer' value="invite-user">Invite Team</TabsTrigger>
            <TabsTrigger className='data-[state=active]:bg-ts12 data-[state=active]:text-white cursor-pointer' value="holidays">Holidays</TabsTrigger>
            <TabsTrigger className='data-[state=active]:bg-ts12 data-[state=active]:text-white cursor-pointer' value="leave-types">Leave Types</TabsTrigger>
          </TabsList>
          <TabsContent value="invite-user" className="w-full my-5 mx-2 grid grid-cols-2 gap-0">
            <InviteUser />
            <ListingUsers />
          </TabsContent>
          <TabsContent value="holidays" className="w-full my-5 mx-2">
            <Holidays />
          </TabsContent>
          <TabsContent value="leave-types" className="w-full my-5 mx-2">
            Leave Types
          </TabsContent>
        </Tabs>
  )
}

export default Settings