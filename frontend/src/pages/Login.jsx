"use client"

import { useState } from "react"
import { api } from "../api"
import Logo from "../components/Logo"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await api.login(email, password)
      // Store email for subscription page usage tracking
      localStorage.removeItem('isDemo')
      localStorage.setItem('userEmail', email)
      window.location.href = "/dashboard"
    } catch (error) {
      setError(error.error || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen helm-bg flex items-center justify-center p-6 bg-white">
      <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-10">
          <Logo className="justify-center mb-6 scale-125" />
          <h2 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">Intelligence Awaits</h2>
          <p className="text-muted-foreground mt-2 text-sm font-medium">Log in to your Helm Analytics dashboard</p>
        </div>

        <div className="premium-card !p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/0 via-accent to-accent/0 opacity-50"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
                Command Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-4 bg-secondary/50 border border-border/60 rounded-xl text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-medium"
                placeholder="admiral@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
                Access Key
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-4 bg-secondary/50 border border-border/60 rounded-xl text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-medium"
                placeholder="••••••••••••"
              />
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-500 text-xs font-bold animate-in shake-1 border-rose-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] shadow-xl shadow-primary/10 disabled:opacity-70"
            >
              {loading ? "Authenticating..." : "Establish Connection"}
            </button>
          </form>

          <div className="mt-8 text-center pt-8 border-t border-border/50">
            <p className="text-muted-foreground text-xs font-medium">
              New to the platform?{" "}
              <a href="/signup" className="text-accent hover:text-accent/80 font-bold transition-colors">
                Create Account
              </a>
            </p>
          </div>
        </div>
        
        {/* Footer info */}
        <p className="mt-8 text-center text-muted-foreground/40 text-[10px] uppercase font-bold tracking-widest leading-loose">
          Encrypted Session &bull; ISO-27001 Compliant &bull; 256-bit AES
        </p>
      </div>
    </div>
  )
}

export default Login
