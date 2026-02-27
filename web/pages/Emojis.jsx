import { useState } from 'react';
import logo from '../assets/crystal-logo.svg';

function Emojis() {
  const [inviteLink, setInviteLink] = useState('');
  const [targetGuildId, setTargetGuildId] = useState('');
  const [downloadedEmojis, setDownloadedEmojis] = useState([]);
  const [selectedEmojis, setSelectedEmojis] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [sourceGuildName, setSourceGuildName] = useState('');

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const extractInviteCode = (link) => {
    const match = link.match(/discord\.gg\/([a-zA-Z0-9]+)/i) || link.match(/discord\.com\/invite\/([a-zA-Z0-9]+)/i);
    return match ? match[1] : link.trim();
  };

  const downloadEmojis = async () => {
    if (!inviteLink.trim()) {
      showMessage('error', 'Please enter a server invite link');
      return;
    }

    setDownloading(true);
    try {
      const inviteCode = extractInviteCode(inviteLink);
      const response = await fetch('/api/emojis/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to download emojis');
      }

      setDownloadedEmojis(data.emojis || []);
      setSourceGuildName(data.guildName || 'Unknown Server');
      setSelectedEmojis(data.emojis.map(e => e.id));
      showMessage('success', `Downloaded ${data.emojis.length} emojis from ${data.guildName}`);
    } catch (error) {
      showMessage('error', error.message);
      setDownloadedEmojis([]);
    }
    setDownloading(false);
  };

  const uploadEmojis = async () => {
    if (!targetGuildId.trim()) {
      showMessage('error', 'Please enter a target server ID');
      return;
    }

    if (selectedEmojis.length === 0) {
      showMessage('error', 'Please select at least one emoji to upload');
      return;
    }

    setUploading(true);
    try {
      const emojisToUpload = downloadedEmojis.filter(e => selectedEmojis.includes(e.id));
      const response = await fetch('/api/emojis/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guildId: targetGuildId.trim(),
          emojis: emojisToUpload
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload emojis');
      }

      showMessage('success', data.message);
    } catch (error) {
      showMessage('error', error.message);
    }
    setUploading(false);
  };

  const toggleEmojiSelection = (emojiId) => {
    setSelectedEmojis(prev => 
      prev.includes(emojiId) 
        ? prev.filter(id => id !== emojiId)
        : [...prev, emojiId]
    );
  };

  const selectAll = () => {
    setSelectedEmojis(downloadedEmojis.map(e => e.id));
  };

  const deselectAll = () => {
    setSelectedEmojis([]);
  };

  return (
    <>
      <div className="animated-bg"></div>
      <div className="container" style={{ padding: '40px 20px', maxWidth: '1100px' }}>
        <div className="fade-in" style={{ marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', fontWeight: '800' }}>Emojis</h1>
          <p style={{ opacity: 0.75 }}>
            Download emojis from any server and upload them to your server for use in embeds.
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={logo}
                alt="TradeUp"
                style={{ width: '28px', height: '28px', borderRadius: '6px' }}
              />
              <span>{message.text}</span>
            </div>
          </div>
        ) : null}

        <div className="card" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.8rem' }}>Download Emojis</h2>
          <p style={{ opacity: 0.75, marginBottom: '0.8rem', fontSize: '0.9rem' }}>
            Paste a Discord server invite link to download all emojis from that server.
          </p>
          
          <input
            type="text"
            placeholder="discord.gg/... or https://discord.com/invite/..."
            value={inviteLink}
            onChange={(e) => setInviteLink(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              marginBottom: '0.8rem'
            }}
          />

          <button 
            className="btn btn-primary" 
            onClick={downloadEmojis}
            disabled={downloading}
          >
            {downloading ? 'Downloading...' : 'Download Emojis'}
          </button>
        </div>

        {downloadedEmojis.length > 0 ? (
          <>
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <h2 style={{ fontSize: '1.2rem' }}>
                  Downloaded Emojis from {sourceGuildName} ({selectedEmojis.length}/{downloadedEmojis.length})
                </h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn" onClick={selectAll}>Select All</button>
                  <button className="btn" onClick={deselectAll}>Deselect All</button>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: '10px',
                maxHeight: '400px',
                overflowY: 'auto',
                padding: '10px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '8px'
              }}>
                {downloadedEmojis.map((emoji) => (
                  <div
                    key={emoji.id}
                    onClick={() => toggleEmojiSelection(emoji.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px',
                      border: selectedEmojis.includes(emoji.id) 
                        ? '2px solid rgba(255,255,255,0.6)' 
                        : '2px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      background: selectedEmojis.includes(emoji.id)
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <img 
                      src={emoji.url} 
                      alt={emoji.name}
                      style={{ width: '48px', height: '48px' }}
                    />
                    <div style={{ fontSize: '0.7rem', opacity: 0.8, textAlign: 'center', wordBreak: 'break-word' }}>
                      {emoji.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2 style={{ fontSize: '1.2rem', marginBottom: '0.8rem' }}>Upload to Server</h2>
              <p style={{ opacity: 0.75, marginBottom: '0.8rem', fontSize: '0.9rem' }}>
                Enter your server ID where you want to upload the selected emojis.
              </p>
              
              <input
                type="text"
                placeholder="Your Server ID"
                value={targetGuildId}
                onChange={(e) => setTargetGuildId(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  marginBottom: '0.8rem'
                }}
              />

              <div>
                <button 
                  className="btn btn-primary" 
                  onClick={uploadEmojis}
                  disabled={uploading || selectedEmojis.length === 0}
                >
                  {uploading ? 'Uploading...' : `Upload ${selectedEmojis.length} Emojis`}
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}

export default Emojis;
