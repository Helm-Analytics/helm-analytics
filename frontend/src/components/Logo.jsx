import { Shield } from "lucide-react"

const Logo = ({ className = "" }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-xl shadow-lg border border-white/10">
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-6 h-6 text-accent"
        >
          {/* Nautical Helm SVG */}
          <circle cx="12" cy="12" r="3" />
          <path d="M12 5V3M12 21v-2M5 12H3M21 12h-2M7.05 7.05L5.64 5.64M18.36 18.36l-1.41-1.41M7.05 16.95l-1.41 1.41M18.36 5.64l-1.41 1.41" />
          <circle cx="12" cy="12" r="7" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-heading font-extrabold tracking-tight text-foreground leading-none">Helm</span>
        <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground mt-0.5">Analytics</span>
      </div>
    </div>
  )
}

export default Logo
