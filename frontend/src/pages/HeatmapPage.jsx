import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api';
import { Activity, MousePointer2 } from 'lucide-react';

const HeatmapPage = () => {
  const { selectedSite } = useOutletContext();
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState('');
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (selectedSite) {
      fetchPages();
    }
  }, [selectedSite]);

  const fetchPages = async () => {
    try {
      const data = await api.getHeatmapData(selectedSite.id);
      setPages(data || []);
      if (data && data.length > 0) {
        setSelectedPage(data[0].url);
      }
    } catch (error) {
      console.error("Failed to fetch pages:", error);
    }
  };

  useEffect(() => {
    if (selectedSite && selectedPage) {
      fetchHeatmapData();
    }
  }, [selectedSite, selectedPage]);

  const fetchHeatmapData = async () => {
    setLoading(true);
    try {
      const points = await api.getHeatmapData(selectedSite.id, selectedPage);
      setHeatmapData(points || []);
    } catch (error) {
      console.error("Failed to fetch heatmap data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canvasRef.current || heatmapData.length === 0) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
    
    const radius = 22;
    const maxVal = Math.max(...heatmapData.map(p => p.value), 1);

    heatmapData.forEach(point => {
        const weight = point.value / maxVal;
        ctx.beginPath();
        const alpha = Math.min(Math.max(weight, 0.1), 1); 
        ctx.globalAlpha = 0.15 + (0.4 * alpha);
        
        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
        gradient.addColorStop(0, 'rgba(0,0,0,1)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = gradient;
        ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
        ctx.fill();
    });

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const gradientCanvas = document.createElement('canvas');
    gradientCanvas.width = 1;
    gradientCanvas.height = 256;
    const gCtx = gradientCanvas.getContext('2d');
    const gradient = gCtx.createLinearGradient(0, 0, 0, 256);
    
    gradient.addColorStop(0.3, '#0ea5e9'); // Ocean Teal
    gradient.addColorStop(0.5, '#22c55e'); // Green
    gradient.addColorStop(0.7, '#eab308'); // Yellow
    gradient.addColorStop(1.0, '#f43f5e'); // Coral Alert
    
    gCtx.fillStyle = gradient;
    gCtx.fillRect(0, 0, 1, 256);
    const gradientData = gCtx.getImageData(0, 0, 1, 256).data;

    for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha > 0) {
            const gradientIndex = alpha * 4;
            data[i] = gradientData[gradientIndex];
            data[i + 1] = gradientData[gradientIndex + 1];
            data[i + 2] = gradientData[gradientIndex + 2];
            data[i + 3] = alpha < 40 ? 0 : Math.min(255, alpha * 1.6);
        }
    }
    ctx.putImageData(imageData, 0, 0);
  }, [heatmapData, selectedPage]);

  const [iframeBlocked, setIframeBlocked] = useState(false);

  useEffect(() => {
    setIframeBlocked(false);
  }, [selectedPage]);

  if (!selectedSite) {
    return (
      <div className="flex items-center justify-center h-96 helm-bg">
        <div className="premium-card text-center max-w-md">
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-border/50">
            <Activity className="w-8 h-8 text-orange-500/50" />
          </div>
          <h2 className="text-xl font-heading font-extrabold text-foreground mb-2">No site selected</h2>
          <p className="text-muted-foreground text-sm">Select a website from the sidebar to visualize user interaction density.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/50">
        <div>
          <div className="flex items-center space-x-2 text-orange-500 font-bold text-xs uppercase tracking-widest mb-2">
            <Activity className="w-4 h-4" />
            <span>Visual Intelligence</span>
          </div>
          <h1 className="text-4xl font-heading font-extrabold text-foreground tracking-tight">
            Click Heatmaps
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Density visualization of cursor interactions and user focus.</p>
        </div>
        
        <div className="w-full md:w-auto">
             <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2.5 ml-1">Observing Page</label>
             <select 
                value={selectedPage} 
                onChange={(e) => setSelectedPage(e.target.value)}
                className="w-full md:w-80 bg-white dark:bg-card border border-border/60 rounded-xl py-3 px-4 text-foreground font-semibold text-sm focus:ring-2 focus:ring-accent transition-all shadow-sm"
            >
                {pages.map(p => (
                    <option key={p.url} value={p.url}>{p.url} • {p.count} interactions</option>
                ))}
                {pages.length === 0 && <option value="">Awaiting interaction data...</option>}
            </select>
        </div>
      </div>

      <div className="premium-card !p-6 relative min-h-[700px] flex items-center justify-center bg-secondary/10">
         {loading ? (
             <div className="flex flex-col items-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-6"></div>
                 <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Compiling coordinates...</p>
             </div>
         ) : heatmapData.length > 0 ? (
             <div 
                className="relative w-full bg-white dark:bg-black/40 rounded-2xl shadow-2xl overflow-auto border border-border/40 transition-all custom-scrollbar"
                style={{ 
                    maxWidth: '1280px', 
                    height: '850px',
                    margin: '0 auto' 
                }}
             >
                <div className="sticky top-6 left-6 inline-flex items-center gap-2 text-[10px] font-bold text-white z-20 bg-primary/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg pointer-events-none uppercase tracking-widest">
                    <Activity className="w-3.5 h-3.5" />
                    {heatmapData.length} Points Captured
                </div>
                
                {/* Iframe Background */}
                <div 
                    className="absolute top-0 left-0 w-full z-0"
                    style={{ minHeight: `${Math.max(2000, Math.max(...heatmapData.map(p => p.y)) + 500)}px` }}
                >
                    {iframeBlocked ? (
                        <div className="flex flex-col items-center justify-center pt-40 h-full bg-secondary/20 text-muted-foreground">
                            <Activity className="w-12 h-12 mb-4 opacity-10" />
                            <p className="text-sm font-bold opacity-50 uppercase tracking-widest">Context Unavailable</p>
                            <p className="text-xs mt-1">Direct preview blocked by origin policy</p>
                        </div>
                    ) : (
                        <iframe 
                            src={selectedPage} 
                            className="w-full opacity-40 grayscale-[0.5] pointer-events-none mix-blend-multiply dark:mix-blend-normal"
                            style={{ 
                                height: `${Math.max(2000, Math.max(...heatmapData.map(p => p.y)) + 500)}px`,
                                border: 'none'
                            }}
                            onLoad={(e) => {
                                try {
                                    const iframe = e.target;
                                    const height = iframe.contentWindow?.document?.body?.scrollHeight;
                                    if (height && height > 0) {
                                        iframe.style.height = `${height}px`;
                                    }
                                } catch (err) {}
                            }}
                            onError={() => setIframeBlocked(true)}
                            title="Heatmap Context"
                            sandbox="allow-same-origin allow-scripts"
                        />
                    )}
                    
                    {/* Helper overlay for blocked iframes */}
                    <div className="absolute top-6 right-6 z-30 opacity-80 hover:opacity-100 transition-all">
                        <a 
                            href={selectedPage} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-primary text-[10px] font-bold text-primary-foreground px-4 py-2 rounded-full shadow-xl transition-all active:scale-95 uppercase tracking-widest"
                        >
                            Open Surface <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>

                <canvas 
                    ref={canvasRef} 
                    width={1280} 
                    height={Math.max(2000, Math.max(...heatmapData.map(p => p.y)) + 500)}
                    className="absolute top-0 left-0 z-10 pointer-events-none"
                />
             </div>
         ) : (
             <div className="text-center p-20">
                 <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-8 opacity-30">
                    <MousePointer2 className="w-10 h-10 text-muted-foreground" />
                 </div>
                 <h3 className="text-lg font-heading font-extrabold text-foreground mb-2">Zero Points Detected</h3>
                 <p className="text-muted-foreground text-sm max-w-xs mx-auto">No interaction snapshots exist for this URL. Data will populate as users navigate the surface.</p>
             </div>
         )}
      </div>
    </div>
  );
};

export default HeatmapPage;