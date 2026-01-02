import React, { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api';
import { PlayCircle, Film, AlertCircle } from 'lucide-react';
import { unpack } from 'rrweb';

const SessionReplay = () => {
    const { selectedSite } = useOutletContext();
    const playerRef = useRef(null);
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [events, setEvents] = useState([]);
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
        const fetchEvents = async () => {
            if (!selectedSite || !selectedSession) return;
            
            setLoadingEvents(true);
            setError(null);
            setEvents([]); 

            try {
                const fetchedEvents = await api.getSessionEvents(selectedSite.id, selectedSession);
                let eventList = Array.isArray(fetchedEvents) ? fetchedEvents : [];
                eventList.sort((a, b) => a.timestamp - b.timestamp);
                setEvents(eventList);
            } catch (error) {
                console.error("Failed to fetch session events:", error);
                setError(`Fetch Error: ${error.message || "Unknown error"}`);
            } finally {
                setLoadingEvents(false);
            }
        };

        fetchEvents();
    }, [selectedSite, selectedSession]);

    useEffect(() => {
        if (!playerLoaded || !window.rrwebPlayer || events.length < 2 || !playerRef.current) return;
        playerRef.current.innerHTML = '';

        try {
            const validEvents = events.filter(e => e && typeof e === 'object' && e.type !== undefined);
            if (validEvents.length < 2) {
                setError(`Insufficient state snapshots found (${validEvents.length}). Replay aborted.`);
                return;
            }

            const playerInstance = new window.rrwebPlayer({
                target: playerRef.current,
                props: {
                    events: validEvents,
                    width: playerRef.current.clientWidth || 800,
                    height: 550,
                    autoPlay: false,
                    showController: true,
                    UNSAFE_replayCanvas: true,
                },
            });

            return () => {
                try {
                    if (playerInstance && typeof playerInstance.pause === 'function') {
                        playerInstance.pause();
                    }
                } catch (err) {}
            };
        } catch (playerError) {
            console.error("rrwebPlayer instantiation failed:", playerError);
            setError(`Playback initialization failed. Data format mismatch.`);
        }
    }, [events, playerLoaded]);

    if (!selectedSite) {
      return (
        <div className="flex items-center justify-center h-96 helm-bg">
          <div className="premium-card text-center max-w-md">
            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-border/50">
              <PlayCircle className="w-8 h-8 text-accent/50" />
            </div>
            <h2 className="text-xl font-heading font-extrabold text-foreground mb-2">No site selected</h2>
            <p className="text-muted-foreground text-sm">Select a website from the sidebar to observe live session replays.</p>
          </div>
        </div>
      );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/50">
                <div>
                   <div className="flex items-center space-x-2 text-accent font-bold text-xs uppercase tracking-widest mb-2">
                        <PlayCircle className="w-4 h-4" />
                        <span>Behavioral Intelligence</span>
                    </div>
                    <h1 className="text-4xl font-heading font-extrabold text-foreground tracking-tight">
                        Session Observation
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">High-fidelity playback of user interactions and journeys.</p>
                </div>
                
                <div className="w-full md:w-80">
                    <label htmlFor="session-select" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2.5 ml-1">
                        Active Logs
                    </label>
                    <div className="relative">
                        <select
                            id="session-select"
                            className="block w-full pl-4 pr-10 py-3 text-sm border border-border/60 focus:outline-none focus:ring-2 focus:ring-accent rounded-xl bg-white dark:bg-card text-foreground font-semibold shadow-sm transition-all"
                            value={selectedSession || ''}
                            onChange={(e) => setSelectedSession(e.target.value)}
                            disabled={sessions.length === 0}
                        >
                            {sessions.length > 0 ? (
                                sessions.map(sessionID => (
                                    <option key={sessionID} value={sessionID}>
                                        TS-{sessionID.substring(0, 8).toUpperCase()} (Current Trace)
                                    </option>
                                ))
                            ) : (
                                <option>Awaiting session ingest...</option>
                            )}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-accent">
                            <Film className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="premium-card !p-8 min-h-[650px] flex flex-col bg-secondary/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/0 via-accent/40 to-accent/0"></div>
                
                {loadingEvents ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-6"></div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Reconstructing DOM state...</p>
                    </div>
                ) : error ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/20 rounded-full flex items-center justify-center mb-6 border border-rose-100 dark:border-rose-900">
                          <AlertCircle className="w-8 h-8 text-rose-500" />
                        </div>
                        <h4 className="text-lg font-heading font-extrabold text-foreground mb-2">Replay Failure</h4>
                        <p className="text-muted-foreground text-sm max-w-xs">{error}</p>
                    </div>
                ) : selectedSession ? (
                    <div className="flex-1 bg-white dark:bg-black/40 rounded-2xl overflow-hidden border border-border/60 shadow-inner p-1">
                        <div ref={playerRef} className="w-full h-full rounded-xl overflow-hidden min-h-[550px]"></div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                        <Film className="w-20 h-20 mb-6 text-muted-foreground" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Command: Select session for observation</p>
                    </div>
                )}
            </div>
            
            {/* Quick tips */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="premium-card !p-5 bg-secondary/30 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                     <PlayCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider">Dynamic Reconstruct</h5>
                    <p className="text-[10px] text-muted-foreground">Full DOM state rebuild per frame.</p>
                  </div>
               </div>
               <div className="premium-card !p-5 bg-secondary/30 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                     <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider">Privacy Safe</h5>
                    <p className="text-[10px] text-muted-foreground">Sensitive inputs are masked at ingest.</p>
                  </div>
               </div>
               <div className="premium-card !p-5 bg-secondary/30 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                     <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider">Network Agnostic</h5>
                    <p className="text-[10px] text-muted-foreground">Asynchronous event capture engine.</p>
                  </div>
               </div>
            </div>
        </div>
    );
};

export default SessionReplay;