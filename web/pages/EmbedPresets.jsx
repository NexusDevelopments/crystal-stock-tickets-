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
  const [savedPresets, setSavedPresets] = useState([]);
  const [presetName, setPresetName] = useState('');
  const [loadingPreset, setLoadingPreset] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(true);
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

  const loadSavedPresets = async () => {
    setLoadingSaved(true);
    try {
      const response = await fetch('/api/embed-presets/saved');
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load saved presets');
      }

      setSavedPresets(data.presets || []);
    } catch (error) {
      showMessage('error', error.message);
    }
    setLoadingSaved(false);
  };

  useEffect(() => {
    loadPreset();
    loadSavedPresets();
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

  const saveAsNewPreset = async () => {
    if (!presetName.trim()) {
      showMessage('error', 'Please enter a preset name');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/embed-presets/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: presetName.trim(),
          preset: {
            ...preset,
            riskBullets: String(preset.riskBullets || '')
              .split(/\r?\n/)
              .map((line) => line.replace(/^[-•\s]+/, '').trim())
              .filter(Boolean)
          }
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to save preset');
      }

      showMessage('success', 'Preset saved successfully');
      setPresetName('');
      loadSavedPresets();
    } catch (error) {
      showMessage('error', error.message);
    }
    setSaving(false);
  };

  const loadSavedPreset = (savedPreset) => {
    setPreset({
      ...DEFAULT_PRESET,
      ...savedPreset.preset,
      riskBullets: Array.isArray(savedPreset.preset.riskBullets) 
        ? savedPreset.preset.riskBullets 
        : []
    });
    showMessage('success', `Loaded preset: ${savedPreset.name}`);
  };

  const deleteSavedPreset = async (presetId) => {
    if (!confirm('Are you sure you want to delete this preset?')) {
      return;
    }

    try {
      const response = await fetch(`/api/embed-presets/saved/${presetId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete preset');
      }

      showMessage('success', 'Preset deleted successfully');
      loadSavedPresets();
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const sendSavedPreset = async (presetId) => {
    if (!channelId.trim()) {
      showMessage('error', 'Please enter a channel ID');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/embed-presets/saved/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presetId,
          channelId: channelId.trim()
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send preset');
      }

      showMessage('success', data.message);
    } catch (error) {
      showMessage('error', error.message);
    }
    setSending(false);
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

            <div style={{ marginTop: '0.9rem', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button className="btn btn-primary" type="button" onClick={savePreset} disabled={saving}>
                {saving ? 'Saving...' : 'Save Globally'}
              </button>
              <button className="btn" type="button" onClick={loadPreset}>
                Reload Preset
              </button>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
                <input
                  type="text"
                  placeholder="Preset name..."
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    minWidth: '200px'
                  }}
                />
                <button className="btn" type="button" onClick={saveAsNewPreset} disabled={saving}>
                  {saving ? 'Saving...' : 'Save As New'}
                </button>
              </div>
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
              {sending ? 'Sending...' : 'Send Current Preset'}
            </button>
          </div>
        </div>

        {!loadingSaved && savedPresets.length > 0 ? (
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.8rem' }}>Saved Presets ({savedPresets.length})</h2>
            
            <div style={{ display: 'grid', gap: '0.7rem' }}>
              {savedPresets.map((saved) => (
                <div
                  key={saved.id}
                  style={{
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{saved.name}</div>
                      <div style={{ opacity: 0.7, fontSize: '0.85rem' }}>
                        {saved.preset.title} • Created {new Date(saved.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        className="btn"
                        onClick={() => loadSavedPreset(saved)}
                        style={{ padding: '7px 12px' }}
                      >
                        Load Preset
                      </button>
                      <button
                        className="btn"
                        onClick={() => sendSavedPreset(saved.id)}
                        disabled={sending || !channelId.trim()}
                        style={{ padding: '7px 12px' }}
                      >
                        Send
                      </button>
                      <button
                        className="btn"
                        onClick={() => deleteSavedPreset(saved.id)}
                        style={{ 
                          padding: '7px 12px',
                          background: 'rgba(255,100,100,0.1)',
                          borderColor: 'rgba(255,100,100,0.3)'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

      </div>
    </>
  );
}

export default EmbedPresets;
