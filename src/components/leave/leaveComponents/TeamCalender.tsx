import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RiCalendarLine } from '@remixicon/react'
import React, { useState } from 'react'
import TeamGridCalender from './teamCalenders/TeamGridCalender'
import TeamListCalendar from './teamCalenders/TeamListCalender'

const TeamCalender: React.FC = () => {
    const [gridMode, setGridMode] = useState(false);
  return (
    <div className="bg-white rounded p-6 shadow-none border">
       <div className="text-2xl text-primary border-b pb-2 flex items-center justify-between font-semibold">
            <div className='flex items-center'><RiCalendarLine className="mr-2 text-ts12 " /> Team Calender </div>
                <div className="flex items-center space-x-2">
                    <Switch id="grid-mode" onCheckedChange={() => setGridMode(value => !value)} />
                    <Label htmlFor="grid-mode">Grid View</Label>
                </div>
        </div>
        {
            gridMode ? <TeamGridCalender/> : <TeamListCalendar/>
        }
    </div>
  )
}

export default TeamCalender