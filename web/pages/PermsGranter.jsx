import { useEffect, useMemo, useState } from 'react';
import logo from '../assets/crystal-logo.svg';

function PermsGranter() {
  const [guilds, setGuilds] = useState([]);
  const [guildId, setGuildId] = useState('');
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [roleDetail, setRoleDetail] = useState(null);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [permissionDraft, setPermissionDraft] = useState([]);
  const [memberIdInput, setMemberIdInput] = useState('');
  const [loadingGuilds, setLoadingGuilds] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingRole, setLoadingRole] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [guildMenuOpen, setGuildMenuOpen] = useState(false);

  const dangerousRoles = useMemo(
    () => roles.filter((role) => role.hasDangerousPermissions),
    [roles]
  );
  const selectedGuild = useMemo(
    () => guilds.find((guild) => guild.id === guildId) || null,
    [guilds, guildId]
  );

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

  const loadRoles = async (targetGuildId) => {
    const normalizedGuildId = String(targetGuildId || '').trim();
    if (!normalizedGuildId) return;

    setLoadingRoles(true);
    setSelectedRoleId('');
    setRoleDetail(null);
    setPermissionDraft([]);

    try {
      const response = await fetch(`/api/perms/roles?guildId=${encodeURIComponent(normalizedGuildId)}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load roles');
      }

      setRoles(data.roles || []);
      if (data.roles?.length) {
        setSelectedRoleId(data.roles[0].id);
      }
    } catch (error) {
      showMessage('error', error.message);
      setRoles([]);
    }

    setLoadingRoles(false);
  };

  const loadRoleDetail = async (targetRoleId) => {
    if (!guildId || !targetRoleId) return;

    setLoadingRole(true);
    try {
      const response = await fetch(
        `/api/perms/role?guildId=${encodeURIComponent(guildId)}&roleId=${encodeURIComponent(targetRoleId)}`
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load role details');
      }

      setRoleDetail(data.role);
      setAvailablePermissions(data.availablePermissions || []);
      setPermissionDraft(data.role?.permissions || []);
    } catch (error) {
      showMessage('error', error.message);
      setRoleDetail(null);
      setPermissionDraft([]);
    }

    setLoadingRole(false);
  };

  useEffect(() => {
    loadGuilds();
  }, []);

  useEffect(() => {
    if (guildId) {
      loadRoles(guildId);
    }
  }, [guildId]);

  useEffect(() => {
    if (selectedRoleId) {
      loadRoleDetail(selectedRoleId);
    }
  }, [selectedRoleId]);

  const togglePermission = (permissionName) => {
    setPermissionDraft((prev) => (
      prev.includes(permissionName)
        ? prev.filter((name) => name !== permissionName)
        : [...prev, permissionName]
    ));
  };

  const savePermissions = async () => {
    if (!guildId || !selectedRoleId) return;

    try {
      const response = await fetch('/api/perms/role/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guildId,
          roleId: selectedRoleId,
          permissions: permissionDraft
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update permissions');
      }

      showMessage('success', data.message || 'Role permissions updated');
      loadRoles(guildId);
      loadRoleDetail(selectedRoleId);
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const addMember = async () => {
    if (!guildId || !selectedRoleId || !memberIdInput.trim()) return;

    try {
      const response = await fetch('/api/perms/role/add-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId, roleId: selectedRoleId, userId: memberIdInput.trim() })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to add member');
      }

      showMessage('success', data.message || 'Member added');
      setMemberIdInput('');
      loadRoles(guildId);
      loadRoleDetail(selectedRoleId);
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const removeMember = async (userId) => {
    if (!guildId || !selectedRoleId || !userId) return;

    try {
      const response = await fetch('/api/perms/role/remove-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId, roleId: selectedRoleId, userId })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to remove member');
      }

      showMessage('success', data.message || 'Member removed');
      loadRoles(guildId);
      loadRoleDetail(selectedRoleId);
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  return (
    <>
      <div className="animated-bg"></div>
      <div className="container" style={{ padding: '34px 20px', maxWidth: '1300px' }}>
        <div className="fade-in" style={{ marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.4rem' }}>Perms Granter</h1>
          <p style={{ opacity: 0.72 }}>
            Manage role permissions, role members, and highlight dangerous permission roles.
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
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
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
                        style={{
                          textAlign: 'left',
                          border: guild.id === guildId
                            ? '1px solid rgba(255,255,255,0.55)'
                            : '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '8px',
                          background: guild.id === guildId
                            ? 'rgba(255,255,255,0.14)'
                            : 'rgba(255,255,255,0.04)',
                          color: '#fff',
                          padding: '8px 10px',
                          cursor: 'pointer'
                        }}
                      >
                        {guild.name} ({guild.memberCount})
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            <button className="btn" type="button" onClick={loadGuilds}>
              Refresh Guilds
            </button>
          </div>
          {loadingGuilds ? <p style={{ marginTop: '0.8rem', opacity: 0.65 }}>Loading guilds...</p> : null}
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'minmax(260px, 330px) 1fr', gap: '1rem' }}>
          <div className="card" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '0.6rem' }}>Roles ({roles.length})</h2>
            <p style={{ opacity: 0.7, marginBottom: '0.7rem' }}>
              Dangerous roles: <strong>{dangerousRoles.length}</strong>
            </p>

            {loadingRoles ? <div style={{ opacity: 0.68 }}>Loading roles...</div> : null}

            <div style={{ display: 'grid', gap: '0.55rem' }}>
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRoleId(role.id)}
                  style={{
                    textAlign: 'left',
                    width: '100%',
                    borderRadius: '10px',
                    border: selectedRoleId === role.id
                      ? '1px solid rgba(255,255,255,0.5)'
                      : '1px solid rgba(255,255,255,0.15)',
                    background: selectedRoleId === role.id
                      ? 'rgba(255,255,255,0.15)'
                      : 'rgba(255,255,255,0.04)',
                    color: '#fff',
                    padding: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                    <strong>{role.name}</strong>
                    <span style={{ opacity: 0.75 }}>{role.memberCount}</span>
                  </div>
                  {role.hasDangerousPermissions ? (
                    <div style={{ marginTop: '4px', opacity: 0.8, fontSize: '0.8rem' }}>⚠ dangerous perms</div>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {loadingRole ? <div style={{ opacity: 0.68 }}>Loading role details...</div> : null}

            {!loadingRole && !roleDetail ? (
              <div style={{ opacity: 0.68 }}>Pick a role to manage permissions and members.</div>
            ) : null}

            {!loadingRole && roleDetail ? (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.35rem', marginBottom: '0.3rem' }}>{roleDetail.name}</h2>
                  <p style={{ opacity: 0.74, marginBottom: '0.2rem' }}>Members: {roleDetail.memberCount}</p>
                  <p style={{ opacity: 0.74 }}>
                    Editable: {roleDetail.editable ? 'Yes' : 'No'} · Managed: {roleDetail.managed ? 'Yes' : 'No'}
                  </p>
                  {roleDetail.hasDangerousPermissions ? (
                    <p style={{ marginTop: '0.35rem', opacity: 0.85 }}>
                      ⚠ Dangerous permissions: {roleDetail.dangerousPermissions.join(', ')}
                    </p>
                  ) : null}
                </div>

                <h3 style={{ fontSize: '1.05rem', marginBottom: '0.55rem' }}>Permissions</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '0.5rem',
                  marginBottom: '0.8rem'
                }}>
                  {availablePermissions.map((permissionName) => {
                    const checked = permissionDraft.includes(permissionName);
                    const dangerous = roleDetail.dangerousPermissions.includes(permissionName);

                    return (
                      <button
                        key={permissionName}
                        type="button"
                        onClick={() => togglePermission(permissionName)}
                        disabled={!roleDetail.editable || roleDetail.managed}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                          border: checked ? '1px solid rgba(255,255,255,0.55)' : '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          background: checked ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.03)',
                          color: '#fff',
                          cursor: !roleDetail.editable || roleDetail.managed ? 'not-allowed' : 'pointer',
                          opacity: !roleDetail.editable || roleDetail.managed ? 0.55 : 1
                        }}
                      >
                        <span style={{ fontSize: '0.86rem' }}>
                          {permissionName}
                          {dangerous ? ' ⚠' : ''}
                        </span>
                        <span style={{ fontSize: '0.78rem', opacity: 0.9 }}>{checked ? 'ON' : 'OFF'}</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={savePermissions}
                  disabled={!roleDetail.editable || roleDetail.managed}
                >
                  Save Permissions
                </button>

                <div style={{ marginTop: '1.4rem' }}>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '0.55rem' }}>Role Members</h3>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="User ID"
                      value={memberIdInput}
                      onChange={(event) => setMemberIdInput(event.target.value)}
                      style={{
                        minWidth: '220px',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#fff'
                      }}
                    />
                    <button
                      type="button"
                      className="btn"
                      onClick={addMember}
                      disabled={!roleDetail.editable || roleDetail.managed}
                    >
                      Add Member
                    </button>
                  </div>

                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {roleDetail.members.map((member) => (
                      <div
                        key={member.id}
                        style={{
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: '8px',
                          padding: '9px 10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img 
                            src={member.avatar} 
                            alt={member.username}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              border: '1px solid rgba(255,255,255,0.2)'
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 600 }}>{member.tag}</div>
                            <div style={{ opacity: 0.65, fontSize: '0.8rem' }}>
                              {member.displayName} · {member.id}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn"
                          onClick={() => removeMember(member.id)}
                          disabled={!roleDetail.editable || roleDetail.managed}
                          style={{ padding: '7px 12px' }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    {roleDetail.members.length === 0 ? (
                      <div style={{ opacity: 0.65 }}>No members in this role.</div>
                    ) : null}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

export default PermsGranter;
