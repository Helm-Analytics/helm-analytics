import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Copy, Check } from 'lucide-react';
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
    basic: `// Track a button click
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
          <h1 className="text-4xl font-bold mb-2">
            Custom <span className="text-accent">Events</span>
          </h1>
          <p className="text-muted-foreground">Track user actions and interactions beyond pageviews</p>
        </div>

        {/* Implementation Guide */}
        <div className="mb-8 bg-card rounded-lg border border-border p-8">
          <h2 className="text-2xl font-bold mb-6">Implementation Guide</h2>

          {/* Step-by-step explanation */}
          <div className="mb-8 space-y-6">
            <div className="border-l-4 border-accent pl-6">
              <h3 className="text-lg font-bold mb-2">Step 1: Install the Tracker Script</h3>
              <p className="text-muted-foreground mb-3">
                Add the Helm Analytics tracking script to your website's HTML. This script automatically creates a global <code className="px-2 py-1 bg-secondary rounded text-sm font-mono">helm</code> object that you can use anywhere in your code.
              </p>
              <div className="relative">
                <pre className="bg-secondary text-foreground p-4 rounded-lg overflow-x-auto text-sm font-mono border border-border">
{`<script defer data-site-id="${selectedSite?.id || 'YOUR_SITE_ID'}" 
        src="${window.location.origin}/static/tracker-v5.js"></script>`}
                </pre>
                <button
                  onClick={() => copyCode(`<script defer data-site-id="${selectedSite?.id || 'YOUR_SITE_ID'}" src="${window.location.origin}/static/tracker-v5.js"></script>`)}
                  className="absolute top-2 right-2 p-2 bg-card hover:bg-secondary rounded-lg transition-colors border border-border"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
            </div>

            <div className="border-l-4 border-accent pl-6">
              <h3 className="text-lg font-bold mb-2">Step 2: Understanding the <code className="px-2 py-1 bg-secondary rounded text-sm font-mono">helm</code> Object</h3>
              <p className="text-muted-foreground mb-3">
                Once the tracker script loads, it creates a global <code className="px-2 py-1 bg-secondary rounded text-sm font-mono">window.helm</code> object with a <code className="px-2 py-1 bg-secondary rounded text-sm font-mono">trackEvent</code> method. 
                This means you can call <code className="px-2 py-1 bg-secondary rounded text-sm font-mono">helm.trackEvent()</code> from anywhere in your JavaScript code—no imports needed.
              </p>
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">💡 How it Works:</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>The tracker script runs automatically when your page loads</li>
                  <li>It creates <code className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">window.helm = &#123; trackEvent: function() &#123;...&#125; &#125;</code></li>
                  <li>You can then call <code className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">helm.trackEvent('event_name', &#123; data &#125;)</code> anywhere</li>
                  <li>Events are sent to your analytics dashboard in real-time</li>
                </ul>
              </div>
            </div>

            <div className="border-l-4 border-accent pl-6">
              <h3 className="text-lg font-bold mb-2">Step 3: Track Custom Events</h3>
              <p className="text-muted-foreground mb-3">
                Use <code className="px-2 py-1 bg-secondary rounded text-sm font-mono">helm.trackEvent(eventName, properties)</code> to track any user action.
              </p>

              {/* Example tabs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <button
                  onClick={() => setSelectedExample('basic')}
                  className={`p-4 rounded-lg border transition-all text-left ${
                    selectedExample === 'basic'
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <h4 className="font-bold mb-1">Basic</h4>
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
                  <h4 className="font-bold mb-1">React</h4>
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
                  <h4 className="font-bold mb-1">Advanced</h4>
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
            </div>

            <div className="border-l-4 border-accent/50 pl-6">
              <h3 className="text-lg font-bold mb-2">Auto-Tracked Events</h3>
              <p className="text-muted-foreground mb-3">
                These events are automatically tracked without any code—the tracker script handles them for you:
              </p>
              <div className="bg-secondary/50 rounded-lg p-4 border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-bold">Event Name</th>
                      <th className="text-left py-2 font-bold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2"><code className="px-2 py-1 bg-card rounded text-xs font-mono">outbound_click</code></td>
                      <td className="py-2 text-muted-foreground">Clicks on external links</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2"><code className="px-2 py-1 bg-card rounded text-xs font-mono">file_download</code></td>
                      <td className="py-2 text-muted-foreground">Downloads of PDF, ZIP, DOC, etc.</td>
                    </tr>
                    <tr>
                      <td className="py-2"><code className="px-2 py-1 bg-card rounded text-xs font-mono">scroll_depth</code></td>
                      <td className="py-2 text-muted-foreground">Page scroll milestones (25%, 50%, 75%, 100%)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <h3 className="text-lg font-bold">Filter Events</h3>
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
          <div className="flex gap-2">
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
        </div>

        {/* Events Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {events.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-xl font-bold mb-2">No events recorded yet</h3>
              <p className="text-muted-foreground mb-6">
                Once you start tracking custom events, they'll appear here
              </p>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-all"
              >
                View Implementation Guide
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  <th className="text-left p-4 font-bold">Event Name</th>
                  <th className="text-left p-4 font-bold">Count</th>
                  <th className="text-left p-4 font-bold">Properties</th>
                  <th className="text-right p-4 font-bold">Last Triggered</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, index) => (
                  <tr 
                    key={index}
                    className="border-b border-border hover:bg-secondary/50 transition-colors"
                  >
                    <td className="p-4">
                      <code className="px-3 py-1.5 bg-accent/10 text-accent rounded font-mono text-sm font-medium">
                        {event.event_name}
                      </code>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-secondary rounded-full text-sm font-medium">
                        {event.count}
                      </span>
                    </td>
                    <td className="p-4">
                      {event.properties && Object.keys(event.properties).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(event.properties).slice(0, 3).map(([key, value]) => (
                            <span
                              key={key}
                              className="px-2 py-1 bg-secondary rounded text-xs font-mono border border-border"
                            >
                              {key}: {String(value)}
                            </span>
                          ))}
                          {Object.keys(event.properties).length > 3 && (
                            <span className="px-2 py-1 text-xs text-muted-foreground">
                              +{Object.keys(event.properties).length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No properties</span>
                      )}
                    </td>
                    <td className="p-4 text-right text-sm text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
