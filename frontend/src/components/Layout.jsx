import { useState, useEffect } from "react"
import { Outlet,useLocation, Link, useNavigate } from "react-router-dom"
import { LayoutDashboard, PlayCircle, MousePointer2, GitMerge, AlertOctagon, Activity, Shield, Book, Globe, Plus, ChevronRight, Trash2, List, GraduationCap, LogOut, Moon, Sun, Menu, X, Target, CreditCard } from "lucide-react"
import { api } from "../api"
import Logo from "./Logo"
import ChatWidget from "./ChatWidget"
import Tutorial from "./Tutorial"
import Toast from "./Toast"
import ConfirmModal from "./ConfirmModal"


const Layout = () => {
  const [sites, setSites] = useState([])
  const [selectedSite, setSelectedSite] = useState(null)
  const [newSiteName, setNewSiteName] = useState("")
  const [authLoading, setAuthLoading] = useState(true)
  const [showTutorial, setShowTutorial] = useState(false)
  const [isAddSiteOpen, setIsAddSiteOpen] = useState(false)
  const [isSiteDropdownOpen, setIsSiteDropdownOpen] = useState(false)
  
  const location = useLocation()
  const navigate = useNavigate()

  // Dark Mode Logic
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("helm_theme") === "dark" || 
    (!localStorage.getItem("helm_theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
  )

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("helm_theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("helm_theme", "light")
    }
  }, [darkMode])

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
    // Tutorial now triggers after first site is created, not on initial load
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
      setIsAddSiteOpen(false)
      
      // Show success toast
      const { toast } = await import('./Toast')
      toast.success('Site Added Successfully', `${newSiteName} is now ready for tracking`)
      
      // Trigger tutorial on first site creation
      const hasSeenTutorial = localStorage.getItem("helm_seen_tutorial")
      const isFirstSite = sites.length === 0
      if (!hasSeenTutorial && isFirstSite) {
        // Small delay to let the UI update first
        setTimeout(() => setShowTutorial(true), 500)
      }
    } catch (error) {
      console.error("Failed to add site:", error)
      // Show error toast
      const { toast } = await import('./Toast')
      toast.error('Failed to Add Site', 'Please try again or contact support')
    }
  }

  const handleDeleteSite = async (siteId) => {
    const { confirm } = await import('./ConfirmModal')
    const confirmed = await confirm.show(
      'Delete Site',
      'Are you sure you want to delete this site? This action cannot be undone and all data will be permanently removed.',
      {
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'danger'
      }
    )
    
    if (!confirmed) return

    try {
      await api.deleteSite(siteId)
      const updatedSites = await api.getSites()
      setSites(updatedSites || [])

      if (selectedSite && selectedSite.id === siteId) {
        setSelectedSite(updatedSites && updatedSites.length > 0 ? updatedSites[0] : null)
      }
      // Show success toast
      const { toast } = await import('./Toast')
      toast.success('Site Deleted', 'The site and all its data have been removed')
    } catch (error) {
      console.error("Failed to delete site:", error)
      // Show error toast
      const { toast } = await import('./Toast')
      toast.error('Failed to Delete Site', 'Please try again later')
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
    {path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/session-replay", label: "Sessions", icon: PlayCircle },
    { path: "/heatmap", label: "Heatmaps", icon: MousePointer2 },
    { path: "/funnels", label: "Funnels", icon: GitMerge },
    // User Flows removed for Community Edition
    { path: "/campaigns", label: "Campaigns", icon: Target },
    { path: "/custom-events", label: "Events", icon: Activity },
    { path: "/activity", label: "Activity Log", icon: List },
    { path: "/firewall", label: "Security", icon: Shield },
    // Issues & Subscription removed for Community Edition
    { path: "/docs", label: "Help & Docs", icon: Book },
  ]

  return (
    <div className="min-h-screen flex text-foreground font-sans helm-bg">
      {/* Sidebar - Integrated Modern Style */}
      <aside className="w-56 bg-white dark:bg-[#0b0f1a] border-r border-border/60 flex-shrink-0 flex flex-col h-screen sticky top-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-3.5 flex flex-col h-full">
          {localStorage.getItem("isDemo") === "true" && (
            <div className="mb-4 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-center">
                Live Demo Mode
              </p>
            </div>
          )}
          <Logo className="mb-4 origin-left scale-90" />

          {/* Site Switcher Section */}
          <div className="mb-4 flex-shrink-0 relative">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-muted-foreground text-[9px] font-bold uppercase tracking-[0.2em] px-1">Managed Sites</h3>
              <button 
                onClick={() => setIsAddSiteOpen(true)} 
                className="p-1 hover:bg-secondary rounded-md text-muted-foreground transition-colors"
                title="Add New Site"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {/* Selected Site Button (Dropdown Trigger) */}
            {sites.length > 0 ? (
              <div className="relative">
                <div className="w-full flex items-center gap-2">
                  <button
                    onClick={() => sites.length > 1 && setIsSiteDropdownOpen(!isSiteDropdownOpen)}
                    className={`flex-1 flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all duration-200 border bg-primary text-white border-primary shadow-sm dark:bg-accent/10 dark:text-accent dark:border-accent/20 ${sites.length > 1 ? 'hover:shadow-md cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className="flex items-center space-x-2.5 overflow-hidden flex-1">
                      <Globe className="w-3.5 h-3.5 flex-shrink-0 text-accent" />
                      <span className="truncate font-medium">{selectedSite?.name || 'Select site'}</span>
                    </div>
                    {sites.length > 1 && (
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSiteDropdownOpen ? 'rotate-90' : ''}`} />
                    )}
                  </button>
                  
                  {/* Delete button for single site */}
                  {sites.length === 1 && selectedSite && (
                    <button
                      onClick={() => handleDeleteSite(selectedSite.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-all border border-border hover:border-red-500/30"
                      title="Delete site"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  )}
                </div>

                {/* Dropdown Menu */}
                {isSiteDropdownOpen && sites.length > 1 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-64 overflow-y-auto">
                      {sites
                        .filter(site => site.id !== selectedSite?.id)
                        .map((site) => (
                        <button
                          key={site.id}
                          onClick={() => {
                            setSelectedSite(site);
                            setIsSiteDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between group px-3 py-2 text-xs transition-all hover:bg-secondary border-b border-border/30 last:border-b-0"
                        >
                          <div className="flex items-center space-x-2.5 overflow-hidden flex-1">
                            <Globe className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground/50 group-hover:text-accent/70" />
                            <span className="truncate font-medium text-foreground">{site.name}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSite(site.id);
                              setIsSiteDropdownOpen(false);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded transition-all"
                            title="Delete site"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground/50 text-[10px] italic px-2 py-1.5 border border-dashed border-border rounded-lg">Initialize site...</div>
            )}
          </div>

          {/* Primary Navigation */}
          <nav className="space-y-0.5 flex-1 min-h-0">
             <h3 className="text-muted-foreground text-[9px] font-bold uppercase tracking-[0.2em] px-1 mb-2">Intelligence</h3>
             {navItems.map((item) => {
               const Icon = item.icon
               const isActive = location.pathname === item.path
               return (
                 <Link
                   key={item.path}
                   id={`tut-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                   to={item.path}
                   className={`flex items-center space-x-3 px-3 py-1.5 rounded-lg transition-all duration-200 group ${
                     isActive 
                       ? "bg-accent/10 dark:bg-accent/20 text-accent border border-accent/20" 
                       : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent"
                   }`}
                 >
                   <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-accent' : 'text-muted-foreground/60'}`} />
                   <span className={`text-xs font-semibold ${isActive ? 'text-accent' : 'text-muted-foreground'}`}>{item.label}</span>
                 </Link>
               )
             })}
          </nav>

          {/* User / Footer Section */}
          <div className="mt-2 pt-2 border-t border-border/40 space-y-1 flex-shrink-0">
               <button
                 onClick={() => setShowTutorial(true)}
                 className="flex items-center space-x-3 px-2 py-1 w-full rounded-lg text-muted-foreground hover:text-accent transition-colors group"
               >
                 <div className="p-1.5 bg-white dark:bg-black/20 rounded-md shadow-sm border border-border/50 group-hover:border-accent/20 group-hover:bg-accent/5">
                   <GraduationCap className="w-3.5 h-3.5 text-accent/70 group-hover:text-accent" />
                 </div>
                 <span className="font-bold text-[9px] uppercase tracking-wider">Tutorial</span>
               </button>

                <button
                 onClick={() => setDarkMode(!darkMode)}
                 className="flex items-center space-x-3 px-2 py-1 w-full rounded-lg text-muted-foreground hover:text-foreground transition-colors group"
               >
                 <div className="p-1.5 bg-white dark:bg-black/20 rounded-md shadow-sm border border-border/50 group-hover:border-accent/20 group-hover:bg-accent/5">
                   {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                 </div>
                 <span className="font-bold text-[9px] uppercase tracking-wider">{darkMode ? "Light Mode" : "Dark Mode"}</span>
               </button>

               <button
                 onClick={handleLogout}
                 className="flex items-center space-x-3 px-2 py-1 w-full rounded-lg text-muted-foreground hover:text-rose-500 transition-colors group"
               >
                 <div className="p-1.5 bg-white dark:bg-black/20 rounded-md shadow-sm border border-border/50 group-hover:border-rose-200 group-hover:bg-rose-50 dark:group-hover:bg-rose-950/20">
                   <LogOut className="w-3.5 h-3.5" />
                 </div>
                 <span className="font-bold text-[9px] uppercase tracking-wider">Log Out</span>
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

           <Outlet context={{ sites, selectedSite, darkMode }} />
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
      
      {/* Add Site Modal */}
      {isAddSiteOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsAddSiteOpen(false)}>
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Add New Site</h2>
            <form onSubmit={(e) => {
              addSite(e);
              setIsAddSiteOpen(false);
            }}>
              <input
                type="text"
                value={newSiteName}
                onChange={(e) => setNewSiteName(e.target.value)}
                placeholder="Site name (e.g., My Blog)"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent mb-4"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddSiteOpen(false)}
                  className="px-4 py-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newSiteName.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Add Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Toast Notifications */}
      <Toast />
      
      {/* Confirmation Modal */}
      <ConfirmModal />
    </div>
  )
}

export default Layout
