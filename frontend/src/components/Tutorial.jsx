import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, LayoutDashboard, Shield, Zap, Sparkles, CheckCircle2 } from 'lucide-react';

const Tutorial = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation after mount
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const steps = [
        {
            title: "Welcome to Helm Intelligence",
            description: "You're now at the helm of your website's data. Let's take a quick 1-minute tour to get you started.",
            icon: Sparkles,
            color: "text-accent"
        },
        {
            title: "Live Stats Dashboard",
            description: "Monitor your traffic in real-time. We track unique visits, bounce rates, and average session duration with surgical precision.",
            icon: LayoutDashboard,
            color: "text-blue-500"
        },
        {
            title: "Advanced Security",
            description: "Our 'Shield Mode' and 'Spider Trap' protect your site from bots and scrapers. View threat scores for every visitor.",
            icon: Shield,
            color: "text-emerald-500"
        },
        {
            title: "AI Business Insights",
            description: "Meet Helm Assistant. It analyzes your data to provide actionable suggestions and identifies anomalies before they become problems.",
            icon: Zap,
            color: "text-amber-500"
        },
        {
            title: "Integration Ready",
            description: "Copy your tracking script from the dashboard and you're good to go. Need more? Check our Help & Docs for backend integrations.",
            icon: CheckCircle2,
            color: "text-accent"
        }
    ];

    const nextStep = () => {
        if (step < steps.length - 1) {
            setStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const prevStep = () => {
        if (step > 0) {
            setStep(prev => prev - 1);
        }
    };

    const handleComplete = () => {
        setIsVisible(false);
        setTimeout(onComplete, 500);
    };

    const currentStep = steps[step];
    const Icon = currentStep.icon;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 transition-all duration-700 ${isVisible ? 'bg-black/40 backdrop-blur-sm' : 'bg-transparent pointer-events-none'}`}>
            <div className={`w-full max-w-md bg-white dark:bg-[#0F172A] rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 transform ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-secondary/30 flex">
                    {steps.map((_, i) => (
                        <div key={i} className={`h-full transition-all duration-500 ${i <= step ? 'bg-accent' : 'bg-transparent'}`} style={{ width: `${100 / steps.length}%` }} />
                    ))}
                </div>

                <div className="p-8 space-y-8">
                    {/* Header/Close */}
                    <div className="flex justify-between items-start">
                        <div className={`p-4 rounded-2xl bg-secondary/50 border border-border/50 ${currentStep.color}`}>
                            <Icon className="w-8 h-8" />
                        </div>
                        <button onClick={handleComplete} className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-secondary rounded-xl">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-4 min-h-[160px]">
                        <h2 className="text-2xl font-heading font-extrabold text-foreground tracking-tight animate-in fade-in slide-in-from-left duration-500">
                            {currentStep.title}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                            {currentStep.description}
                        </p>
                    </div>

                    {/* Footer Nav */}
                    <div className="flex items-center justify-between pt-4">
                        <button 
                            onClick={prevStep} 
                            disabled={step === 0}
                            className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-all ${step === 0 ? 'opacity-0' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Prev
                        </button>

                        <button 
                            onClick={nextStep}
                            className="bg-primary text-white px-8 py-3 rounded-2xl font-bold text-sm tracking-widest flex items-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            {step === steps.length - 1 ? "Get Started" : "Next"}
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Counter */}
                <div className="bg-secondary/20 p-4 border-t border-border/40 text-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
                        Tutorial Step {step + 1} of {steps.length}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Tutorial;
