import { useState, useEffect } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { LogOut, LayoutDashboard, Shield, GitMerge, PlayCircle, Plus, Trash2, MousePointer2, AlertOctagon } from "lucide-react"
import { api } from "../api"
import Logo from "./Logo"
import ChatWidget from "./ChatWidget"

const Layout = () => {
  const [sites, setSites] = useState([])
  const [selectedSite, setSelectedSite] = useState(null)
  const [newSiteName, setNewSiteName] = useState("")
  const [authLoading, setAuthLoading] = useState(true)
  
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.getSites()
        fetchSites()
      } catch (error) {
        console.error("Authentication check failed:", error)
        navigate("/login")
      } finally {
        setAuthLoading(false)
      }
    }
    checkAuth()
  }, [navigate])

  const fetchSites = async () => {
    try {
      const sitesData = await api.getSites()
      setSites(sitesData || [])
      
      // Restore selection from local storage or default to first
      const savedSiteId = localStorage.getItem("siteId")
      if (savedSiteId && sitesData) {
          const found = sitesData.find(s => s.id === savedSiteId)
          if (found) {
              setSelectedSite(found)
              return
          }
      }

      if (sitesData && sitesData.length > 0) {
        setSelectedSite(sitesData[0])
      }
    } catch (error) {
      console.error("Failed to fetch sites:", error)
      setSites([])
    }
  }

  useEffect(() => {
    if (selectedSite) {
      localStorage.setItem("siteId", selectedSite.id)
    }
  }, [selectedSite])

  const addSite = async (e) => {
    e.preventDefault()
    if (!newSiteName.trim()) return

    try {
      const newSite = await api.addSite(newSiteName)
      setNewSiteName("")
      fetchSites() // Refresh list
      if (newSite) {
        setSelectedSite(newSite)
      }
    } catch (error) {
      console.error("Failed to add site:", error)
    }
  }

  const handleDeleteSite = async (siteId) => {
    if (!window.confirm("Are you sure you want to delete this site? This action cannot be undone.")) {
      return
    }

    try {
      await api.deleteSite(siteId)
      const updatedSites = await api.getSites()
      setSites(updatedSites || [])

      if (selectedSite && selectedSite.id === siteId) {
        setSelectedSite(updatedSites && updatedSites.length > 0 ? updatedSites[0] : null)
      }
    } catch (error) {
      console.error("Failed to delete site:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await api.logout()
      navigate("/login")
    } catch (error) {
      console.error("Logout failed:", error)
      navigate("/login")
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/session-replay", label: "Session Replay", icon: PlayCircle },
    { path: "/heatmap", label: "Heatmaps", icon: MousePointer2 },
    { path: "/errors", label: "Issues", icon: AlertOctagon },
    { path: "/funnels", label: "Funnels", icon: GitMerge },
    { path: "/firewall", label: "Firewall", icon: Shield },
  ]

  return (
    <div
      className="min-h-screen bg-slate-900 flex text-slate-200 font-sans"
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.15) 1px, transparent 0)`,
        backgroundSize: "20px 20px",
      }}
    >
      {/* Sidebar */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 flex-shrink-0 flex flex-col p-6 h-screen sticky top-0 overflow-y-auto">
        <Logo className="mb-8" />

        {/* Site Switcher */}
        <div className="mb-8">
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">Your Sites</h3>
          <div className="space-y-2">
            {sites.length > 0 ? (
              sites.map((site) => (
                <div key={site.id} className="flex items-center justify-between group">
                  <button
                    onClick={() => setSelectedSite(site)}
                    className={`flex-1 text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedSite?.id === site.id 
                        ? "bg-indigo-600 text-white font-medium" 
                        : "text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {site.name}
                  </button>
                  <button
                    onClick={() => handleDeleteSite(site.id)}
                    className="p-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete site"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-slate-500 text-sm px-3">No sites yet.</div>
            )}
          </div>
        </div>

        {/* Add Site */}
        <div className="mb-8">
          <form onSubmit={addSite} className="flex space-x-2">
            <input
              type="text"
              value={newSiteName}
              onChange={(e) => setNewSiteName(e.target.value)}
              placeholder="New site name..."
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="p-2 bg-slate-700 hover:bg-indigo-600 text-white rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Navigation */}
        <div className="space-y-1 flex-1">
           <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">Menu</h3>
           {navItems.map((item) => {
             const Icon = item.icon
             const isActive = location.pathname === item.path
             return (
               <Link
                 key={item.path}
                 to={item.path}
                 className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                   isActive 
                     ? "bg-indigo-500/10 text-indigo-400" 
                     : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
                 }`}
               >
                 <Icon className="w-5 h-5" />
                 <span className="font-medium">{item.label}</span>
               </Link>
             )
           })}
        </div>

        {/* Logout */}
        <div className="pt-6 border-t border-slate-700 mt-auto">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-2 w-full rounded-md text-slate-400 hover:bg-slate-700/50 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto h-screen">
        <div className="p-8 max-w-7xl mx-auto">
           {/* Pass context to children */}
           <Outlet context={{ sites, selectedSite }} />
        </div>
      </div>

      <ChatWidget siteId={selectedSite?.id} />
    </div>
  )
}

export default Layout
