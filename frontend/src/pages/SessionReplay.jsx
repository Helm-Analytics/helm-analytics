import React, { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api';
import { PlayCircle, Film, AlertCircle } from 'lucide-react';

const SessionReplay = () => {
    const { selectedSite } = useOutletContext();
    const playerRef = useRef(null);
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [playerLoaded, setPlayerLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSessions = async () => {
            if (selectedSite) {
                try {
                    const sessionIDs = await api.listSessions(selectedSite.id);
                    setSessions(sessionIDs || []);
                    setSelectedSession(sessionIDs && sessionIDs.length > 0 ? sessionIDs[0] : null);
                } catch (error) {
                    console.error("Failed to fetch sessions:", error);
                    setSessions([]);
                    setSelectedSession(null);
                }
            }
        };
        fetchSessions();
    }, [selectedSite]);

    useEffect(() => {
        // Load rrweb-player assets
        const loadRrwebPlayer = () => {
            if (document.querySelector('#rrweb-player-css')) {
                setPlayerLoaded(true);
                return;
            }

            const cssLink = document.createElement('link');
            cssLink.id = 'rrweb-player-css';
            cssLink.rel = 'stylesheet';
            cssLink.href = 'https://cdn.jsdelivr.net/npm/rrweb-player@latest/dist/style.css';
            document.head.appendChild(cssLink);

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/rrweb-player@latest/dist/index.js';
            script.async = true;
            document.body.appendChild(script);

            script.onload = () => {
                setPlayerLoaded(true);
            };
        };

        loadRrwebPlayer();
    }, []);

    useEffect(() => {
        const fetchAndPlaySession = async () => {
            // Cleanup previous player
            if (playerRef.current) {
                playerRef.current.innerHTML = ''; 
            }
            
            if (!selectedSite || !selectedSession) return;
            
            if (playerLoaded && window.rrwebPlayer) {
                setLoadingEvents(true);
                setError(null);
                try {
                    const fetchedEvents = await api.getSessionEvents(selectedSite.id, selectedSession);
                    
                    // Ensure events is an array
                    const events = Array.isArray(fetchedEvents) ? fetchedEvents : [];
                    
                    console.log("Session Replay: Fetched", events.length, "events");

                    if (events.length > 1) { 
                        if (!playerRef.current) {
                             console.warn("Session Replay: Player container ref is null. Retrying...");
                             return; // Skip this render cycle, effect will re-run if dependencies change
                        }

                        try {
                            new window.rrwebPlayer({
                                target: playerRef.current,
                                props: {
                                    events,
                                    width: playerRef.current.clientWidth || 800,
                                    height: 500,
                                    autoPlay: true,
                                    showController: true,
                                },
                            });
                        } catch (playerError) {
                            console.error("rrwebPlayer instantiation failed:", playerError);
                            setError(`Player Error: ${playerError.message}`);
                        }
                    } else {
                        setError(`Not enough events recorded (${events.length}) to replay this session.`);
                    }
                } catch (error) {
                    console.error("Failed to fetch session events:", error);
                    setError(`Fetch Error: ${error.message || "Unknown error"}`);
                } finally {
                    setLoadingEvents(false);
                }
            }
        };

        // Debounce slightly to allow layout to settle
        const timer = setTimeout(fetchAndPlaySession, 100);
        return () => clearTimeout(timer);
        
    }, [selectedSite, selectedSession, playerLoaded]);

    if (!selectedSite) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400">
                Select a site from the sidebar to view session replays.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-200 flex items-center gap-3">
                        <PlayCircle className="w-8 h-8 text-indigo-500" />
                        Session Replay
                    </h1>
                    <p className="text-slate-400 mt-1">Watch how users interact with your site.</p>
                </div>
                
                <div className="w-full md:w-64">
                    <label htmlFor="session-select" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Select Session
                    </label>
                    <div className="relative">
                        <select
                            id="session-select"
                            className="block w-full pl-3 pr-10 py-2 text-base border border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-slate-800 text-slate-200"
                            value={selectedSession || ''}
                            onChange={(e) => setSelectedSession(e.target.value)}
                            disabled={sessions.length === 0}
                        >
                            {sessions.length > 0 ? (
                                sessions.map(sessionID => (
                                    <option key={sessionID} value={sessionID}>
                                        {sessionID.substring(0, 8)}... ( {sessionID} )
                                    </option>
                                ))
                            ) : (
                                <option>No sessions found</option>
                            )}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                            <Film className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg min-h-[600px] flex flex-col">
                {loadingEvents ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
                        <p>Loading session data...</p>
                    </div>
                ) : error ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                        <p>{error}</p>
                    </div>
                ) : selectedSession ? (
                    <div className="flex-1 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 relative">
                        <div ref={playerRef} className="w-full h-full"></div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                        <Film className="w-16 h-16 mb-4 opacity-20" />
                        <p>Select a session to start watching</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SessionReplay;