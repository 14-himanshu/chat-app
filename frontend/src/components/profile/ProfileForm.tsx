import { useEffect, useState } from 'react';
import type { UserProfile, UserStatus } from '../../types';
import { updateProfile } from '../../lib/api';

interface Props {
  profile: UserProfile;
  onUpdate: (p: UserProfile) => void;
  onToast: (msg: string, type: 'success' | 'error') => void;
}

const STATUSES: { value: UserStatus; label: string; color: string }[] = [
  { value: 'online',  label: 'Online',  color: '#10b981' },
  { value: 'busy',    label: 'Busy',    color: '#ef4444' },
  { value: 'away',    label: 'Away',    color: '#f59e0b' },
  { value: 'offline', label: 'Offline', color: '#6b7280' },
];

export default function ProfileForm({ profile, onUpdate, onToast }: Props) {
  const [username, setUsername] = useState(profile.username);
  const [bio,      setBio]      = useState(profile.bio ?? '');
  const [status,   setStatus]   = useState<UserStatus>(profile.status);
  const [saving,   setSaving]   = useState(false);
  const [dirty,    setDirty]    = useState(false);

  // Track changes
  useEffect(() => {
    setDirty(
      username !== profile.username ||
      bio !== (profile.bio ?? '') ||
      status !== profile.status
    );
  }, [username, bio, status, profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dirty || saving) return;
    setSaving(true);
    try {
      const updated = await updateProfile({ username, bio, status });
      onUpdate(updated);
      onToast('Profile updated!', 'success');
      // Sync localStorage username if changed
      if (updated.username !== profile.username) {
        localStorage.setItem('chat_username', updated.username);
      }
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Update failed.', 'error');
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.18s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    marginBottom: 6,
    display: 'block',
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
        Edit Profile
      </h2>

      {/* Username */}
      <div>
        <label style={labelStyle}>Username</label>
        <input
          style={inputStyle}
          value={username}
          onChange={e => setUsername(e.target.value)}
          maxLength={30}
          minLength={3}
          placeholder="Your username"
          onFocus={e => (e.target.style.borderColor = 'var(--border-focus)')}
          onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
        />
      </div>

      {/* Bio */}
      <div>
        <label style={labelStyle}>Bio <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({bio.length}/150)</span></label>
        <textarea
          style={{ ...inputStyle, resize: 'vertical', minHeight: 72, fontFamily: 'inherit' }}
          value={bio}
          onChange={e => setBio(e.target.value)}
          maxLength={150}
          placeholder="Tell people about yourself…"
          onFocus={e => (e.target.style.borderColor = 'var(--border-focus)')}
          onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
        />
      </div>

      {/* Status */}
      <div>
        <label style={labelStyle}>Status</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {STATUSES.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStatus(s.value)}
              style={{
                padding: '7px 14px',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${status === s.value ? s.color : 'var(--border)'}`,
                background: status === s.value ? `${s.color}22` : 'var(--bg-elevated)',
                color: status === s.value ? s.color : 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: status === s.value ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: s.color }} />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Save button */}
      <button
        type="submit"
        disabled={!dirty || saving}
        style={{
          padding: '11px 0',
          borderRadius: 'var(--radius-sm)',
          border: 'none',
          background: dirty ? 'var(--accent)' : 'var(--bg-elevated)',
          color: dirty ? '#fff' : 'var(--text-muted)',
          fontSize: 14,
          fontWeight: 600,
          cursor: dirty && !saving ? 'pointer' : 'not-allowed',
          transition: 'all 0.18s',
          boxShadow: dirty ? 'var(--shadow-accent)' : 'none',
        }}
      >
        {saving ? 'Saving…' : dirty ? 'Save Changes' : 'No Changes'}
      </button>
    </form>
  );
}
