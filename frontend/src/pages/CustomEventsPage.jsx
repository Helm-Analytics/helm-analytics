import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Activity, Code2, TrendingUp, Users, BarChart3, Copy, Check } from 'lucide-react';
import { api } from '../api';

const CustomEventsPage = () => {
  const { selectedSite } = useOutletContext();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [properties, setProperties] = useState({});
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [showCodeSnippet, setShowCodeSnippet] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (selectedSite?.id) {
      fetchEvents();
    }
  }, [selectedSite?.id, days]);

  useEffect(() => {
    if (selectedEvent) {
      fetchEventProperties(selectedEvent.eventName);
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/events/stats?siteId=${selectedSite.id}&days=${days}`
      );
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventProperties = async (eventName) => {
    try {
      const response = await fetch(
        `/api/events/properties?siteId=${selectedSite.id}&eventName=${eventName}&days=${days}`
      );
      const data = await response.json();
      setProperties(data.properties || {});
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeSnippets = {
    basic: `// Track a custom event
helm.trackEvent('button_clicked', { 
  location: 'header', 
  text: 'Sign Up' 
});`,
    advanced: `// Track with detailed properties
helm.trackEvent('purchase_completed', {
  product_id: '123',
  amount: 99.99,
  currency: 'USD',
  category: 'subscription'
});`,
    react: `// In React component
const handleSignup = () => {
  helm.trackEvent('signup_started', {
    plan: 'pro',
    source: 'pricing_page'
  });
  // ... rest of signup logic
};`,
  };

  if (!selectedSite) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please select a site to view custom events</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Custom Events</h1>
          <p className="text-muted-foreground mt-1">
            Track user actions beyond pageviews
          </p>
        </div>
        <button
          onClick={() => setShowCodeSnippet(!showCodeSnippet)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
        >
          <Code2 className="w-4 h-4" />
          {showCodeSnippet ? 'Hide' : 'Show'} Code
        </button>
      </div>

      {/* Code Snippet Section */}
      {showCodeSnippet && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Code2 className="w-5 h-5 text-accent" />
            Implementation Guide
          </h3>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-2">1. Install Tracker Script</p>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{`<script src="https://api-sentinel.getmusterup.com/static/tracker-v5.js" 
        data-site-id="${selectedSite.id}">
</script>`}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(`<script src="https://api-sentinel.getmusterup.com/static/tracker-v5.js" data-site-id="${selectedSite.id}"></script>`)}
                  className="absolute top-2 right-2 p-2 bg-background rounded hover:bg-muted"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">2. Track Events</p>
              <div className="grid md:grid-cols-3 gap-3">
                {Object.entries(codeSnippets).map(([key, code]) => (
                  <div key={key} className="relative">
                    <p className="text-xs text-muted-foreground mb-1 capitalize">{key}</p>
                    <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
                      <code>{code}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">✨ Auto-Tracked Events</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• <code className="text-accent">outbound_click</code> - External link clicks</li>
                <li>• <code className="text-accent">file_download</code> - PDF, ZIP, DOCX downloads</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Date Filter */}
      <div className="flex gap-2">
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              days === d
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            Last {d} days
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">No Custom Events Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start tracking user actions by implementing custom events
          </p>
          <button
            onClick={() => setShowCodeSnippet(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            View Implementation Guide
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <button
              key={event.eventName}
              onClick={() => setSelectedEvent(event)}
              className={`bg-card border rounded-xl p-6 text-left hover:border-accent transition-all ${
                selectedEvent?.eventName === event.eventName ? 'border-accent ring-2 ring-accent/20' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Activity className="w-5 h-5 text-accent" />
                </div>
                <span className="text-xs text-muted-foreground">
                  {event.withProperties > 0 ? `${event.withProperties} with props` : 'No props'}
                </span>
              </div>
              
              <h3 className="font-bold text-lg mb-2 truncate" title={event.eventName}>
                {event.eventName}
              </h3>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
                    <BarChart3 className="w-3 h-3" />
                    Total
                  </div>
                  <p className="text-xl font-bold">{event.count.toLocaleString()}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
                    <Users className="w-3 h-3" />
                    Unique
                  </div>
                  <p className="text-xl font-bold">{event.uniqueUsers.toLocaleString()}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Property Breakdown */}
      {selectedEvent && Object.keys(properties).length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Property Breakdown: <code className="text-accent">{selectedEvent.eventName}</code>
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(properties).map(([key, values]) => (
              <div key={key} className="bg-secondary/50 rounded-lg p-4">
                <p className="font-medium mb-3 text-sm">{key}</p>
                <div className="space-y-2">
                  {Object.entries(values)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([value, count]) => (
                      <div key={value} className="flex items-center justify-between text-sm">
                        <span className="truncate flex-1" title={value}>{value}</span>
                        <span className="font-bold ml-2">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomEventsPage;
