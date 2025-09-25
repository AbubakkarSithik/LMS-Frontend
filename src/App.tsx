import './App.css'
import { Route, Routes } from 'react-router-dom'
import Onboard from './components/onboard/Onboard'
import SignupLayout from './components/signup/SignupLayout'
import OnboardRedirect from './components/onboard/OnboardRedirect'

function App() {

  return (
    <Routes>
      <Route path="/" element={<SignupLayout />} />
      <Route path="/onboard-redirect" element={<OnboardRedirect />} />
      <Route path="/onboard" element={<Onboard />} />
    </Routes>
  )
}

export default App