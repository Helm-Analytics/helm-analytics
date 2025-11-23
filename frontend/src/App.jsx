import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import Login from "./pages/Login"
import Signup from "./pages/SignUp"
import SessionReplay from "./pages/SessionReplay"
import FunnelsPage from "./pages/FunnelsPage"
import FirewallPage from "./pages/FirewallPage"
import HeatmapPage from "./pages/HeatmapPage"
import ErrorsPage from "./pages/ErrorsPage"
import Layout from "./components/Layout"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes wrapped in Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/session-replay" element={<SessionReplay />} />
          <Route path="/heatmap" element={<HeatmapPage />} />
          <Route path="/errors" element={<ErrorsPage />} />
          <Route path="/funnels" element={<FunnelsPage />} />
          <Route path="/firewall" element={<FirewallPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App