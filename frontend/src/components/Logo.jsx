import { Shield } from "lucide-react"

const Logo = ({ className = "" }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="flex items-center justify-center w-12 h-12 rounded-xl overflow-hidden bg-white">
        <img src="/logo.png" alt="Helm Analytics" className="w-full h-full object-contain p-1" />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-heading font-extrabold tracking-tight text-foreground leading-none">Helm</span>
        <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground mt-0.5">Analytics</span>
      </div>
    </div>
  )
}

export default Logo
