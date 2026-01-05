import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { lazy, Suspense } from "react"
import Layout from "./components/Layout"

// Lazy load pages
const Dashboard = lazy(() => import("./pages/Dashboard"))
const Login = lazy(() => import("./pages/Login"))
const Signup = lazy(() => import("./pages/SignUp"))
const SessionReplay = lazy(() => import("./pages/SessionReplay"))
const FunnelsPage = lazy(() => import("./pages/FunnelsPage"))
const FirewallPage = lazy(() => import("./pages/FirewallPage"))
const HeatmapPage = lazy(() => import("./pages/HeatmapPage"))
const ErrorsPage = lazy(() => import("./pages/ErrorsPage"))
const CustomEventsPage = lazy(() => import("./pages/CustomEventsPage"))
const DocsPage = lazy(() => import("./pages/DocsPage"))
const ActivityPage = lazy(() => import("./pages/ActivityPage"))
const CampaignsPage = lazy(() => import("./pages/CampaignsPage"))
const UserFlowPage = lazy(() => import("./pages/UserFlowPage"))

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-background">
    <div className="w-12 h-12 border-4 border-accent rounded-full animate-spin border-t-transparent"></div>
  </div>
)

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
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
            <Route path="/custom-events" element={<CustomEventsPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/firewall" element={<FirewallPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/user-flow" element={<UserFlowPage />} />
            <Route path="/docs" element={<DocsPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
