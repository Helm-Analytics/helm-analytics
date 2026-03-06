import { useState, useEffect, useCallback } from 'react';
import { Activity, Eye, MousePointerClick, Shield, AlertCircle, Clock } from 'lucide-react';

const ActivityFeed = ({ siteId }) => {
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (siteId) {
      fetchActivities();
      const interval = setInterval(fetchActivities, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [siteId, filter, fetchActivities]);

  const fetchActivities = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/activity?siteId=${siteId}&filter=${filter}&limit=50`
      );
      const data = await response.json();
      setActivities(data.activities || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      setLoading(false);
    }
  }, [siteId, filter]);

  const getIcon = (type) => {
    switch (type) {
      case 'pageview':
        return <Eye className="w-4 h-4" />;
      case 'custom_event':
        return <MousePointerClick className="w-4 h-4" />;
      case 'visitor_new':
        return <Activity className="w-4 h-4" />;
      case 'firewall_block':
        return <Shield className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'pageview':
        return 'text-blue-500';
      case 'custom_event':
        return 'text-purple-500';
      case 'visitor_new':
        return 'text-green-500';
      case 'firewall_block':
        return 'text-red-500';
      case 'error':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'pageviews', label: 'Views' },
    { value: 'events', label: 'Events' },
    { value: 'visitors', label: 'Visitors' },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent" />
          Live Activity
        </h3>
        <div className="flex items-center gap-1 text-xs">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-muted-foreground">Real-time</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filter === f.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No recent activity
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className={`p-2 rounded-lg bg-secondary ${getColor(activity.activityType)}`}>
                {getIcon(activity.activityType)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm truncate">
                    {activity.activityData?.url || activity.activityData?.eventName || 'Unknown'}
                  </span>
                  {activity.country && (
                    <span className="text-xs text-muted-foreground">
                      {activity.country}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {activity.browser && <span>{activity.browser}</span>}
                  {activity.os && <span>•</span>}
                  {activity.os && <span>{activity.os}</span>}
                  {activity.device && <span>•</span>}
                  {activity.device && <span>{activity.device}</span>}
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                <Clock className="w-3 h-3" />
                {formatTime(activity.createdAt)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
