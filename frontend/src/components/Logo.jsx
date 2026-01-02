import { Shield } from "lucide-react"

const Logo = ({ className = "" }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-xl shadow-lg border border-white/10 overflow-hidden">
        <img src="/logo.png" alt="Helm Logo" className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-heading font-extrabold tracking-tight text-foreground leading-none">Helm</span>
        <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground mt-0.5">Analytics</span>
      </div>
    </div>
  )
}

export default Logo
