import React from 'react'
import Holidays from './leaveComponents/Holidays'
import LeaveTypes from './leaveComponents/LeaveTypes'

const Leave: React.FC = () => {
  return (
    <div>
      <Holidays />
      <LeaveTypes />
    </div>
  )
}

export default Leave
