import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import Button from './ui/Button';

const ExportModal = ({ isOpen, onClose, onExport, dateRange }) => {
  const [exportType, setExportType] = useState('overview');
  const [exportFormat, setExportFormat] = useState('csv');

  if (!isOpen) return null;

  const handleExport = () => {
    onExport(exportType, exportFormat);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="mb-6">
          <h2 className="text-xl font-heading font-extrabold text-foreground flex items-center gap-2">
            <Download className="w-5 h-5 text-accent" />
            Export Data
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Download your analytics data for the last {dateRange === "1" ? "24 hours" : `${dateRange} days`}.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
              Data Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'pageviews', label: 'Pageviews' },
                { id: 'events', label: 'Custom Events' },
                { id: 'campaigns', label: 'Campaigns' },
                { id: 'errors', label: 'Errors' }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setExportType(type.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all text-left ${
                    exportType === type.id 
                    ? 'bg-accent/10 border-accent/30 text-accent border' 
                    : 'bg-secondary/50 border-border border text-foreground hover:bg-secondary hover:border-border/80'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
              Format
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setExportFormat('csv')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  exportFormat === 'csv' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'bg-secondary/50 border-border border text-foreground hover:bg-secondary'
                }`}
              >
                CSV
              </button>
              <button
                onClick={() => setExportFormat('json')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  exportFormat === 'json' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'bg-secondary/50 border-border border text-foreground hover:bg-secondary'
                }`}
              >
                JSON
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="px-5">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleExport} className="px-5 group flex items-center gap-2">
            <Download size={16} className="group-hover:-translate-y-0.5 transition-transform" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
