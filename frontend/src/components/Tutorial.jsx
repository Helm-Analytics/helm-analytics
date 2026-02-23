import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, ChevronRight, ChevronLeft, Zap, Shield, LayoutDashboard, CheckCircle2, GraduationCap } from 'lucide-react';

const Tutorial = ({ onComplete }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState(0);
    const [rect, setRect] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    const steps = [
        {
            title: "Welcome to Helm",
            description: "Helm provides deep intelligence and active defense for your web properties. Let's take a quick tour of your new control center.",
            targetId: null,
            path: "/dashboard",
            position: "center"
        },
        {
            title: "Executive Summary",
            description: "See your total traffic, unique visitors, and quality scores. We track everything without intrusive cookies.",
            targetId: "tut-stats-grid",
            path: "/dashboard",
            position: "bottom"
        },
        {
            title: "Traffic Health Score",
            description: "Our signature KPI. A real-time measure of traffic quality, filtering out bots and malicious scrapers.",
            targetId: "tut-stats-grid",
            path: "/dashboard",
            position: "bottom"
        },
        {
            title: "Plausible Content Insights",
            description: "Understand your top performing pages with our new horizontal progress bars. We show page titles instead of messy URLs.",
            targetId: "tut-top-pages",
            path: "/dashboard",
            position: "top"
        },
        {
            title: "Referrer Analysis",
            description: "See exactly where your traffic is coming from. Click 'View All' for a deep dive into acquisition channels.",
            targetId: "tut-top-referrers",
            path: "/dashboard",
            position: "top"
        },
        {
            title: "AI Insights Engine",
            description: "Helm's AI automatically analyzes traffic patterns and suggests mitigations for sudden anomalies.",
            targetId: "tut-insights-card",
            path: "/dashboard",
            position: "left"
        },
        {
            title: "User Flow Mapping",
            description: "Visualize how users move through your site. See the most common paths and where you're losing traffic.",
            targetId: "tut-nav-user-flow",
            path: "/dashboard",
            position: "right"
        },
        {
            title: "Interactive Map",
            description: "Nodes represent pages, and edges show transitions. Thick lines indicate high-traffic corridors.",
            targetId: "tut-user-flow-legend",
            path: "/user-flow",
            position: "right"
        },
        {
            title: "Campaign Attribution",
            description: "Helm automatically tracks UTM parameters from your marketing ads without any extra configuration.",
            targetId: "tut-nav-campaigns",
            path: "/user-flow", // Transitioning from user flow to campaigns
            position: "right"
        },
        {
            title: "Auto-Detected Campaigns",
            description: "If you have data, it'll appear here. If not, this guide shows you how to tag your links right away.",
            targetId: "tut-campaigns-empty",
            path: "/campaigns",
            position: "top"
        },
        {
            title: "Web Vitals Monitor",
            description: "Track LCP, CLS, and FID to ensure your site stays lightning fast and user friendly.",
            targetId: "tut-web-vitals",
            path: "/dashboard",
            position: "top"
        },
        {
            title: "Active Defense",
            description: "Ready to protect your site? Configure 'Shield Mode' in the security settings to block threats automatically.",
            targetId: "tut-nav-security",
            path: "/dashboard",
            position: "right"
        },
        {
            title: "Ready to Launch?",
            description: "You're all set. Copy your tracking script, add it to your site, and watch the intelligence flow in.",
            targetId: "tut-setup-guide",
            path: "/dashboard",
            position: "left"
        }
    ];

    const currentStep = steps[step];

    // Position Calculator
    const updatePosition = useCallback(() => {
        if (!currentStep.targetId) {
            setRect(null);
            return;
        }

        const el = document.getElementById(currentStep.targetId);
        if (el) {
            const r = el.getBoundingClientRect();
            setRect({
                top: r.top,
                left: r.left,
                width: r.width,
                height: r.height,
                bottom: r.bottom,
                right: r.right
            });
        } else {
            // Element not found (maybe navigating?), keep retrying
        }
    }, [currentStep]);

    // Navigation and Element Tracking
    useEffect(() => {
        // If route matches, look for element
        if (location.pathname === currentStep.path) {
            // Scroll element into view immediately if it exists
            if (currentStep.targetId) {
                const el = document.getElementById(currentStep.targetId);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }

            // Slight delay to allow render and smooth scroll to finish
            const timer = setTimeout(updatePosition, 600);
            const interval = setInterval(updatePosition, 1000); // Poll for resize/layout shifts
            
            // Add resize listener
            window.addEventListener('scroll', updatePosition);
            window.addEventListener('resize', updatePosition);

            return () => {
                clearTimeout(timer);
                clearInterval(interval);
                window.removeEventListener('scroll', updatePosition);
                window.removeEventListener('resize', updatePosition);
            };
        } else {
            // Navigate if wrong page
            navigate(currentStep.path);
        }
    }, [step, currentStep, location.pathname, navigate, updatePosition]);

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(s => s + 1);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (step > 0) setStep(s => s - 1);
    };

    // Calculate Popover Position
    const getPopoverStyle = () => {
        if (!rect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
        
        const gap = 20;
        let style = {};

        switch (currentStep.position) {
            case 'bottom':
                style = { top: rect.bottom + gap, left: rect.left + (rect.width / 2), transform: 'translateX(-50%)' };
                break;
            case 'top':
                style = { bottom: (window.innerHeight - rect.top) + gap, left: rect.left + (rect.width / 2), transform: 'translateX(-50%)' };
                break;
            case 'left':
                style = { top: rect.top + (rect.height / 2), right: (window.innerWidth - rect.left) + gap, transform: 'translateY(-50%)' };
                break;
            case 'right':
                style = { top: rect.top, left: rect.right + gap };
                break;
            default:
                style = { top: rect.bottom + gap, left: rect.left };
        }
        
        // Boundary checks (simple clamp) can be added here if needed
        return style;
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden">
            {/* Dimmed Overlay (4 parts) */}
            {rect && (
                <>
                    <div className="absolute bg-black/60 transition-all duration-300" style={{ top: 0, left: 0, right: 0, height: rect.top }} />
                    <div className="absolute bg-black/60 transition-all duration-300" style={{ top: rect.bottom, left: 0, right: 0, bottom: 0 }} />
                    <div className="absolute bg-black/60 transition-all duration-300" style={{ top: rect.top, left: 0, width: rect.left, height: rect.height }} />
                    <div className="absolute bg-black/60 transition-all duration-300" style={{ top: rect.top, right: 0, left: rect.right, height: rect.height }} />
                    
                    {/* Highlight Box Border */}
                    <div 
                        className="absolute border-2 border-accent shadow-[0_0_30px_rgba(14,165,233,0.3)] transition-all duration-300 rounded-lg pointer-events-none"
                        style={{ top: rect.top - 4, left: rect.left - 4, width: rect.width + 8, height: rect.height + 8 }}
                    />
                </>
            )}
            
            {!rect && <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />}

            {/* Popover Card */}
            <div 
                className="absolute w-80 bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl p-6 transition-all duration-500"
                style={getPopoverStyle()}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-accent/10 rounded-lg">
                        <GraduationCap className="w-5 h-5 text-accent" />
                    </div>
                    <button onClick={onComplete} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                
                <h3 className="text-lg font-bold text-foreground mb-2">{currentStep.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {currentStep.description}
                </p>

                <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest leading-none">
                        {step + 1} / {steps.length}
                    </span>
                    <div className="flex gap-2">
                        <button 
                            onClick={handlePrev}
                            disabled={step === 0}
                            className="p-2 text-muted-foreground hover:bg-secondary rounded-lg disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={handleNext}
                            className="px-4 py-2 bg-primary text-primary-foreground dark:bg-indigo-500 dark:text-white dark:hover:bg-indigo-400 text-xs font-bold rounded-lg shadow-lg shadow-primary/20 dark:shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            {step === steps.length - 1 ? "Finish" : "Next"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tutorial;
