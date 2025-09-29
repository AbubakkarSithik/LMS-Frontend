import React from 'react'
import InviteUser from '../onboard/InviteUser'
import LmsLayout from '../layout/LmsLayout'

const Settings:React.FC = () => {
  return (
    <LmsLayout>
        <InviteUser onFinish={() => {}} />
    </LmsLayout>
  )
}

export default Settings