import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const PremiumSelect = ({ options, value, onChange, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value) || options[0];

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 bg-secondary border transition-all duration-200 rounded-xl outline-none focus:ring-2 focus:ring-accent/50 ${isOpen ? 'border-accent ring-2 ring-accent/20' : 'border-border/50'}`}
            >
                <div className="flex items-center gap-3">
                    {Icon && <Icon className="w-4 h-4 text-accent" />}
                    <span className="text-sm font-semibold text-foreground">
                        {selectedOption.label}
                    </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <div className={`absolute z-50 w-full mt-2 bg-white dark:bg-[#0F172A] border border-border/60 rounded-xl shadow-2xl overflow-hidden transition-all duration-200 origin-top transform ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                <div className="p-1 space-y-0.5 max-h-[200px] overflow-y-auto custom-scrollbar">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                value === option.value 
                                    ? 'bg-accent/10 text-accent' 
                                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                {option.icon && <option.icon className="w-4 h-4 opacity-70" />}
                                {option.label}
                            </span>
                            {value === option.value && <Check className="w-4 h-4" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PremiumSelect;
