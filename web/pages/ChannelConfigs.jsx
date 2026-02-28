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
    <div className="global-page-region" style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem' }}>Channel Configs</h1>

      {message.text && (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            borderRadius: '0.5rem',
            background: message.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
            border: `1px solid ${message.type === 'success' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <img src={logo} alt="Logo" style={{ width: '24px', height: '24px' }} />
          <span style={{ color: message.type === 'success' ? '#4caf50' : '#f44336' }}>
            {message.text}
          </span>
        </div>
      )}

      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Select Server</h3>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setGuildMenuOpen(!guildMenuOpen)}
            disabled={loadingGuilds}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              color: '#fff',
              cursor: loadingGuilds ? 'not-allowed' : 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              textAlign: 'left'
            }}
          >
            <span>{loadingGuilds ? 'Loading...' : selectedGuild?.name || 'Select a server'}</span>
            <span>{guildMenuOpen ? '▲' : '▼'}</span>
          </button>

          {guildMenuOpen && !loadingGuilds && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '0.5rem',
                background: 'rgba(20, 20, 40, 0.98)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                maxHeight: '300px',
                overflowY: 'auto',
                zIndex: 10,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
              }}
            >
              {guilds.map((guild) => (
                <div
                  key={guild.id}
                  onClick={() => {
                    setGuildId(guild.id);
                    setGuildMenuOpen(false);
                  }}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    background: guild.id === guildId ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = guild.id === guildId ? 'rgba(255, 255, 255, 0.1)' : 'transparent')
                  }
                >
                  {guild.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {guildId && (
        <>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowCreateModal(true)}
              className="action-button"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Create Channel/Category
            </button>
            <button
              onClick={bulkHideChannels}
              className="action-button"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Hide All Channels
            </button>
            <button
              onClick={bulkShowChannels}
              className="action-button"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Show Non-Staff Channels
            </button>
          </div>

          {loadingChannels ? (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              Loading channels...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: permissionsView ? '1fr 1fr' : '1fr', gap: '2rem' }}>
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Channels</h3>

                {categories.length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ marginBottom: '1rem', color: '#aaa' }}>Categories</h4>
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        style={{
                          padding: '0.75rem',
                          marginBottom: '0.5rem',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '0.5rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ fontWeight: '600', textTransform: 'uppercase', fontSize: '0.9rem' }}>
                          📁 {cat.name}
                        </span>
                        <button
                          onClick={() => deleteChannel(cat.id, cat.name)}
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: 'rgba(244, 67, 54, 0.2)',
                            border: '1px solid rgba(244, 67, 54, 0.4)',
                            borderRadius: '0.25rem',
                            color: '#f44336',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {textChannels.length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ marginBottom: '1rem', color: '#aaa' }}>Text Channels</h4>
                    {textChannels.map((ch) => (
                      <div
                        key={ch.id}
                        onClick={() => {
                          setSelectedChannel(ch);
                          loadChannelPermissions(ch.id);
                        }}
                        style={{
                          padding: '0.75rem',
                          marginBottom: '0.5rem',
                          background:
                            selectedChannel?.id === ch.id
                              ? 'rgba(102, 126, 234, 0.2)'
                              : 'rgba(255, 255, 255, 0.03)',
                          border: `1px solid ${
                            selectedChannel?.id === ch.id ? 'rgba(102, 126, 234, 0.4)' : 'rgba(255, 255, 255, 0.1)'
                          }`,
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span># {ch.name}</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedChannel(ch);
                              setRenameValue(ch.name);
                              setRenameModal(true);
                            }}
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: 'rgba(66, 165, 245, 0.2)',
                              border: '1px solid rgba(66, 165, 245, 0.4)',
                              borderRadius: '0.25rem',
                              color: '#42a5f5',
                              cursor: 'pointer',
                              fontSize: '0.85rem'
                            }}
                          >
                            Rename
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChannel(ch.id, ch.name);
                            }}
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: 'rgba(244, 67, 54, 0.2)',
                              border: '1px solid rgba(244, 67, 54, 0.4)',
                              borderRadius: '0.25rem',
                              color: '#f44336',
                              cursor: 'pointer',
                              fontSize: '0.85rem'
                            }}
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
                    <h4 style={{ marginBottom: '1rem', color: '#aaa' }}>Voice Channels</h4>
                    {voiceChannels.map((ch) => (
                      <div
                        key={ch.id}
                        onClick={() => {
                          setSelectedChannel(ch);
                          loadChannelPermissions(ch.id);
                        }}
                        style={{
                          padding: '0.75rem',
                          marginBottom: '0.5rem',
                          background:
                            selectedChannel?.id === ch.id
                              ? 'rgba(102, 126, 234, 0.2)'
                              : 'rgba(255, 255, 255, 0.03)',
                          border: `1px solid ${
                            selectedChannel?.id === ch.id ? 'rgba(102, 126, 234, 0.4)' : 'rgba(255, 255, 255, 0.1)'
                          }`,
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span>🔊 {ch.name}</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedChannel(ch);
                              setRenameValue(ch.name);
                              setRenameModal(true);
                            }}
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: 'rgba(66, 165, 245, 0.2)',
                              border: '1px solid rgba(66, 165, 245, 0.4)',
                              borderRadius: '0.25rem',
                              color: '#42a5f5',
                              cursor: 'pointer',
                              fontSize: '0.85rem'
                            }}
                          >
                            Rename
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChannel(ch.id, ch.name);
                            }}
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: 'rgba(244, 67, 54, 0.2)',
                              border: '1px solid rgba(244, 67, 54, 0.4)',
                              borderRadius: '0.25rem',
                              color: '#f44336',
                              cursor: 'pointer',
                              fontSize: '0.85rem'
                            }}
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
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ marginBottom: '1rem' }}>
                    Permissions for #{selectedChannel.name}
                  </h3>
                  <p style={{ color: '#aaa', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Click permissions to toggle (Allow/Deny/Neutral)
                  </p>

                  {roles.map((role) => {
                    const rolePerms = channelPermissions.find((p) => p.roleId === role.id);
                    return (
                      <div
                        key={role.id}
                        style={{
                          marginBottom: '1.5rem',
                          padding: '1rem',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '0.5rem'
                        }}
                      >
                        <h4 style={{ marginBottom: '0.75rem', color: role.color || '#fff' }}>
                          {role.name}
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'Connect', 'Speak'].map((perm) => {
                            const isAllowed = rolePerms?.allow?.includes(perm);
                            const isDenied = rolePerms?.deny?.includes(perm);
                            const status = isAllowed ? 'allow' : isDenied ? 'deny' : 'neutral';

                            return (
                              <button
                                key={perm}
                                onClick={() => {
                                  const nextStatus = status === 'neutral' ? 'allow' : status === 'allow' ? 'deny' : 'neutral';
                                  updateChannelPermission(role.id, perm, nextStatus);
                                }}
                                style={{
                                  padding: '0.5rem 1rem',
                                  background:
                                    status === 'allow'
                                      ? 'rgba(76, 175, 80, 0.2)'
                                      : status === 'deny'
                                      ? 'rgba(244, 67, 54, 0.2)'
                                      : 'rgba(255, 255, 255, 0.05)',
                                  border: `1px solid ${
                                    status === 'allow'
                                      ? 'rgba(76, 175, 80, 0.4)'
                                      : status === 'deny'
                                      ? 'rgba(244, 67, 54, 0.4)'
                                      : 'rgba(255, 255, 255, 0.1)'
                                  }`,
                                  borderRadius: '0.25rem',
                                  color:
                                    status === 'allow'
                                      ? '#4caf50'
                                      : status === 'deny'
                                      ? '#f44336'
                                      : '#aaa',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem'
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
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="glass-card"
            style={{ padding: '2rem', maxWidth: '500px', width: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1.5rem' }}>Create Channel/Category</h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Type</label>
              <select
                value={createType}
                onChange={(e) => setCreateType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  color: '#fff'
                }}
              >
                <option value="text">Text Channel</option>
                <option value="voice">Voice Channel</option>
                <option value="category">Category</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Name</label>
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Enter channel name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  color: '#fff'
                }}
              />
            </div>

            {createType !== 'category' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>
                  Parent Category (Optional)
                </label>
                <select
                  value={createCategory}
                  onChange={(e) => setCreateCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: '#fff'
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

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={createChannel}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  cursor: 'pointer'
                }}
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
            className="glass-card"
            style={{ padding: '2rem', maxWidth: '500px', width: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1.5rem' }}>Rename Channel</h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>New Name</label>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="Enter new name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  color: '#fff'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={renameChannel}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Rename
              </button>
              <button
                onClick={() => setRenameModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChannelConfigs;
