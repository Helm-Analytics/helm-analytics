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
    if (canvasRef.current && heatmapData.length > 0) {
      drawHeatmap();
    }
  }, [heatmapData]);

  const drawHeatmap = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (heatmapData.length === 0) return;

    // 1. Draw the "shadow" (alpha) map
    // We draw radial gradients with low opacity for each point.
    // Overlapping points accumulate opacity.
    
    // Create a temporary canvas for the alpha map if needed, 
    // but we can just draw directly to the main canvas first 
    // using grayscale/alpha and then colorize.
    
    const radius = 25;
    const maxVal = Math.max(...heatmapData.map(p => p.value), 1);

    heatmapData.forEach(point => {
        // Calculate intensity based on value relative to max
        // However, standard heatmaps often just accumulate alpha 
        // regardless of individual point "value" if value implies "count".
        // If 'value' is just 1 (a click), we just draw.
        // Let's assume point.value is the weight.
        
        const weight = point.value / maxVal;
        
        ctx.beginPath();
        const alpha = Math.min(Math.max(weight, 0.1), 1); // Ensure some visibility
        ctx.globalAlpha = 0.1 + (0.5 * alpha); // Base alpha per point
        
        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
        gradient.addColorStop(0, 'rgba(0,0,0,1)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = gradient;
        ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
        ctx.fill();
    });

    // 2. Colorize
    // Get the pixel data (alpha map)
    // Note: We drew black with alpha. The alpha channel in ImageData 
    // will reflect the accumulation.
    
    // Wait, if we draw 'rgba(0,0,0,X)', the RGB channels are 0.
    // The Alpha channel is what we care about.
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data; // Uint8ClampedArray

    // Create a color gradient map (256 colors)
    const gradientCanvas = document.createElement('canvas');
    gradientCanvas.width = 1;
    gradientCanvas.height = 256;
    const gCtx = gradientCanvas.getContext('2d');
    const gradient = gCtx.createLinearGradient(0, 0, 0, 256);
    
    // Define heatmap colors: Blue (cool) -> Green -> Yellow -> Red (hot)
    gradient.addColorStop(0.4, 'blue');
    gradient.addColorStop(0.6, 'cyan');
    gradient.addColorStop(0.7, 'lime');
    gradient.addColorStop(0.8, 'yellow');
    gradient.addColorStop(1.0, 'red');
    
    gCtx.fillStyle = gradient;
    gCtx.fillRect(0, 0, 1, 256);
    
    const gradientData = gCtx.getImageData(0, 0, 1, 256).data;

    // Map alpha to color
    for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3]; // Alpha channel (0-255)
        
        if (alpha > 0) {
            // Map alpha to gradient index (0-255)
            // We use the alpha value as the index into our gradient map
            const gradientIndex = alpha * 4;
            
            data[i] = gradientData[gradientIndex];     // R
            data[i + 1] = gradientData[gradientIndex + 1]; // G
            data[i + 2] = gradientData[gradientIndex + 2]; // B
            // Alpha remains the same (or we can boost it for visibility)
            data[i + 3] = alpha < 50 ? 0 : alpha * 1.5; // Thresholding to remove noise and boost visibility
        }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  if (!selectedSite) return <div className="text-center p-8 text-slate-400">Select a site to view heatmaps.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-200 flex items-center gap-3">
            <Activity className="w-8 h-8 text-orange-500" />
            Click Heatmaps
          </h1>
          <p className="text-slate-400 mt-1">Visualize where users are clicking on your pages.</p>
        </div>
        
        <div className="w-full md:w-auto">
             <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Page</label>
             <select 
                value={selectedPage} 
                onChange={(e) => setSelectedPage(e.target.value)}
                className="w-full md:w-64 bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-slate-200 focus:ring-2 focus:ring-orange-500"
            >
                {pages.map(p => (
                    <option key={p.url} value={p.url}>{p.url} ({p.count} clicks)</option>
                ))}
                {pages.length === 0 && <option value="">No data available</option>}
            </select>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 overflow-hidden relative min-h-[600px] flex items-center justify-center">
         {loading ? (
             <div className="flex flex-col items-center">
                 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-2"></div>
                 <span className="text-slate-400">Loading click data...</span>
             </div>
         ) : heatmapData.length > 0 ? (
             <div 
                className="relative w-full bg-slate-800 rounded-lg shadow-inner overflow-auto"
                style={{ 
                    maxWidth: '1280px', 
                    height: '800px',
                    margin: '0 auto' 
                }}
             >
                <div className="absolute top-4 left-4 text-xs text-slate-500 pointer-events-none z-10">
                    Displaying {heatmapData.length} click points
                </div>
                <canvas 
                    ref={canvasRef} 
                    width={1280} 
                    height={800} 
                    className="block mx-auto"
                />
             </div>
         ) : (
             <div className="text-center text-slate-500">
                 <MousePointer2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                 <p>No clicks recorded for this page yet.</p>
             </div>
         )}
      </div>
    </div>
  );
};

export default HeatmapPage;