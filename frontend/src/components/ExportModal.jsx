import React, { useState } from 'react';
import { 
  Download, 
  X, 
  FileText, 
  BarChart2, 
  MousePointer2, 
  Megaphone, 
  AlertCircle, 
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';

const ExportModal = ({ isOpen, onClose, onExport, dateRange: currentRange }) => {
  const [exportType, setExportType] = useState('overview');
  const [exportFormat, setExportFormat] = useState('csv');
  const [rangeType, setRangeType] = useState('standard'); // 'standard' or 'custom'
  const [standardDays, setStandardDays] = useState(currentRange || '30');
  const [customRange, setCustomRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    
    const options = rangeType === 'standard' 
      ? { days: parseInt(standardDays) } 
      : { from: customRange.from, to: customRange.to };
      
    // Trigger the export
    onExport(exportType, exportFormat, options);
    
    // Aesthetic delay to show "Exporting..." state
    setTimeout(() => {
      setIsExporting(false);
      onClose();
    }, 1500);
  };

  const dataTypes = [
    { id: 'overview', label: 'Overview', icon: BarChart2, desc: 'Aggregated traffic summary' },
    { id: 'pageviews', label: 'Pageviews', icon: FileText, desc: 'Individual page visit logs' },
    { id: 'events', label: 'Events', icon: MousePointer2, desc: 'Custom actions & interactions' },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone, desc: 'UTM & referral performance' },
    { id: 'errors', label: 'Errors', icon: AlertCircle, desc: 'JS errors & failed requests' }
  ];

  const formats = [
    { id: 'csv', label: 'CSV', desc: 'Excel / Spreadsheets' },
    { id: 'json', label: 'JSON', desc: 'Developer / API Use' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[#09090b]/90 border border-white/10 rounded-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          {/* Header Gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />

          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-zinc-200 transition-colors z-10"
          >
            <X size={20} />
          </button>

          <div className="p-8">
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Download className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Export Analytics</h2>
                  <p className="text-zinc-400 text-sm">Download your raw data and insights for external analysis.</p>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Config */}
              <div className="space-y-6">
                {/* Data Type Selection */}
                <section>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 block">
                    Choose Dataset
                  </label>
                  <div className="space-y-2">
                    {dataTypes.map((type) => {
                      const Icon = type.icon;
                      const isActive = exportType === type.id;
                      return (
                        <button
                          key={type.id}
                          onClick={() => setExportType(type.id)}
                          className={`w-full group flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                            isActive 
                              ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-400' 
                              : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/[0.04] hover:border-white/10'
                          }`}
                        >
                          <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-emerald-500/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                            <Icon size={18} />
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{type.label}</div>
                            <div className="text-[11px] opacity-60 leading-none mt-1">{type.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>

              {/* Right Column: Time & Format */}
              <div className="space-y-6">
                {/* Time Range */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">
                      Time Horizon
                    </label>
                    <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
                      <button 
                        onClick={() => setRangeType('standard')}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${rangeType === 'standard' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        Standard
                      </button>
                      <button 
                        onClick={() => setRangeType('custom')}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${rangeType === 'custom' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        Custom
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    {rangeType === 'standard' ? (
                      <div className="grid grid-cols-2 gap-2">
                        {['1', '7', '30', '90'].map(days => (
                          <button
                            key={days}
                            onClick={() => setStandardDays(days)}
                            className={`flex items-center justify-center gap-2 p-2 rounded-lg border text-xs font-semibold transition-all ${
                              standardDays === days 
                                ? 'bg-white/10 border-white/20 text-white shadow-sm' 
                                : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                            }`}
                          >
                            <Clock size={12} className="opacity-50" />
                            {days === '1' ? '24 Hours' : `${days} Days`}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Calendar size={14} className="opacity-50" />
                          <span className="text-xs font-medium">Select Period</span>
                        </div>
                        <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2">
                          <input 
                            type="date" 
                            value={customRange.from}
                            onChange={(e) => setCustomRange(prev => ({ ...prev, from: e.target.value }))}
                            className="bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors w-full [color-scheme:dark]"
                          />
                          <ArrowRight size={12} className="text-zinc-600" />
                          <input 
                            type="date" 
                            value={customRange.to}
                            onChange={(e) => setCustomRange(prev => ({ ...prev, to: e.target.value }))}
                            className="bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors w-full [color-scheme:dark]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* File Format */}
                <section>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 block">
                    Export Format
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {formats.map((f) => {
                      const isActive = exportFormat === f.id;
                      return (
                        <button
                          key={f.id}
                          onClick={() => setExportFormat(f.id)}
                          className={`relative p-3 rounded-xl border text-left transition-all ${
                            isActive 
                              ? 'bg-white/10 border-white/20 text-white ring-1 ring-white/10 shadow-lg' 
                              : 'bg-white/[0.02] border-white/5 text-zinc-500 hover:bg-white/[0.04] hover:border-white/10'
                          }`}
                        >
                          <div className="font-bold text-sm tracking-tight">{f.label}</div>
                          <div className="text-[10px] opacity-60 leading-none mt-1">{f.desc}</div>
                          {isActive && (
                            <div className="absolute top-2 right-2">
                              <CheckCircle2 size={12} className="text-emerald-400" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>
            </div>

            {/* Actions */}
            <footer className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span>Standardized UTC timestamps</span>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Close
                </button>
                <Button 
                  onClick={handleExport}
                  disabled={isExporting}
                  className={`min-w-[140px] px-8 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#09090b] text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] relative overflow-hidden`}
                >
                  <AnimatePresence mode="wait">
                    {isExporting ? (
                      <motion.span 
                        key="exporting"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                      >
                        <div className="w-4 h-4 border-2 border-[#09090b]/20 border-t-[#09090b] rounded-full animate-spin" />
                        Preparing...
                      </motion.span>
                    ) : (
                      <motion.span 
                        key="download"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                      >
                        <Download size={16} />
                        Download
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            </footer>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExportModal;
