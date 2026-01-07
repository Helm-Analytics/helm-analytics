import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Activity, Filter, Clock, Globe, Monitor, AlertCircle, Shield, Eye } from 'lucide-react';
import { api } from '../api';

export default function ActivityPage() {
  const { selectedSite } = useOutletContext();
  const [activities, setActivities] = useState([]);
  const [totalUsage, setTotalUsage] = useState(0);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedSite?.id) {
      fetchActivities();
      const interval = setInterval(fetchActivities, 5000); // Refresh every 5s
      return () => clearInterval(interval);
    }
  }, [selectedSite, filter]);

  const fetchActivities = async () => {
    try {
      const response = await api.getActivityLog(selectedSite.id, filter);
      setActivities(response?.activities || []);
      setTotalUsage(response?.totalUsageMonth || 0);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      pageview: Eye,
      event: Activity,
      visitor: Globe,
      block: Shield,
      error: AlertCircle,
    };
    return icons[type] || Activity;
  };

  const getActivityColor = (type) => {
    const colors = {
      pageview: 'text-accent',
      event: 'text-accent',
      visitor: 'text-green-500',
      block: 'text-destructive',
      error: 'text-orange-500',
    };
    return colors[type] || 'text-muted-foreground';
  };

  const filters = [
    { value: 'all', label: 'All Activity' },
    { value: 'pageviews', label: 'Pageviews' },
    { value: 'events', label: 'Events' },
    { value: 'errors', label: 'Errors' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">
              Activity <span className="text-accent">Feed</span>
            </h1>
            {!loading && (
              <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-xs font-medium text-accent flex items-center gap-2">
                <Activity className="w-3 h-3" />
                <span>Usage: {totalUsage.toLocaleString()} Events (Month)</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>Real-time updates</span>
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Monitor all activity across your website in real-time</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f.value
                ? 'bg-accent text-accent-foreground'
                : 'bg-card text-foreground hover:bg-secondary border border-border'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-accent rounded-full animate-spin border-t-transparent" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <Activity className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-foreground font-medium">No activity yet</p>
            <p className="text-sm text-muted-foreground mt-1">Activity will appear here as users interact with your site</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);
            
            // Build description based on activity type
            const description = activity.eventName 
              ? `Custom Event: ${activity.eventName}` 
              : activity.type === 'pageview' 
                ? `Viewed ${activity.url}` 
                : activity.type === 'error'
                  ? `Error: ${activity.message}`
                  : activity.type;
            
            return (
              <div
                key={index}
                className="bg-card border border-border rounded-lg px-4 py-3 hover:border-accent/50 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground mb-1">{description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {activity.ip && (
                        <span>{activity.ip}</span>
                      )}
                      {activity.country && (
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {activity.country}
                        </span>
                      )}
                      {activity.browser && (
                        <span>{activity.browser}</span>
                      )}
                      {activity.os && (
                        <span>{activity.os}</span>
                      )}
                    </div>
                  </div>
                  
                  <time className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </time>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
