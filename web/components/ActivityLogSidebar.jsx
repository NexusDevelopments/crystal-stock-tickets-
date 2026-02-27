import { useEffect, useState } from 'react';

function ActivityLogSidebar() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      const response = await fetch('/api/activity-logs?limit=20');
      const data = await response.json();
      if (response.ok && data.success) {
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to load activity logs:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const getActionLabel = (action) => {
    const labels = {
      preset_sent: 'Preset Sent',
      preset_saved: 'Preset Saved',
      preset_deleted: 'Preset Deleted',
      saved_preset_sent: 'Saved Preset Sent',
      emojis_downloaded: 'Emojis Downloaded',
      emojis_uploaded: 'Emojis Uploaded',
      site_updated: 'Site Updated',
      code_push: 'Code Push'
    };
    return labels[action] || action;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="activity-log-sidebar">
      <div className="activity-log-header">
        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Activity Log</div>
        <div style={{ opacity: 0.6, fontSize: '0.75rem' }}>Recent actions</div>
      </div>
      
      <div className="activity-log-content">
        {loading ? (
          <div style={{ opacity: 0.6, fontSize: '0.8rem', padding: '10px' }}>Loading...</div>
        ) : logs.length === 0 ? (
          <div style={{ opacity: 0.6, fontSize: '0.8rem', padding: '10px' }}>No recent activity</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="activity-log-item">
              <div style={{ fontSize: '0.75rem', fontWeight: 500, marginBottom: '4px' }}>
                {getActionLabel(log.action)}
              </div>
              {log.message ? (
                <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '2px' }}>
                  {log.message}
                </div>
              ) : null}
              {log.presetName ? (
                <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '2px' }}>
                  {log.presetName}
                </div>
              ) : null}
              {log.guildName ? (
                <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '2px' }}>
                  {log.guildName}
                </div>
              ) : null}
              {log.count ? (
                <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '2px' }}>
                  {log.count} items
                </div>
              ) : null}
              {log.uploaded !== undefined ? (
                <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '2px' }}>
                  {log.uploaded} uploaded{log.failed > 0 ? `, ${log.failed} failed` : ''}
                </div>
              ) : null}
              <div style={{ fontSize: '0.65rem', opacity: 0.5, marginTop: '4px' }}>
                {formatTime(log.timestamp)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ActivityLogSidebar;
