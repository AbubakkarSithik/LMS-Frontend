import React, { useEffect , useState} from 'react'
import InviteUser from '../onboard/onboardComponents/InviteUser'
import ListingUsers from './organizationComponents/ListingUsers'
import type { RootState } from '@/lib/store/store'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { RiUserAddLine } from '@remixicon/react'
import { Dialog, DialogContent, DialogDescription , DialogTitle} from '../ui/dialog'
import OrgRelations from './organizationComponents/OrgRelations'

const Organization:React.FC = () => {
  const navigate = useNavigate();
  const {isAdmin , isHR } = useSelector((state: RootState) => state.auth);
  const [inviteDialogOpen , setInviteDialogOpen] = useState(false);
  const handleInviteDialogOpen = () => {
    setInviteDialogOpen(true);
  };
  useEffect(() => {
    if(!isAdmin && !isHR){
      navigate("/dashboard");
    }
  },[])
  return (
        <div className='space-y-4 p-4'>
          <div className='flex items-center justify-between'>
          <h2 className="text-2xl font-semibold text-black">Users</h2>
          { isAdmin && <Button onClick={handleInviteDialogOpen} className="w-fit cursor-pointer flex bg-gradient-to-r from-ts12 via-orange-400 to-orange-700 hover:bg-orange-400 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-md hover:shadow-ts12 text-white">
              <RiUserAddLine size={20} /> Invite
          </Button>}
        </div>
            <ListingUsers />
            <OrgRelations />
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} >
                    <DialogContent showCloseButton={true}>
                          <DialogTitle className="sr-only"></DialogTitle>
                          <DialogDescription className="sr-only"></DialogDescription>
                          <InviteUser />
                    </DialogContent>
            </Dialog>
        </div>
  )
}

export default Organization