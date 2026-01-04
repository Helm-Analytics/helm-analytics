import { useState, useEffect } from 'react';
import { Activity, Copy, Check, TrendingUp, Code, Sparkles, Filter } from 'lucide-react';
import api from '../api';

export default function CustomEventsPage() {
  const [events, setEvents] = useState([]);
  const [showCode, setShowCode] = useState(true);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchEvents();
  }, [filter, timeRange]);

  const fetchEvents = async () => {
    try {
      const data = await api.getCustomEvents({
        timeRange,
        eventName: filter === 'all' ? null : filter,
      });
      setEvents(data || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-3 shadow-lg shadow-purple-500/20">
                <Activity className="w-4 h-4" />
                Custom Events
              </div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                Track User Actions
              </h1>
              <p className="text-muted-foreground">Beyond pageviews - track any user action with custom events</p>
            </div>
            <button
              onClick={() => setShowCode(!showCode)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center gap-2"
            >
              <Code className="w-4 h-4" />
              {showCode ? 'Hide Code' : 'Show Code'}
            </button>
          </div>
        </div>

        {/* Implementation Guide */}
        {showCode && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Implementation Guide</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                className="text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-500 transition-all hover:shadow-md"
              >
                <h3 className="font-bold mb-2 text-purple-600">Basic</h3>
                <p className="text-sm text-muted-foreground">Simple event tracking</p>
              </button>
              <button
                className="text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-pink-500 transition-all hover:shadow-md"
              >
                <h3 className="font-bold mb-2 text-pink-600">React</h3>
                <p className="text-sm text-muted-foreground">In React components</p>
              </button>
              <button
                className="text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-500 transition-all hover:shadow-md"
              >
                <h3 className="font-bold mb-2 text-orange-600">Advanced</h3>
                <p className="text-sm text-muted-foreground">Complex event data</p>
              </button>
            </div>

            <div className="relative">
              <pre className="bg-gradient-to-r from-gray-900 to-gray-800 text-green-400 p-6 rounded-xl overflow-x-auto text-sm font-mono shadow-lg">
                {codeExamples.basic}
              </pre>
              <button
                onClick={() => copyCode(codeExamples.basic)}
                className="absolute top-4 right-4 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-300" />}
              </button>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-bold mb-2 flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <TrendingUp className="w-4 h-4" />
                Auto-Tracked Events
              </h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm font-medium border border-purple-200 dark:border-purple-700">
                  outbound_click
                </span>
                <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm font-medium border border-purple-200 dark:border-purple-700">
                  file_download
                </span>
                <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm font-medium border border-purple-200 dark:border-purple-700">
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
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white dark:bg-gray-800 text-foreground hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
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
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white dark:bg-gray-800 text-foreground hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
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
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-foreground hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              Last {range}
            </button>
          ))}
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 p-12 text-center">
              <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-bold mb-2">No events yet</h3>
              <p className="text-muted-foreground mb-6">Start tracking custom events to see them here</p>
              <button 
                onClick={() => setShowCode(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all"
              >
                View Implementation Guide
              </button>
            </div>
          ) : (
            events.map((event, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                        <Activity className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-lg font-bold">{event.event_name}</h3>
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                        {event.count} events
                      </span>
                    </div>
                    {event.properties && Object.keys(event.properties).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(event.properties).slice(0, 5).map(([key, value]) => (
                          <span
                            key={key}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-mono"
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
