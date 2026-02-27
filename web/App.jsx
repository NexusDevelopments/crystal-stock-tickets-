import { BrowserRouter as Router, NavLink, Routes, Route } from 'react-router-dom';
import BotStatus from './pages/BotStatus';
import InviteBot from './pages/InviteBot';
import Tickets from './pages/Tickets';
import BotControls from './pages/BotControls';
import Logs from './pages/Logs';
import TicketTranscript from './pages/TicketTranscript';
import PermsGranter from './pages/PermsGranter';
import EmbedPresets from './pages/EmbedPresets';

function App() {
  return (
    <Router>
      <div className="app-shell">
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
            <Route path="/embedpresets" element={<EmbedPresets />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
