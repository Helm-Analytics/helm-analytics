import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api';
import { Activity, MousePointer2 } from 'lucide-react';
import h337 from 'heatmap.js'; // You'll need to install this: npm install heatmap.js

const HeatmapPage = () => {
  const { selectedSite } = useOutletContext();
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState('');
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const heatmapInstance = useRef(null);

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
    // Initialize or update heatmap
    if (containerRef.current && heatmapData.length > 0) {
      // Clear previous instance if exists
      if (containerRef.current.innerHTML !== "") {
        containerRef.current.innerHTML = "";
      }

      heatmapInstance.current = h337.create({
        container: containerRef.current,
        radius: 25,
        maxOpacity: 0.6,
        minOpacity: 0,
        blur: 0.85,
      });

      const maxVal = Math.max(...heatmapData.map(p => p.value), 1);
      
      heatmapInstance.current.setData({
        max: maxVal,
        min: 0,
        data: heatmapData.map(p => ({
            x: p.x,
            y: p.y,
            value: p.value
        }))
      });
    }
  }, [heatmapData]);

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
                ref={containerRef} 
                className="relative w-full h-[800px] bg-slate-800 rounded-lg shadow-inner overflow-auto"
                style={{ 
                    // Simulate a standard desktop viewport width if we don't have the real page
                    maxWidth: '1280px', 
                    margin: '0 auto' 
                }}
             >
                {/* 
                   In a real app, you'd try to load the page in an iframe or display a screenshot here.
                   For now, we just show the heatmap on a dark canvas.
                */}
                <div className="absolute top-4 left-4 text-xs text-slate-500 pointer-events-none">
                    Displaying {heatmapData.length} click points
                </div>
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
