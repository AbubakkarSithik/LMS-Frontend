import React, { useEffect } from 'react'
import InviteUser from '../onboard/onboardComponents/InviteUser'
import ListingUsers from './organizationComponents/ListingUsers'
import OrganizationSetup from './organizationComponents/OrganizationSetup'
import type { RootState } from '@/lib/store/store'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const Organization:React.FC = () => {
  const navigate = useNavigate();
  const {isAdmin} = useSelector((state: RootState) => state.auth);
  useEffect(() => {
    if(!isAdmin){
      navigate("/dashboard");
    }
  },[])
  return (
        <div>
            <InviteUser />
            <ListingUsers />
            <OrganizationSetup />
        </div>
  )
}

export default Organization