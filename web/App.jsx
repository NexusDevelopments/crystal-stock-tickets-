import { BrowserRouter as Router, NavLink, Routes, Route } from 'react-router-dom';
import BotStatus from './pages/BotStatus';
import InviteBot from './pages/InviteBot';
import Tickets from './pages/Tickets';
import BotControls from './pages/BotControls';
import Logs from './pages/Logs';
import TicketTranscript from './pages/TicketTranscript';
import logo from './assets/crystal-logo.svg';

function App() {
  return (
    <Router>
      <div className="app-shell">
        <aside className="global-side-panel">
          <div className="side-brand">
            <img src={logo} alt="Crystal logo" className="home-logo" />
            <div className="side-brand-text">Crystal Stock Tickets</div>
          </div>
          <div className="side-section">Navigation</div>
          <nav className="side-nav">
            <NavLink to="/botstatus" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>Bot Status</NavLink>
            <NavLink to="/invite" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>Invite Bot</NavLink>
            <NavLink to="/botcontrols" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>Bot Controls</NavLink>
            <NavLink to="/tickets" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>Tickets</NavLink>
            <NavLink to="/logs" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>Ticket Logs</NavLink>
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
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
