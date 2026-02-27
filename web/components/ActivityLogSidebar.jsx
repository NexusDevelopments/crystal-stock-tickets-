import { useEffect, useState } from 'react';
import logo from '../assets/crystal-logo.svg';

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
      preset_sent: '📤 Preset Sent',
      preset_saved: '💾 Preset Saved',
      preset_deleted: '🗑️ Preset Deleted',
      saved_preset_sent: '📤 Saved Preset Sent',
      emojis_downloaded: '⬇️ Emojis Downloaded',
      emojis_uploaded: '⬆️ Emojis Uploaded'
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src={logo}
            alt="TradeUp"
            style={{ width: '26px', height: '26px', borderRadius: '6px' }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Activity Log</div>
            <div style={{ opacity: 0.6, fontSize: '0.75rem' }}>Recent actions</div>
          </div>
        </div>
      </div>
      
      <div className="activity-log-content">
        {loading ? (
          <div style={{ opacity: 0.6, fontSize: '0.8rem', padding: '10px' }}>Loading...</div>
        ) : logs.length === 0 ? (
          <div style={{ opacity: 0.6, fontSize: '0.8rem', padding: '10px' }}>No recent activity</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="activity-log-item">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                <img
                  src={logo}
                  alt="TradeUp"
                  style={{ width: '18px', height: '18px', borderRadius: '4px', opacity: 0.9 }}
                />
                <div style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                  {getActionLabel(log.action)}
                </div>
              </div>
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
