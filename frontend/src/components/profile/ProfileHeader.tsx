import type { UserProfile, UserStatus } from '../../types';

const STATUS_MAP: Record<UserStatus, { label: string; color: string }> = {
  online:  { label: 'Online',  color: '#10b981' },
  busy:    { label: 'Busy',    color: '#ef4444' },
  away:    { label: 'Away',    color: '#f59e0b' },
  offline: { label: 'Offline', color: '#6b7280' },
};

interface Props {
  profile: UserProfile;
  messageCount: number;
  roomCount: number;
}

export default function ProfileHeader({ profile, messageCount, roomCount }: Props) {
  const status = STATUS_MAP[profile.status] ?? STATUS_MAP.offline;

  const joined = new Date(profile.createdAt).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  });

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(17,17,24,0) 80%)',
      borderBottom: '1px solid var(--border)',
      padding: '28px 28px 24px',
    }}>
      {/* Status badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{
          width: 10, height: 10, borderRadius: '50%',
          background: status.color,
          boxShadow: `0 0 8px ${status.color}88`,
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 13, color: status.color, fontWeight: 600 }}>{status.label}</span>
      </div>

      {/* Username + bio */}
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
        {profile.username}
      </h1>
      <p style={{
        fontSize: 14, color: 'var(--text-secondary)',
        minHeight: 20, marginBottom: 16,
        fontStyle: profile.bio ? 'normal' : 'italic',
      }}>
        {profile.bio || 'No bio yet — add one below!'}
      </p>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 24 }}>
        {[
          { label: 'Messages', value: messageCount },
          { label: 'Rooms',    value: roomCount },
          { label: 'Joined',   value: joined },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-light)' }}>
              {s.value}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
