import './App.css'
import { Route, Routes } from 'react-router-dom'
import Onboard from './components/onboard/Onboard'
import SignupLayout from './components/layout/SignupLayout'
import OnboardRedirect from './components/onboard/onboardComponents/OnboardRedirect'
import Dashboard from './components/dashboard/Dashboard'
import Organization from './components/organization/Organization'
import LmsLayout from './components/layout/LmsLayout'
import Leave from './components/leave/Leave'
import Holidays from './components/holiday/Holidays'

function App() {

  return (
    <Routes>
      <Route path="/" element={<SignupLayout />} />
      <Route path="/onboard-redirect" element={<OnboardRedirect />} />
      <Route path="/onboard" element={<Onboard />} />
      <Route element={<LmsLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/organization" element={<Organization />} />
        <Route path="/leave" element={<Leave />} />
        <Route path="/holiday" element={<Holidays />} />
      </Route>
    </Routes>
  )
}

export default App