import { useEffect, useState } from 'react';

const DEFAULT_PRESET = {
  title: 'TradUp Middleman Guide',
  introText: 'Trusted middleman workflow for Roblox game trades. Use this guide before every deal to stay safe.',
  whatIsText: '',
  safetyText: '',
  riskBullets: [],
  serverAboutText: '',
  footerText: 'TradUp • Secure Roblox MiddleMan Trading',
  colorHex: '#f4c542',
  websiteLabel: 'Official Website',
  websiteUrl: '',
  guidelinesLabel: 'Guidelines',
  guidelinesUrl: ''
};

function EmbedPresets() {
  const [preset, setPreset] = useState(DEFAULT_PRESET);
  const [loadingPreset, setLoadingPreset] = useState(true);
  const [saving, setSaving] = useState(false);
  const [channelId, setChannelId] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const loadPreset = async () => {
    setLoadingPreset(true);
    try {
      const response = await fetch('/api/embed-presets/tradup-middleman');
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load preset');
      }

      setPreset({ ...DEFAULT_PRESET, ...(data.preset || {}) });
    } catch (error) {
      showMessage('error', error.message);
    }
    setLoadingPreset(false);
  };

  useEffect(() => {
    loadPreset();
  }, []);

  const savePreset = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/embed-presets/tradup-middleman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...preset,
          riskBullets: String(preset.riskBullets || '')
            .split(/\r?\n/)
            .map((line) => line.replace(/^[-•\s]+/, '').trim())
            .filter(Boolean)
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to save preset');
      }

      setPreset({ ...DEFAULT_PRESET, ...(data.preset || {}) });
      showMessage('success', data.message || 'Preset saved globally.');
    } catch (error) {
      showMessage('error', error.message);
    }
    setSaving(false);
  };

  const sendPreset = async () => {
    if (!channelId.trim()) {
      showMessage('error', 'Channel ID is required.');
      return;
    }

    setSending(true);

    try {
      const response = await fetch('/api/embed-presets/tradup-middleman/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: channelId.trim() })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send preset embed');
      }

      showMessage('success', data.message || 'Embed preset sent successfully.');
    } catch (error) {
      showMessage('error', error.message);
    }

    setSending(false);
  };

  const riskBulletsText = Array.isArray(preset.riskBullets)
    ? preset.riskBullets.join('\n')
    : String(preset.riskBullets || '');

  return (
    <>
      <div className="animated-bg"></div>
      <div className="container" style={{ padding: '40px 20px', maxWidth: '1100px' }}>
        <div className="fade-in" style={{ marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', fontWeight: '800' }}>Embed Presets</h1>
          <p style={{ opacity: 0.75 }}>
            Pre-made TradUp embed you can edit, save globally, and send to any channel.
          </p>
        </div>

        {loadingPreset ? (
          <div className="card" style={{ marginBottom: '1rem' }}>Loading preset...</div>
        ) : null}

        {!loadingPreset ? (
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.8rem' }}>TradUp Middleman Guide (Global Preset)</h2>

            <div className="grid grid-2" style={{ gap: '0.8rem' }}>
              <input type="text" placeholder="Embed Title" value={preset.title} onChange={(event) => setPreset((prev) => ({ ...prev, title: event.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
              <input type="text" placeholder="Color Hex (#f4c542)" value={preset.colorHex} onChange={(event) => setPreset((prev) => ({ ...prev, colorHex: event.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
            </div>

            <textarea placeholder="Intro Text" rows={3} value={preset.introText} onChange={(event) => setPreset((prev) => ({ ...prev, introText: event.target.value }))} style={{ width: '100%', marginTop: '0.8rem', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
            <textarea placeholder="What is TradUp section" rows={3} value={preset.whatIsText} onChange={(event) => setPreset((prev) => ({ ...prev, whatIsText: event.target.value }))} style={{ width: '100%', marginTop: '0.6rem', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
            <textarea placeholder="How Safe Is TradUp MM section" rows={3} value={preset.safetyText} onChange={(event) => setPreset((prev) => ({ ...prev, safetyText: event.target.value }))} style={{ width: '100%', marginTop: '0.6rem', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
            <textarea placeholder="Risk bullets (one per line)" rows={6} value={riskBulletsText} onChange={(event) => setPreset((prev) => ({ ...prev, riskBullets: event.target.value }))} style={{ width: '100%', marginTop: '0.6rem', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
            <textarea placeholder="What This Server Is About section" rows={3} value={preset.serverAboutText} onChange={(event) => setPreset((prev) => ({ ...prev, serverAboutText: event.target.value }))} style={{ width: '100%', marginTop: '0.6rem', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
            <input type="text" placeholder="Footer Text" value={preset.footerText} onChange={(event) => setPreset((prev) => ({ ...prev, footerText: event.target.value }))} style={{ width: '100%', marginTop: '0.6rem', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />

            <div className="grid grid-2" style={{ gap: '0.8rem', marginTop: '0.8rem' }}>
              <input type="text" placeholder="Website Button Label" value={preset.websiteLabel} onChange={(event) => setPreset((prev) => ({ ...prev, websiteLabel: event.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
              <input type="text" placeholder="Website URL" value={preset.websiteUrl} onChange={(event) => setPreset((prev) => ({ ...prev, websiteUrl: event.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
              <input type="text" placeholder="Guidelines Button Label" value={preset.guidelinesLabel} onChange={(event) => setPreset((prev) => ({ ...prev, guidelinesLabel: event.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
              <input type="text" placeholder="Guidelines URL" value={preset.guidelinesUrl} onChange={(event) => setPreset((prev) => ({ ...prev, guidelinesUrl: event.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
            </div>

            <div style={{ marginTop: '0.9rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" type="button" onClick={savePreset} disabled={saving}>
                {saving ? 'Saving...' : 'Save Globally'}
              </button>
              <button className="btn" type="button" onClick={loadPreset}>
                Reload Preset
              </button>
            </div>
          </div>
        ) : null}

        <div className="card" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '0.6rem' }}>Target Channel</h2>
          <input
            type="text"
            placeholder="Channel ID"
            value={channelId}
            onChange={(event) => setChannelId(event.target.value)}
            style={{
              width: '100%',
              maxWidth: '420px',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff'
            }}
          />
          <div style={{ marginTop: '0.8rem' }}>
            <button className="btn btn-primary" type="button" onClick={sendPreset} disabled={sending || loadingPreset}>
              {sending ? 'Sending...' : 'Send Saved Preset'}
            </button>
          </div>
        </div>

        {message.text ? (
          <div
            className="card"
            style={{
              marginBottom: '1rem',
              borderColor: message.type === 'success' ? 'rgba(255,255,255,0.4)' : 'rgba(255,100,100,0.5)',
              background: message.type === 'success' ? 'rgba(255,255,255,0.08)' : 'rgba(255,100,100,0.12)'
            }}
          >
            {message.text}
          </div>
        ) : null}

      </div>
    </>
  );
}

export default EmbedPresets;
