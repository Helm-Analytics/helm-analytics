import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api';
import { GitMerge, Plus, Trash2, ArrowRight } from 'lucide-react';

const FunnelsPage = () => {
    const { selectedSite } = useOutletContext();
    const [funnels, setFunnels] = useState([]);
    const [newFunnelName, setNewFunnelName] = useState('');
    const [newFunnelSteps, setNewFunnelSteps] = useState(['', '']); // Start with 2 steps minimum

    useEffect(() => {
        const fetchFunnels = async () => {
            if (selectedSite) {
                try {
                    const funnelsData = await api.listFunnels(selectedSite.id);
                    setFunnels(funnelsData || []);
                } catch (error) {
                    console.error("Failed to fetch funnels:", error);
                    setFunnels([]);
                }
            }
        };
        fetchFunnels();
    }, [selectedSite]);

    const handleAddStep = () => {
        setNewFunnelSteps([...newFunnelSteps, '']);
    };

    const handleStepChange = (index, value) => {
        const updatedSteps = [...newFunnelSteps];
        updatedSteps[index] = value;
        setNewFunnelSteps(updatedSteps);
    };

    const handleRemoveStep = (index) => {
        if (newFunnelSteps.length <= 2) return; // Maintain minimum steps
        const updatedSteps = [...newFunnelSteps];
        updatedSteps.splice(index, 1);
        setNewFunnelSteps(updatedSteps);
    };

    const handleCreateFunnel = async (e) => {
        e.preventDefault();
        if (!selectedSite || !newFunnelName.trim() || newFunnelSteps.some(step => !step.trim())) {
            alert("Please fill in all fields.");
            return;
        }
        try {
            await api.createFunnel({
                siteId: selectedSite.id,
                name: newFunnelName,
                steps: newFunnelSteps,
            });
            setNewFunnelName('');
            setNewFunnelSteps(['', '']);
            // Refetch funnels
            const funnelsData = await api.listFunnels(selectedSite.id);
            setFunnels(funnelsData || []);
        } catch (error) {
            console.error("Failed to create funnel:", error);
        }
    };

    const handleDeleteFunnel = async (funnelId) => {
        if (window.confirm("Are you sure you want to delete this funnel?")) {
            try {
                await api.deleteFunnel(funnelId);
                // Refetch funnels
                const funnelsData = await api.listFunnels(selectedSite.id);
                setFunnels(funnelsData || []);
            } catch (error) {
                console.error("Failed to delete funnel:", error);
            }
        }
    };

    if (!selectedSite) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400">
                Select a site to manage funnels.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                 <div>
                    <h1 className="text-3xl font-bold text-slate-200 flex items-center gap-3">
                        <GitMerge className="w-8 h-8 text-indigo-500" />
                        Conversion Funnels
                    </h1>
                    <p className="text-slate-400 mt-1">Track user journeys and identify drop-off points.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Funnel Form */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg sticky top-6">
                        <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-indigo-400" />
                            New Funnel
                        </h2>
                        <form onSubmit={handleCreateFunnel} className="space-y-4">
                            <div>
                                <label htmlFor="funnel-name" className="block text-sm font-medium text-slate-400 mb-1">Funnel Name</label>
                                <input
                                    type="text"
                                    id="funnel-name"
                                    value={newFunnelName}
                                    onChange={(e) => setNewFunnelName(e.target.value)}
                                    placeholder="e.g. Signup Flow"
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Steps (URL Paths)</label>
                                <div className="space-y-2">
                                    {newFunnelSteps.map((step, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500 font-mono w-4">{index + 1}.</span>
                                            <input
                                                type="text"
                                                value={step}
                                                onChange={(e) => handleStepChange(index, e.target.value)}
                                                placeholder={index === 0 ? "/landing" : "/checkout"}
                                                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            {newFunnelSteps.length > 2 && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemoveStep(index)} 
                                                    className="text-slate-500 hover:text-red-400"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    type="button" 
                                    onClick={handleAddStep} 
                                    className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                                >
                                    <Plus className="w-3 h-3" /> Add Step
                                </button>
                            </div>
                            
                            <button 
                                type="submit" 
                                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors shadow-md"
                            >
                                Create Funnel
                            </button>
                        </form>
                    </div>
                </div>

                {/* Existing Funnels List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-slate-200 mb-4">Your Funnels</h2>
                    {funnels.length > 0 ? (
                        funnels.map(funnel => (
                            <div key={funnel.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg hover:border-indigo-500/50 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{funnel.name}</h3>
                                        <p className="text-sm text-slate-400">ID: {funnel.id}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteFunnel(funnel.id)} 
                                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-md transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                <div className="relative py-4">
                                    {/* Connection Line */}
                                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-700 -z-10 transform -translate-y-1/2 hidden md:block"></div>
                                    
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                                        {funnel.steps.map((step, index) => (
                                            <React.Fragment key={index}>
                                                <div className="flex flex-col items-center bg-slate-800 z-10 px-2">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-900/50 border border-indigo-500 text-indigo-300 flex items-center justify-center text-xs font-bold mb-2">
                                                        {index + 1}
                                                    </div>
                                                    <span className="text-sm text-slate-300 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-700">
                                                        {step}
                                                    </span>
                                                </div>
                                                {index < funnel.steps.length - 1 && (
                                                    <ArrowRight className="w-4 h-4 text-slate-600 md:hidden" />
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-slate-800/50 border border-slate-700 border-dashed rounded-xl p-12 text-center text-slate-500">
                            <GitMerge className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No funnels created yet. Start by creating one on the left.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FunnelsPage;