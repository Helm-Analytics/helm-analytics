import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api';
import { GitMerge, Plus, Trash2, ArrowDown, ExternalLink, Settings } from 'lucide-react';

const FunnelsPage = () => {
    const { selectedSite } = useOutletContext();
    const [funnels, setFunnels] = useState([]);
    const [newFunnelName, setNewFunnelName] = useState('');
    const [newFunnelSteps, setNewFunnelSteps] = useState(['', '']);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (selectedSite) fetchFunnels();
    }, [selectedSite]);

    const fetchFunnels = async () => {
        try {
            const data = await api.listFunnels(selectedSite.id);
            setFunnels(data || []);
        } catch (error) {
            console.error("Failed to fetch funnels:", error);
        }
    };

    const handleCreateFunnel = async (e) => {
        e.preventDefault();
        if (!newFunnelName.trim() || newFunnelSteps.some(s => !s.trim())) return;
        
        try {
            await api.createFunnel({
                siteId: selectedSite.id,
                name: newFunnelName,
                steps: newFunnelSteps,
            });
            setNewFunnelName('');
            setNewFunnelSteps(['', '']);
            setIsCreating(false);
            fetchFunnels();
        } catch (error) {
            console.error("Failed to create funnel:", error);
        }
    };

    if (!selectedSite) return <div className="text-center p-12 text-slate-400">Select a site to manage funnels.</div>;

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-200 flex items-center gap-3">
                        <GitMerge className="w-8 h-8 text-indigo-500" />
                        Conversion Funnels
                    </h1>
                    <p className="text-slate-400 mt-1">Visualize where users drop off in your key flows.</p>
                </div>
                <button 
                    onClick={() => setIsCreating(!isCreating)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg font-medium"
                >
                    <Plus className="w-5 h-5" />
                    {isCreating ? 'Cancel' : 'New Funnel'}
                </button>
            </div>

            {/* Creation Form */}
            {isCreating && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl animate-in slide-in-from-top-4 duration-300">
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">Define a New Funnel</h3>
                    <form onSubmit={handleCreateFunnel} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Funnel Name</label>
                            <input
                                type="text"
                                value={newFunnelName}
                                onChange={(e) => setNewFunnelName(e.target.value)}
                                placeholder="e.g. Checkout Process"
                                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-slate-400">Funnel Steps (URL Paths)</label>
                            {newFunnelSteps.map((step, idx) => (
                                <div key={idx} className="flex items-center gap-3 group">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 font-bold text-sm border border-slate-600">
                                        {idx + 1}
                                    </div>
                                    <input
                                        type="text"
                                        value={step}
                                        onChange={(e) => {
                                            const newSteps = [...newFunnelSteps];
                                            newSteps[idx] = e.target.value;
                                            setNewFunnelSteps(newSteps);
                                        }}
                                        placeholder={idx === 0 ? "/pricing" : "/signup"}
                                        className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                    {newFunnelSteps.length > 2 && (
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                const newSteps = [...newFunnelSteps];
                                                newSteps.splice(idx, 1);
                                                setNewFunnelSteps(newSteps);
                                            }}
                                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button 
                                type="button" 
                                onClick={() => setNewFunnelSteps([...newFunnelSteps, ''])}
                                className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 ml-11"
                            >
                                <Plus className="w-4 h-4" /> Add Step
                            </button>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-700 flex justify-end">
                            <button 
                                type="submit" 
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-md"
                            >
                                Create Funnel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Funnels List */}
            <div className="grid grid-cols-1 gap-6">
                {funnels.length > 0 ? (
                    funnels.map(funnel => (
                        <div key={funnel.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg hover:border-indigo-500/30 transition-all">
                            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                                        <GitMerge className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-200">{funnel.name}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={async () => {
                                            if (confirm("Delete this funnel?")) {
                                                await api.deleteFunnel(funnel.id);
                                                fetchFunnels();
                                            }
                                        }}
                                        className="text-slate-500 hover:text-red-400 p-2 hover:bg-slate-700 rounded transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
                                    {/* Desktop Connector Line */}
                                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500/50 via-slate-700 to-slate-700 -z-0"></div>

                                    {funnel.steps.map((step, idx) => (
                                        <div key={idx} className="relative z-10 flex flex-col items-center w-full md:w-auto group">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-indigo-500 flex items-center justify-center text-indigo-400 font-bold shadow-xl mb-3 group-hover:scale-110 transition-transform bg-slate-900">
                                                {idx + 1}
                                            </div>
                                            <div className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-300 font-mono shadow-sm flex items-center gap-2 max-w-[150px] truncate">
                                                <ExternalLink className="w-3 h-3 text-slate-500" />
                                                {step}
                                            </div>
                                            
                                            {/* Mobile Arrow */}
                                            {idx < funnel.steps.length - 1 && (
                                                <ArrowDown className="md:hidden w-5 h-5 text-slate-600 my-2" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="mt-8 bg-slate-900/50 rounded-lg p-4 text-center border border-slate-700/50">
                                    <p className="text-slate-500 text-sm">
                                        Conversion data will appear here once visitors navigate through these exact steps.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-xl">
                        <GitMerge className="w-16 h-16 mx-auto mb-4 text-slate-600 opacity-50" />
                        <h3 className="text-xl font-medium text-slate-300">No Funnels Yet</h3>
                        <p className="text-slate-500 mt-2 mb-6">Create your first conversion funnel to track user journeys.</p>
                        <button 
                            onClick={() => setIsCreating(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                            Create Funnel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FunnelsPage;
