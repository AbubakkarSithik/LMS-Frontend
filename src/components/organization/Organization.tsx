import React, { useEffect , useState} from 'react'
import InviteUser from '../onboard/onboardComponents/InviteUser'
import ListingUsers from './organizationComponents/ListingUsers'
import OrganizationSetup from './organizationComponents/OrganizationSetup'
import type { RootState } from '@/lib/store/store'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { RiUserAddLine } from '@remixicon/react'
import { Dialog, DialogContent } from '../ui/dialog'

const Organization:React.FC = () => {
  const navigate = useNavigate();
  const {isAdmin} = useSelector((state: RootState) => state.auth);
  const [inviteDialogOpen , setInviteDialogOpen] = useState(false);
  const handleInviteDialogOpen = () => {
    setInviteDialogOpen(true);
  };
  useEffect(() => {
    if(!isAdmin){
      navigate("/dashboard");
    }
  },[])
  return (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
          <h2 className="text-2xl font-semibold text-black">Users</h2>
          <Button onClick={handleInviteDialogOpen} className="w-fit cursor-pointer flex bg-gradient-to-r from-ts12 via-orange-400 to-orange-700 hover:bg-orange-400 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-md hover:shadow-ts12 text-white">
              <RiUserAddLine size={20} /> Invite
          </Button>
        </div>

            <ListingUsers />
            <OrganizationSetup />

            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} aria-describedby="dialog-invite-user">
                    <DialogContent showCloseButton={true}>
                          <InviteUser />
                    </DialogContent>
            </Dialog>
        </div>
  )
}

export default Organization