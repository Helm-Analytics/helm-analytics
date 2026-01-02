import { useState, useEffect } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { LogOut, LayoutDashboard, Shield, GitMerge, PlayCircle, Plus, Trash2, MousePointer2, AlertOctagon, ChevronRight, Globe, Book, Sparkles } from "lucide-react"
import { api } from "../api"
import Logo from "./Logo"
import ChatWidget from "./ChatWidget"
import Tutorial from "./Tutorial"

const Layout = () => {
  const [sites, setSites] = useState([])
  const [selectedSite, setSelectedSite] = useState(null)
  const [newSiteName, setNewSiteName] = useState("")
  const [authLoading, setAuthLoading] = useState(true)
  const [showTutorial, setShowTutorial] = useState(false)
  
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
    
    const hasSeenTutorial = localStorage.getItem("helm_seen_tutorial")
    if (!hasSeenTutorial) {
      setShowTutorial(true)
    }
  }, [navigate])

  const fetchSites = async () => {
    try {
      const sitesData = await api.getSites()
      setSites(sitesData || [])
      
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
      fetchSites()
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  const navItems = [
    { path: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { path: "/session-replay", label: "Sessions", icon: PlayCircle },
    { path: "/heatmap", label: "Heatmaps", icon: MousePointer2 },
    { path: "/funnels", label: "Funnels", icon: GitMerge },
    { path: "/firewall", label: "Security", icon: Shield },
    { path: "/docs", label: "Help & Docs", icon: Book },
  ]

  return (
    <div className="min-h-screen flex text-foreground font-sans helm-bg">
      {/* Sidebar - Integrated Modern Style */}
      <aside className="w-64 bg-white dark:bg-[#0b0f1a] border-r border-border/60 flex-shrink-0 flex flex-col h-screen sticky top-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6">
          <Logo className="mb-10 scale-105 origin-left" />

          {/* Site Switcher Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] px-1">Managed Sites</h3>
              <button 
                onClick={() => navigate('/sites/new')} 
                className="p-1 hover:bg-secondary rounded-md text-muted-foreground transition-colors"
                title="Manage Sites"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-1.5 max-h-[240px] overflow-y-auto pr-2 scrollbar-hide">
              {sites.length > 0 ? (
                sites.map((site) => (
                  <button
                    key={site.id}
                    onClick={() => setSelectedSite(site)}
                    className={`w-full flex items-center justify-between group px-3 py-2.5 rounded-xl text-sm transition-all duration-200 border ${
                      selectedSite?.id === site.id 
                        ? "bg-primary text-white border-primary shadow-md active:scale-[0.98]" 
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground border-transparent"
                    }`}
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <Globe className={`w-4 h-4 flex-shrink-0 ${selectedSite?.id === site.id ? 'text-accent' : 'text-muted-foreground/50 group-hover:text-accent/50'}`} />
                      <span className="truncate font-medium">{site.name}</span>
                    </div>
                    {selectedSite?.id === site.id && <ChevronRight className="w-3.5 h-3.5 text-accent" />}
                  </button>
                ))
              ) : (
                <div className="text-muted-foreground/50 text-xs italic px-3 py-2 border border-dashed border-border rounded-xl">Initialize your first site...</div>
              )}
            </div>
          </div>

          {/* Primary Navigation */}
          <nav className="space-y-1.5">
             <h3 className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] px-1 mb-4">Intelligence</h3>
             {navItems.map((item) => {
               const Icon = item.icon
               const isActive = location.pathname === item.path
               return (
                 <Link
                   key={item.path}
                   to={item.path}
                   className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                     isActive 
                       ? "bg-accent/10 dark:bg-accent/20 text-accent border border-accent/20" 
                       : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent"
                   }`}
                 >
                   <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-accent' : 'text-muted-foreground/60'}`} />
                   <span className={`font-semibold ${isActive ? 'text-accent' : 'text-muted-foreground'}`}>{item.label}</span>
                 </Link>
               )
             })}
          </nav>
        </div>

        {/* User / Footer Section */}
        <div className="mt-auto p-4 space-y-2">
           <div className="bg-secondary/40 rounded-2xl p-4 border border-border/40 backdrop-blur-sm space-y-2">
              <button
                onClick={() => setShowTutorial(true)}
                className="flex items-center space-x-3 px-2 py-1.5 w-full rounded-lg text-muted-foreground hover:text-accent transition-colors group"
              >
                <div className="p-2 bg-white dark:bg-black/20 rounded-lg shadow-sm border border-border/50 group-hover:border-accent/20 group-hover:bg-accent/5">
                  <Sparkles className="w-4 h-4 text-accent/70 group-hover:text-accent" />
                </div>
                <span className="font-bold text-[10px] uppercase tracking-wider">Show Tutorial</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-2 py-1.5 w-full rounded-lg text-muted-foreground hover:text-rose-500 transition-colors group"
              >
                <div className="p-2 bg-white dark:bg-black/20 rounded-lg shadow-sm border border-border/50 group-hover:border-rose-200 group-hover:bg-rose-50 dark:group-hover:bg-rose-950/20">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs uppercase tracking-wider">Log Out</span>
              </button>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto h-screen bg-transparent relative">
        <div className="p-8 pb-20 max-w-7xl mx-auto">
           {/* Global Site Context Indicator (Mobile scale) */}
           <div className="md:hidden flex items-center justify-between mb-8 pb-4 border-b border-border/50">
              <Logo className="scale-90 origin-left" />
           </div>

           <Outlet context={{ sites, selectedSite }} />
        </div>
        
        {/* Subtle Decorative Gradient */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      </main>

      <ChatWidget siteId={selectedSite?.id} />
      {showTutorial && (
        <Tutorial onComplete={() => {
          setShowTutorial(false)
          localStorage.setItem("helm_seen_tutorial", "true")
        }} />
      )}
    </div>
  )
}

export default Layout
