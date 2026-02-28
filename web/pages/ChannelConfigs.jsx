import { useEffect, useState } from 'react';
import logo from '../assets/crystal-logo.svg';

function ChannelConfigs() {
  const [guilds, setGuilds] = useState([]);
  const [guildId, setGuildId] = useState('');
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissionsView, setPermissionsView] = useState(false);
  const [channelPermissions, setChannelPermissions] = useState([]);
  const [loadingGuilds, setLoadingGuilds] = useState(true);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [guildMenuOpen, setGuildMenuOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState('text');
  const [createName, setCreateName] = useState('');
  const [createCategory, setCreateCategory] = useState('');
  const [renameModal, setRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const loadGuilds = async () => {
    setLoadingGuilds(true);
    try {
      const response = await fetch('/api/perms/guilds');
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load guilds');
      }

      setGuilds(data.guilds || []);
      if (!guildId && data.guilds?.length) {
        setGuildId(data.guilds[0].id);
      }
    } catch (error) {
      showMessage('error', error.message);
    }
    setLoadingGuilds(false);
  };

  const loadChannels = async (targetGuildId) => {
    const normalizedGuildId = String(targetGuildId || '').trim();
    if (!normalizedGuildId) return;

    setLoadingChannels(true);
    setSelectedChannel(null);
    setPermissionsView(false);

    try {
      const response = await fetch(`/api/channels?guildId=${encodeURIComponent(normalizedGuildId)}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load channels');
      }

      setChannels(data.channels || []);
      setRoles(data.roles || []);
    } catch (error) {
      showMessage('error', error.message);
      setChannels([]);
    }

    setLoadingChannels(false);
  };

  const loadChannelPermissions = async (channelId) => {
    if (!guildId || !channelId) return;

    try {
      const response = await fetch(
        `/api/channels/${encodeURIComponent(channelId)}/permissions?guildId=${encodeURIComponent(guildId)}`
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load channel permissions');
      }

      setChannelPermissions(data.permissions || []);
      setPermissionsView(true);
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const createChannel = async () => {
    if (!guildId || !createName.trim()) {
      showMessage('error', 'Channel name is required');
      return;
    }

    try {
      const response = await fetch('/api/channels/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guildId,
          type: createType,
          name: createName.trim(),
          categoryId: createCategory || null
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create channel');
      }

      showMessage('success', `${createType === 'category' ? 'Category' : 'Channel'} created successfully`);
      setShowCreateModal(false);
      setCreateName('');
      setCreateCategory('');
      loadChannels(guildId);
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const deleteChannel = async (channelId, channelName) => {
    if (!confirm(`Are you sure you want to delete "${channelName}"?`)) return;

    try {
      const response = await fetch(`/api/channels/${encodeURIComponent(channelId)}?guildId=${encodeURIComponent(guildId)}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete channel');
      }

      showMessage('success', 'Channel deleted successfully');
      if (selectedChannel?.id === channelId) {
        setSelectedChannel(null);
        setPermissionsView(false);
      }
      loadChannels(guildId);
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const renameChannel = async () => {
    if (!selectedChannel || !renameValue.trim()) {
      showMessage('error', 'Channel name is required');
      return;
    }

    try {
      const response = await fetch(`/api/channels/${encodeURIComponent(selectedChannel.id)}/rename`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guildId,
          name: renameValue.trim()
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to rename channel');
      }

      showMessage('success', 'Channel renamed successfully');
      setRenameModal(false);
      setRenameValue('');
      loadChannels(guildId);
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const bulkHideChannels = async () => {
    if (!guildId) return;
    if (!confirm('Hide all channels from @everyone and members without view permissions?')) return;

    try {
      const response = await fetch('/api/channels/bulk-hide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to hide channels');
      }

      showMessage('success', `Hidden ${data.count || 0} channels from @everyone`);
      loadChannels(guildId);
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const bulkShowChannels = async () => {
    if (!guildId) return;
    if (!confirm('Show all non-staff channels to @everyone?')) return;

    try {
      const response = await fetch('/api/channels/bulk-show', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to show channels');
      }

      showMessage('success', `Restored view permissions for ${data.count || 0} channels`);
      loadChannels(guildId);
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const updateChannelPermission = async (roleId, permission, value) => {
    if (!selectedChannel) return;

    try {
      const response = await fetch(`/api/channels/${encodeURIComponent(selectedChannel.id)}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guildId,
          roleId,
          permission,
          value
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update permission');
      }

      showMessage('success', 'Permission updated');
      loadChannelPermissions(selectedChannel.id);
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  useEffect(() => {
    loadGuilds();
  }, []);

  useEffect(() => {
    if (guildId) {
      loadChannels(guildId);
    }
  }, [guildId]);

  const selectedGuild = guilds.find((g) => g.id === guildId);
  const categories = channels.filter((ch) => ch.type === 'category');
  const textChannels = channels.filter((ch) => ch.type === 'text');
  const voiceChannels = channels.filter((ch) => ch.type === 'voice');

  return (
    <>
      <div className="animated-bg"></div>
      <div className="container" style={{ padding: '34px 20px', maxWidth: '1300px' }}>
        <div className="fade-in" style={{ marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.4rem' }}>Channel Configs</h1>
          <p style={{ opacity: 0.72 }}>
            Manage channels, categories, permissions, and bulk operations for your Discord server.
          </p>
        </div>

        {message.text ? (
          <div
            className="card"
            style={{
              marginBottom: '1rem',
              borderColor: message.type === 'success' ? 'rgba(255,255,255,0.35)' : 'rgba(255,100,100,0.6)',
              background: message.type === 'success' ? 'rgba(255,255,255,0.07)' : 'rgba(255,100,100,0.12)'
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
          <div style={{ position: 'relative', minWidth: '320px' }}>
            <button
              type="button"
              className="btn"
              disabled={loadingGuilds}
              onClick={() => setGuildMenuOpen((prev) => !prev)}
              style={{
                width: '100%',
                borderWidth: '1px',
                background: 'rgba(255,255,255,0.06)',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px'
              }}
            >
              <span>
                {selectedGuild ? `${selectedGuild.name} (${selectedGuild.memberCount})` : 'Select Guild'}
              </span>
              <span style={{ opacity: 0.75 }}>{guildMenuOpen ? '▲' : '▼'}</span>
            </button>

            {guildMenuOpen ? (
              <div
                className="card"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  zIndex: 30,
                  padding: '8px',
                  maxHeight: '260px',
                  overflowY: 'auto'
                }}
              >
                <div style={{ display: 'grid', gap: '6px' }}>
                  {guilds.map((guild) => (
                    <button
                      key={guild.id}
                      type="button"
                      onClick={() => {
                        setGuildId(guild.id);
                        setGuildMenuOpen(false);
                      }}
                      className="btn"
                      style={{
                        width: '100%',
                        background: guild.id === guildId ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.04)',
                        borderColor: guild.id === guildId ? 'rgba(255,255,255,0.40)' : 'rgba(255,255,255,0.12)',
                        padding: '8px 10px',
                        textAlign: 'left',
                        fontSize: '0.95rem'
                      }}
                    >
                      {guild.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {guildId && (
        <>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn" onClick={() => setShowCreateModal(true)}>
              Create Channel/Category
            </button>
            <button type="button" className="btn" onClick={bulkHideChannels}>
              Hide All Channels
            </button>
            <button type="button" className="btn" onClick={bulkShowChannels}>
              Show Non-Staff Channels
            </button>
          </div>

          {loadingChannels ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              Loading channels...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: permissionsView ? '1fr 1fr' : '1fr', gap: '20px' }}>
              <div className="card">
                <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem', fontWeight: 700 }}>Channels</h3>

                {categories.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ marginBottom: '0.75rem', opacity: 0.7, fontSize: '0.9rem', fontWeight: 600 }}>CATEGORIES</h4>
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        style={{
                          padding: '10px 12px',
                          marginBottom: '8px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                          📁 {cat.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteChannel(cat.id, cat.name)}
                          className="btn"
                          style={{ padding: '5px 12px', fontSize: '0.85rem' }}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {textChannels.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ marginBottom: '0.75rem', opacity: 0.7, fontSize: '0.9rem', fontWeight: 600 }}>TEXT CHANNELS</h4>
                    {textChannels.map((ch) => (
                      <div
                        key={ch.id}
                        onClick={() => {
                          setSelectedChannel(ch);
                          loadChannelPermissions(ch.id);
                        }}
                        style={{
                          padding: '10px 12px',
                          marginBottom: '8px',
                          background:
                            selectedChannel?.id === ch.id
                              ? 'rgba(255, 255, 255, 0.12)'
                              : 'rgba(255, 255, 255, 0.04)',
                          border: `1px solid ${
                            selectedChannel?.id === ch.id ? 'rgba(255, 255, 255, 0.30)' : 'rgba(255, 255, 255, 0.12)'
                          }`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span style={{ fontSize: '0.95rem' }}># {ch.name}</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedChannel(ch);
                              setRenameValue(ch.name);
                              setRenameModal(true);
                            }}
                            className="btn"
                            style={{ padding: '5px 12px', fontSize: '0.85rem' }}
                          >
                            Rename
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChannel(ch.id, ch.name);
                            }}
                            className="btn"
                            style={{ padding: '5px 12px', fontSize: '0.85rem' }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {voiceChannels.length > 0 && (
                  <div>
                    <h4 style={{ marginBottom: '0.75rem', opacity: 0.7, fontSize: '0.9rem', fontWeight: 600 }}>VOICE CHANNELS</h4>
                    {voiceChannels.map((ch) => (
                      <div
                        key={ch.id}
                        onClick={() => {
                          setSelectedChannel(ch);
                          loadChannelPermissions(ch.id);
                        }}
                        style={{
                          padding: '10px 12px',
                          marginBottom: '8px',
                          background:
                            selectedChannel?.id === ch.id
                              ? 'rgba(255, 255, 255, 0.12)'
                              : 'rgba(255, 255, 255, 0.04)',
                          border: `1px solid ${
                            selectedChannel?.id === ch.id ? 'rgba(255, 255, 255, 0.30)' : 'rgba(255, 255, 255, 0.12)'
                          }`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span style={{ fontSize: '0.95rem' }}>🔊 {ch.name}</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedChannel(ch);
                              setRenameValue(ch.name);
                              setRenameModal(true);
                            }}
                            className="btn"
                            style={{ padding: '5px 12px', fontSize: '0.85rem' }}
                          >
                            Rename
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChannel(ch.id, ch.name);
                            }}
                            className="btn"
                            style={{ padding: '5px 12px', fontSize: '0.85rem' }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {channels.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>
                    No channels found
                  </div>
                )}
              </div>

              {permissionsView && selectedChannel && (
                <div className="card">
                  <h3 style={{ marginBottom: '0.75rem', fontSize: '1.3rem', fontWeight: 700 }}>
                    Permissions for #{selectedChannel.name}
                  </h3>
                  <p style={{ opacity: 0.7, marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                    Click permissions to toggle (Allow/Deny/Neutral)
                  </p>

                  {roles.map((role) => {
                    const rolePerms = channelPermissions.find((p) => p.roleId === role.id);
                    return (
                      <div
                        key={role.id}
                        style={{
                          marginBottom: '1.25rem',
                          padding: '12px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px'
                        }}
                      >
                        <h4 style={{ marginBottom: '0.75rem', color: role.color || '#fff', fontSize: '1rem', fontWeight: 600 }}>
                          {role.name}
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'Connect', 'Speak'].map((perm) => {
                            const isAllowed = rolePerms?.allow?.includes(perm);
                            const isDenied = rolePerms?.deny?.includes(perm);
                            const status = isAllowed ? 'allow' : isDenied ? 'deny' : 'neutral';

                            return (
                              <button
                                key={perm}
                                type="button"
                                onClick={() => {
                                  const nextStatus = status === 'neutral' ? 'allow' : status === 'allow' ? 'deny' : 'neutral';
                                  updateChannelPermission(role.id, perm, nextStatus);
                                }}
                                className="btn"
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '0.85rem',
                                  background:
                                    status === 'allow'
                                      ? 'rgba(76, 175, 80, 0.15)'
                                      : status === 'deny'
                                      ? 'rgba(244, 67, 54, 0.15)'
                                      : 'rgba(255, 255, 255, 0.04)',
                                  borderColor:
                                    status === 'allow'
                                      ? 'rgba(76, 175, 80, 0.5)'
                                      : status === 'deny'
                                      ? 'rgba(244, 67, 54, 0.5)'
                                      : 'rgba(255, 255, 255, 0.16)',
                                  color:
                                    status === 'allow'
                                      ? '#4caf50'
                                      : status === 'deny'
                                      ? '#f44336'
                                      : '#fff'
                                }}
                              >
                                {perm} {status === 'allow' ? '✓' : status === 'deny' ? '✗' : '○'}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="card"
            style={{ padding: '2rem', maxWidth: '500px', width: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>Create Channel/Category</h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.7, fontWeight: 600 }}>Type</label>
              <select
                value={createType}
                onChange={(e) => setCreateType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '1rem'
                }}
              >
                <option value="text">Text Channel</option>
                <option value="voice">Voice Channel</option>
                <option value="category">Category</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.7, fontWeight: 600 }}>Name</label>
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Enter channel name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '1rem'
                }}
              />
            </div>

            {createType !== 'category' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.7, fontWeight: 600 }}>
                  Parent Category (Optional)
                </label>
                <select
                  value={createCategory}
                  onChange={(e) => setCreateCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">None</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={createChannel} className="btn" style={{ flex: 1 }}>
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn"
                style={{ flex: 1, background: 'rgba(255,255,255,0.06)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {renameModal && selectedChannel && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setRenameModal(false)}
        >
          <div
            className="card"
            style={{ padding: '2rem', maxWidth: '500px', width: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>Rename Channel</h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.7, fontWeight: 600 }}>New Name</label>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="Enter new name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={renameChannel} className="btn" style={{ flex: 1 }}>
                Rename
              </button>
              <button
                type="button"
                onClick={() => setRenameModal(false)}
                className="btn"
                style={{ flex: 1, background: 'rgba(255,255,255,0.06)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

export default ChannelConfigs;
