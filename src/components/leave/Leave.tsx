import React , { useState } from 'react'
import LeaveTypes from './leaveComponents/LeaveTypes'
import LeaveRequestForm from './leaveComponents/leaveRequests/LeaveRequestForm'
import PendingRequestsList from './leaveComponents/leaveRequests/PendingRequestsList'
import LeaveHistory from './leaveComponents/leaveRequests/LeaveHistory'
import { useSelector } from 'react-redux'
import type { RootState } from '@/lib/store/store'
import ConsumptionStatus from './leaveComponents/ConsumptionStatus'
import { Calendar, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

const Leave: React.FC = () => {
  const { isAdmin , isEmployee } = useSelector((state: RootState) => state.auth);
  const [sheetOpen, setSheetOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {!isAdmin && <div className="col-span-1">
              <ConsumptionStatus />
          </div>}

          {!isAdmin && <div className='col-span-1'></div>}
          {isAdmin && <div className='col-span-2 text-left text-3xl border-b pb-4 text-ts12'>Summary</div>}

          <div className="flex flex-col items-start justify-start bg-white border rounded p-6 min-w-[200px] max-h-fit">
           {!isAdmin && (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button size="lg" className="gap-2 cursor-pointer bg-gradient-to-r from-ts12 via-orange-400 to-orange-700 hover:bg-orange-400 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-md hover:shadow-ts12 text-white">
                  <Calendar className="w-4 h-4" />
                  Apply Leave
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                <SheetHeader className='sr-only'>
                  <SheetTitle></SheetTitle>
                  <SheetDescription></SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <LeaveRequestForm />
                </div>
              </SheetContent>
            </Sheet>
          )}
          {/* Leave Policy Button */}
        <div className="flex justify-start">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="hover:bg-transparent gap-2 bg-transparent border-none p-0 shadow-none text-ts12 cursor-pointer">
                <FileText className="w-4 h-4 text-black " />
                Leave Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl h-[90vh] overflow-y-auto hide-scroll">
              <DialogHeader className='sr-only'>
                <DialogTitle></DialogTitle>
                <DialogDescription></DialogDescription>
              </DialogHeader>
              <div className="mt-6">
                <LeaveTypes />
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

          {!isEmployee && (
            <div className="col-span-3">
                <PendingRequestsList />
            </div>
          )}
        </div>

        <div className="">
            <LeaveHistory />
        </div>
      </div>
    </div>
  )
}

export default Leave
