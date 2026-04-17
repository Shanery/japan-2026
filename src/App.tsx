import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import DayDetail from './pages/DayDetail'
import Budget from './pages/Budget'
import Memories from './pages/Memories'
import TravelInfo from './pages/TravelInfo'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/day/:dayNumber" element={<DayDetail />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/memories" element={<Memories />} />
        <Route path="/memories/:dayNumber" element={<Memories />} />
        <Route path="/travel" element={<TravelInfo />} />
      </Routes>
    </Layout>
  )
}
