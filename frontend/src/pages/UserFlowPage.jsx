import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { api } from '../api';
import { GitMerge, RefreshCw, Layers, Info } from 'lucide-react';

const UserFlowPage = () => {
  const { selectedSite, darkMode } = useOutletContext();
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const fetchFlowData = useCallback(async () => {
    if (!selectedSite?.id) return;
    setLoading(true);
    try {
      const data = await api.getUserFlow(selectedSite.id, days);
      
      if (!data || !data.nodes || data.nodes.length === 0) {
        setNodes([]);
        setEdges([]);
        setLoading(false);
        return;
      }

      const { nodes: rawNodes, edges: rawEdges } = data;

      // Improved Layout Logic: Layered approach
      const processedNodes = (rawNodes || []).map((node, index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        return {
          id: node.id,
          data: { label: node.label.replace(window.location.origin, '') || '/' },
          position: { x: col * 300, y: row * 200 },
          style: { 
            background: darkMode ? '#1e293b' : '#ffffff', 
            color: darkMode ? '#f8fafc' : '#1e293b', 
            border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            borderRadius: '12px',
            padding: '12px',
            fontSize: '13px',
            fontWeight: '600',
            width: 220,
            textAlign: 'center',
            boxShadow: darkMode ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease'
          },
        };
      });

      const maxWeight = Math.max(...(rawEdges || [1]).map(e => e.weight));
      
      const processedEdges = (rawEdges || []).map((edge, index) => ({
        id: `e-${index}`,
        source: edge.source,
        target: edge.target,
        label: `${edge.weight}`,
        animated: edge.weight > (maxWeight * 0.3), // Lower threshold for animation
        style: { 
          strokeWidth: Math.max(1.5, (edge.weight / maxWeight) * 10), 
          stroke: darkMode ? '#38bdf8' : '#0ea5e9',
          opacity: 0.8
        },
        labelStyle: { 
          fill: darkMode ? '#94a3b8' : '#64748b', 
          fontSize: 11, 
          fontWeight: 'bold' 
        },
        labelBgStyle: { 
          fill: darkMode ? '#0f172a' : '#f8fafc', 
          fillOpacity: 0.9 
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: darkMode ? '#38bdf8' : '#0ea5e9',
        },
      }));

      setNodes(processedNodes);
      setEdges(processedEdges);
      setError(null);
    } catch (err) {
      console.error('Error fetching flow data:', err);
      setError('Failed to load user flow data');
    } finally {
      setLoading(false);
    }
  }, [selectedSite?.id, days, darkMode, setNodes, setEdges]);

  useEffect(() => {
    fetchFlowData();
  }, [fetchFlowData]);

  if (!selectedSite) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground relative">
        <GitMerge size={64} className="mb-6 opacity-10 animate-pulse" />
        <p className="text-lg font-medium">Please select a site to view user journeys</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-90px)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2 group">
            <div className="p-2 bg-sky-500/10 rounded-lg group-hover:bg-sky-500/20 transition-colors">
              <GitMerge className="text-sky-500" size={24} />
            </div>
            User Flow Visualization
          </h1>
          <p className="text-muted-foreground text-sm mt-1 ml-11">
            Analyze the high-traffic paths users take through your application.
          </p>
        </div>

        <div className="flex items-center gap-3">
            <div className="flex bg-secondary p-1 rounded-xl border border-border/50">
                {[1, 7, 30].map((d) => (
                <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    days === d 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                >
                    {d}d
                </button>
                ))}
            </div>
          <button 
            onClick={fetchFlowData}
            disabled={loading}
            className="p-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl border border-border transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 bg-card border border-border rounded-2xl overflow-hidden relative shadow-inner">
        {loading && nodes.length === 0 && (
            <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <RefreshCw className="text-sky-500 animate-spin" size={40} />
                      <div className="absolute inset-0 blur-lg bg-sky-500/30 animate-pulse"></div>
                    </div>
                    <span className="text-foreground font-semibold tracking-wide">Mapping User Journeys...</span>
                </div>
            </div>
        )}

        {!loading && nodes.length === 0 && !error && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
                  <Layers className="text-muted-foreground/30" size={40} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No Journey Data Yet</h3>
                <p className="text-muted-foreground max-w-sm mb-8">
                  User flows are generated from session data. Once users start navigating your site, 
                  we'll visualize their paths here.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg text-left">
                  <div className="bg-secondary/50 p-4 rounded-xl border border-border/50">
                    <div className="text-sky-500 font-bold text-xs mb-1 uppercase">Step 1</div>
                    <p className="text-xs text-muted-foreground">Ensure the tracking script is installed on all pages you want to track.</p>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-xl border border-border/50">
                    <div className="text-sky-500 font-bold text-xs mb-1 uppercase">Step 2</div>
                    <p className="text-xs text-muted-foreground">Monitor the "Sessions" tab to verify real-time traffic is flowing in.</p>
                  </div>
                </div>
            </div>
        )}

        {/* Flow Controls & Info Overlay */}
          <div id="tut-user-flow-controls" className="absolute top-4 left-4 z-10 flex flex-col gap-3">
            <div id="tut-user-flow-legend" className="absolute bottom-4 left-4 z-10 bg-card/80 backdrop-blur-md border border-border p-4 rounded-2xl shadow-2xl max-w-xs transition-all hover:bg-card">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                    <Info size={12} className="text-sky-500" /> Visualization Key
                </h4>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-3.5 h-3.5 rounded-md ${darkMode ? 'bg-sky-500' : 'bg-sky-400'}`}></div>
                        <span className="text-xs text-foreground font-medium underline decoration-sky-500/30 decoration-2 underline-offset-4">Page Destination</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-1 bg-sky-500/60 rounded-full"></div>
                        <span className="text-xs text-muted-foreground font-medium">Path (Weight = Volume)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-1 bg-sky-500 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.5)]"></div>
                        <span className="text-xs text-muted-foreground font-medium">Primary Conversion Flow</span>
                    </div>
                </div>
            </div>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          className={darkMode ? 'dark' : ''}
        >
          <Background 
            color={darkMode ? '#334155' : '#cbd5e1'} 
            gap={24} 
            size={1}
            variant="dots"
          />
          <Controls 
            className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-lg overflow-hidden shadow-lg`} 
            showInteractive={false}
          />
          <MiniMap 
            style={{ 
              background: darkMode ? '#0f172a' : '#ffffff', 
              border: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}`,
              borderRadius: '12px',
              bottom: 20,
              right: 20
            }} 
            nodeColor={darkMode ? '#38bdf8' : '#0ea5e9'}
            maskColor={darkMode ? "rgba(15, 23, 42, 0.7)" : "rgba(255, 255, 255, 0.7)"}
          />
        </ReactFlow>
      </div>

      <div className="bg-secondary/40 border border-border/50 rounded-2xl p-4 flex items-start gap-4 transition-all hover:bg-secondary/60">
        <div className="p-2 bg-sky-500/10 rounded-lg shrink-0">
          <Layers className="text-sky-500" size={20} />
        </div>
        <div>
          <h5 className="text-sm font-bold text-foreground mb-1">Understanding User Flow</h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
              This interactive map aggregates thousands of user sessions into a single view. 
              <strong> Bold, animated lines</strong> represent the "happy path" or most frequent journeys. 
              Use this to identify where users drop off and which pages are the most critical hubs in your app's navigation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserFlowPage;
