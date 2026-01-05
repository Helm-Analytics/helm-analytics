import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const { selectedSite } = useOutletContext();
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const fetchFlowData = async () => {
    if (!selectedSite?.id) return;
    setLoading(true);
    try {
      const data = await api.getUserFlow(selectedSite.id, days);
      const { nodes: rawNodes, edges: rawEdges } = data;

      // Simple Auto-Layout Logic
      // Distribute nodes horizontally based on their index
      const processedNodes = (rawNodes || []).map((node, index) => ({
        id: node.id,
        data: { label: node.label.replace(window.location.origin, '') || '/' },
        position: { x: (index % 4) * 250, y: Math.floor(index / 4) * 150 },
        style: { 
          background: '#1e293b', 
          color: '#f8fafc', 
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '10px',
          fontSize: '12px',
          fontWeight: 'bold',
          width: 200,
          textAlign: 'center'
        },
      }));

      const maxWeight = Math.max(...(rawEdges || [1]).map(e => e.weight));
      
      const processedEdges = (rawEdges || []).map((edge, index) => ({
        id: `e-${index}`,
        source: edge.source,
        target: edge.target,
        label: `${edge.weight}`,
        animated: edge.weight > (maxWeight * 0.5), // Animate high traffic paths
        style: { 
          strokeWidth: Math.max(1, (edge.weight / maxWeight) * 8), 
          stroke: '#38bdf8',
          opacity: 0.6
        },
        labelStyle: { fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' },
        labelBgStyle: { fill: '#0f172a', fillOpacity: 0.8 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#38bdf8',
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
  };

  useEffect(() => {
    fetchFlowData();
  }, [selectedSite?.id, days]);

  if (!selectedSite) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <GitMerge size={48} className="mb-4 opacity-20" />
        <p>Please select a site to view user journeys</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <GitMerge className="text-sky-400" size={24} />
            User Flow Visualization
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Map user journeys and identify high-traffic transitions
          </p>
        </div>

        <div className="flex items-center gap-2">
            <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
                {[1, 7, 30].map((d) => (
                <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    days === d 
                        ? 'bg-sky-500 text-white shadow-lg' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                    }`}
                >
                    {d}d
                </button>
                ))}
            </div>
          <button 
            onClick={fetchFlowData}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden relative">
        {loading && (
            <div className="absolute inset-0 z-10 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="text-sky-400 animate-spin" size={32} />
                    <span className="text-slate-300 font-medium">Analyzing paths...</span>
                </div>
            </div>
        )}

        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <div className="bg-slate-800/90 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Info size={10} /> Legend
                </h4>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-sky-500 rounded-sm"></div>
                        <span className="text-[10px] text-slate-300 font-medium">Page Node</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-0.5 bg-sky-400 opacity-60"></div>
                        <span className="text-[10px] text-slate-300 font-medium">Path (Thickness = Volume)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-0.5 bg-sky-400 animate-pulse"></div>
                        <span className="text-[10px] text-slate-300 font-medium">Primary Flow (Animated)</span>
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
          className="dark"
        >
          <Background color="#1e293b" gap={20} />
          <Controls className="fill-slate-100 bg-slate-800 border-slate-700" />
          <MiniMap 
            style={{ background: '#0f172a', border: '1px solid #1e293b' }} 
            nodeColor="#38bdf8"
            maskColor="rgba(15, 23, 42, 0.6)"
          />
        </ReactFlow>
      </div>

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex items-center gap-3">
        <Layers className="text-sky-400" size={18} />
        <p className="text-xs text-slate-400 leading-relaxed">
            This diagram shows the most common paths users take from page to page. 
            <strong> Animated lines</strong> indicate high-traffic flows, while the <strong>thickness</strong> indicates the relative volume of users moving between those pages.
        </p>
      </div>
    </div>
  );
};

export default UserFlowPage;
