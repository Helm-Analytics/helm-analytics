import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Activity, Copy, Check, TrendingUp, Code, Sparkles, Filter } from 'lucide-react';
import { api } from '../api';

export default function CustomEventsPage() {
  const { selectedSite } = useOutletContext();
  const [events, setEvents] = useState([]);
  const [showCode, setShowCode] = useState(true);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    if (selectedSite?.id) {
      fetchEvents();
    }
  }, [selectedSite, filter, timeRange]);

  const fetchEvents = async () => {
    try {
      const response = await api.getCustomEvents(selectedSite.id, {
        timeRange,
        eventName: filter === 'all' ? null : filter,
      });
      setEvents(response?.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const [selectedExample, setSelectedExample] = useState('basic');

  const copyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeExamples = {
    basic: `// Track a custom event
helm.trackEvent('button_clicked', {
  location: 'header',
  text: 'Get Started'
});`,
    react: `// In React component
const handleSignup = () => {
  helm.trackEvent('signup_started', {
    plan: 'pro'
  });
};`,
    advanced: `// E-commerce tracking
helm.trackEvent('purchase', {
  amount: 99.99,
  product_id: '12345',
  category: 'subscription'
});`,
  };

  const uniqueEvents = [...new Set(events.map(e => e.event_name))];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Custom <span className="text-accent">Events</span>
              </h1>
              <p className="text-muted-foreground">Track user actions beyond pageviews</p>
            </div>
            <button
              onClick={() => setShowCode(!showCode)}
              className="px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-all flex items-center gap-2"
            >
              <Code className="w-4 h-4" />
              {showCode ? 'Hide Code' : 'Show Code'}
            </button>
          </div>
        </div>

        {/* Implementation Guide */}
        {showCode && (
          <div className="mb-8 bg-card rounded-lg border border-border p-8">
            <h2 className="text-2xl font-bold mb-6">Implementation Guide</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => setSelectedExample('basic')}
                className={`p-4 rounded-lg border transition-all text-left ${
                  selectedExample === 'basic'
                    ? 'border-accent bg-accent/10'
                    : 'border-border hover:border-accent/50'
                }`}
              >
                <h3 className="font-bold mb-2 text-accent">Basic</h3>
                <p className="text-sm text-muted-foreground">Simple event tracking</p>
              </button>
              <button
                onClick={() => setSelectedExample('react')}
                className={`p-4 rounded-lg border transition-all text-left ${
                  selectedExample === 'react'
                    ? 'border-accent bg-accent/10'
                    : 'border-border hover:border-accent/50'
                }`}
              >
                <h3 className="font-bold mb-2 text-accent">React</h3>
                <p className="text-sm text-muted-foreground">In React components</p>
              </button>
              <button
                onClick={() => setSelectedExample('advanced')}
                className={`p-4 rounded-lg border transition-all text-left ${
                  selectedExample === 'advanced'
                    ? 'border-accent bg-accent/10'
                    : 'border-border hover:border-accent/50'
                }`}
              >
                <h3 className="font-bold mb-2 text-accent">Advanced</h3>
                <p className="text-sm text-muted-foreground">Complex event data</p>
              </button>
            </div>

            <div className="relative">
              <pre className="bg-secondary text-foreground p-6 rounded-lg overflow-x-auto text-sm font-mono border border-border">
                {codeExamples[selectedExample]}
              </pre>
              <button
                onClick={() => copyCode(codeExamples[selectedExample])}
                className="absolute top-4 right-4 p-2 bg-card hover:bg-secondary rounded-lg transition-colors border border-border"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
              </button>
            </div>

            <div className="mt-6 p-4 bg-secondary rounded-lg border border-border">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span>Auto-Tracked Events</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-card rounded-full text-sm font-medium border border-border">
                  outbound_click
                </span>
                <span className="px-3 py-1 bg-card rounded-full text-sm font-medium border border-border">
                  file_download
                </span>
                <span className="px-3 py-1 bg-card rounded-full text-sm font-medium border border-border">
                  scroll_depth
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filter:</span>
          </div>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-accent text-accent-foreground'
                : 'bg-card text-foreground hover:bg-secondary border border-border'
            }`}
          >
            All Events
          </button>
          {uniqueEvents.slice(0, 5).map((eventName) => (
            <button
              key={eventName}
              onClick={() => setFilter(eventName)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === eventName
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-card text-foreground hover:bg-secondary border border-border'
              }`}
            >
              {eventName}
            </button>
          ))}
        </div>

        {/* Time Range */}
        <div className="flex gap-2 mb-8">
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-card text-foreground hover:bg-secondary border border-border'
              }`}
            >
              Last {range}
            </button>
          ))}
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="bg-card rounded-lg border border-border p-12 text-center">
              <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-bold mb-2">No events yet</h3>
              <p className="text-muted-foreground mb-6">Start tracking custom events to see them here</p>
              <button 
                onClick={() => setShowCode(true)}
                className="px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-all"
              >
                View Implementation Guide
              </button>
            </div>
          ) : (
            events.map((event, index) => (
              <div
                key={index}
                className="bg-card rounded-lg border border-border p-6 hover:border-accent/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <Activity className="w-4 h-4 text-accent" />
                      </div>
                      <h3 className="text-lg font-bold">{event.event_name}</h3>
                      <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                        {event.count} events
                      </span>
                    </div>
                    {event.properties && Object.keys(event.properties).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(event.properties).slice(0, 5).map(([key, value]) => (
                          <span
                            key={key}
                            className="px-3 py-1 bg-secondary rounded-full text-xs font-mono border border-border"
                          >
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
