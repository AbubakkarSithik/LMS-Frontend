import React from 'react'
import Holidays from './leaveComponents/Holidays'
import LeaveTypes from './leaveComponents/LeaveTypes'
import { Tabs , TabsList, TabsTrigger, TabsContent } from '../ui/tabs'

const Leave: React.FC = () => {
  return (
    <Tabs defaultValue="leave-request" className="w-full" >
          <TabsList className="flex w-full bg-orange-100">
            <TabsTrigger className='data-[state=active]:bg-ts12 data-[state=active]:text-white cursor-pointer' value="leave-request">Request Leave</TabsTrigger>
            <TabsTrigger className='data-[state=active]:bg-ts12 data-[state=active]:text-white cursor-pointer' value="holidays">Holidays</TabsTrigger>
            <TabsTrigger className='data-[state=active]:bg-ts12 data-[state=active]:text-white cursor-pointer' value="leave-types">Leave Types</TabsTrigger>
          </TabsList>
          <TabsContent value="leave-request" className="w-full my-3">
            Leave Request Page
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

export default Leave
