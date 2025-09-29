import './App.css'
import { Route, Routes } from 'react-router-dom'
import Onboard from './components/onboard/Onboard'
import SignupLayout from './components/signup/SignupLayout'
import OnboardRedirect from './components/onboard/OnboardRedirect'
import Dashboard from './components/dashboards/Dashboard'
import Settings from './components/dashboards/Settings'

function App() {

  return (
    <Routes>
      <Route path="/" element={<SignupLayout />} />
      <Route path="/onboard-redirect" element={<OnboardRedirect />} />
      <Route path="/onboard" element={<Onboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}

export default App