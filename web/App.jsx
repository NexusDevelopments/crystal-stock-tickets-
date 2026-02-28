import { useEffect, useState } from 'react';
import { BrowserRouter as Router, NavLink, Routes, Route } from 'react-router-dom';
import BotStatus from './pages/BotStatus';
import InviteBot from './pages/InviteBot';
import Tickets from './pages/Tickets';
import BotControls from './pages/BotControls';
import Logs from './pages/Logs';
import TicketTranscript from './pages/TicketTranscript';
import PermsGranter from './pages/PermsGranter';
import EmbedPresets from './pages/EmbedPresets';
import Emojis from './pages/Emojis';
import ChannelConfigs from './pages/ChannelConfigs';
import ActivityLogSidebar from './components/ActivityLogSidebar';

function App() {
  const UPDATE_ID = '2026-02-26-01';
  const UPDATE_MESSAGE = 'Site updated';
  const UPDATE_NOTES = [
    'Fixed emoji download error handling.',
    'Added activity log persistence.',
    'UI alerts now show branding.'
  ];

  const [showUpdate, setShowUpdate] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowUpdate(false), 5000);

    fetch('/api/activity-logs/append', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'code_push',
        details: {
          updateId: UPDATE_ID,
          message: `Site updated: ${UPDATE_NOTES.join(' ')}`
        }
      })
    }).catch(() => null);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <div className="app-shell">
        {showUpdate ? (
          <div className="update-popup">
            <div className="update-popup-title">{UPDATE_MESSAGE}</div>
            <div className="update-popup-notes">
              {UPDATE_NOTES.map((note) => (
                <div key={note}>{note}</div>
              ))}
            </div>
            <div className="update-progress" />
          </div>
        ) : null}
        <aside className="global-side-panel">
          <div className="side-brand">
            <div className="side-brand-text">TradeUp Owner Panel</div>
          </div>
          <div className="side-section">Navigation</div>
          <nav className="side-nav">
            <NavLink to="/botstatus" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>Bot Status</NavLink>
            <NavLink to="/invite" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>Invite Bot</NavLink>
            <NavLink to="/botcontrols" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>Bot Controls</NavLink>
            <NavLink to="/tickets" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>Tickets</NavLink>
            <NavLink to="/logs" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>Ticket Logs</NavLink>
            <NavLink to="/perms" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>Perms Granter</NavLink>
            <NavLink to="/embedpresets" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>Embed Presets</NavLink>
            <NavLink to="/channels" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>Channel Configs</NavLink>
            <NavLink to="/emojis" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>Emojis</NavLink>
          </nav>
        </aside>

        <div className="global-page-region">
          <Routes>
            <Route path="/" element={<BotStatus />} />
            <Route path="/botstatus" element={<BotStatus />} />
            <Route path="/invite" element={<InviteBot />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/id" element={<TicketTranscript />} />
            <Route path="/botcontrols" element={<BotControls />} />
            <Route path="/perms" element={<PermsGranter />} />
            <Route path="/channels" element={<ChannelConfigs />} />
            <Route path="/embedpresets" element={<EmbedPresets />} />
            <Route path="/emojis" element={<Emojis />} />
          </Routes>
        </div>

        <ActivityLogSidebar />
      </div>
    </Router>
  );
}

export default App;
