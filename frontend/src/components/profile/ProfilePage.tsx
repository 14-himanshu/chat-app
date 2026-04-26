import { useEffect, useState, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import type { UserProfile } from '../../types';
import { fetchProfile } from '../../lib/api';
import AvatarUpload from './AvatarUpload';
import ProfileHeader from './ProfileHeader';
import ProfileForm from './ProfileForm';
import SecuritySection from './SecuritySection';

interface Props {
  currentUser: string | null;
  token: string | null;
  joinedRooms: string[];
  messageCount: number;
  onClose: () => void;
  onLogout: () => void;
  onUsernameChange: (newUsername: string) => void;
}

interface Toast {
  id: number;
  msg: string;
  type: 'success' | 'error';
}

type TabType = 'profile' | 'settings' | 'security';

function Skeleton({ w, h, radius = 8 }: { w: string | number; h: number; radius?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-hover) 50%, var(--bg-elevated) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite linear',
    }} />
  );
}

export default function ProfilePage({
  joinedRooms,
  messageCount,
  onClose,
  onLogout,
  onUsernameChange,
}: Props) {
  const [profile,  setProfile]  = useState<UserProfile | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [toasts,   setToasts]   = useState<Toast[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  // Settings state
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);

  const addToast = useCallback((msg: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchProfile()
      .then(p => { setProfile(p); setLoading(false); })
      .catch(err => { setError(err instanceof Error ? err.message : 'Failed to load profile.'); setLoading(false); });
  }, []);

  function handleUpdate(updated: UserProfile) {
    setProfile(updated);
    if (updated.username !== profile?.username) {
      onUsernameChange(updated.username);
    }
  }

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '12px 0',
    background: 'transparent',
    border: 'none',
    borderBottom: `2px solid ${isActive ? 'var(--accent-light)' : 'transparent'}`,
    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
    fontSize: 13,
    fontWeight: isActive ? 600 : 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          animation: 'fadeIn 0.2s ease both',
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed',
        top: 0, right: 0, bottom: 0,
        width: 'min(420px, 100vw)',
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border)',
        zIndex: 101,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.28s cubic-bezier(0.4,0,0.2,1) both',
      }}>

        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-elevated)',
          flexShrink: 0,
        }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            My Profile
          </span>
          <button
            id="profile-close-btn"
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '1px solid var(--border)',
              background: 'var(--bg-input)',
              color: 'var(--text-secondary)',
              fontSize: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Skeleton w={96} h={96} radius={50} />
            </div>
            <Skeleton w="60%" h={22} />
            <Skeleton w="80%" h={16} />
            <Skeleton w="100%" h={48} radius={12} />
            <Skeleton w="100%" h={48} radius={12} />
            <Skeleton w="100%" h={100} radius={12} />
          </div>
        ) : error ? (
          <div style={{ padding: 24, color: 'var(--danger)', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <p style={{ marginBottom: 16 }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 20px', background: 'var(--accent)', border: 'none',
                borderRadius: 'var(--radius-sm)', color: '#fff', cursor: 'pointer',
              }}
            >Retry</button>
          </div>
        ) : profile ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {/* Header always visible at top to provide context */}
            <ProfileHeader
              profile={profile}
              messageCount={messageCount}
              roomCount={joinedRooms.length}
            />

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', flexShrink: 0 }}>
              <button style={tabStyle(activeTab === 'profile')} onClick={() => setActiveTab('profile')}>Profile</button>
              <button style={tabStyle(activeTab === 'settings')} onClick={() => setActiveTab('settings')}>Settings</button>
              <button style={tabStyle(activeTab === 'security')} onClick={() => setActiveTab('security')}>Security</button>
            </div>

            {/* Tab content area */}
            <div style={{ padding: '24px 20px', flex: 1 }}>
              {activeTab === 'profile' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                  <AvatarUpload profile={profile} onUpdate={handleUpdate} onToast={addToast} />
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
                  <ProfileForm profile={profile} onUpdate={handleUpdate} onToast={addToast} />
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Preferences</h2>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Dark Theme</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Toggle application appearance</div>
                    </div>
                    <button
                      onClick={toggleTheme}
                      style={{
                        width: 44, height: 24, borderRadius: 12, border: 'none',
                        background: theme === 'dark' ? 'var(--accent)' : 'var(--bg-input)',
                        position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: 2, left: theme === 'dark' ? 22 : 2,
                        width: 20, height: 20, borderRadius: '50%', background: '#fff',
                        transition: 'left 0.2s',
                      }} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Desktop Notifications</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Receive alerts for new messages</div>
                    </div>
                    <button
                      onClick={() => { setNotifications(!notifications); addToast('Notifications toggled (mocked).', 'success'); }}
                      style={{
                        width: 44, height: 24, borderRadius: 12, border: 'none',
                        background: notifications ? 'var(--accent)' : 'var(--bg-input)',
                        position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: 2, left: notifications ? 22 : 2,
                        width: 20, height: 20, borderRadius: '50%', background: '#fff',
                        transition: 'left 0.2s',
                      }} />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="animate-fade-in">
                  <SecuritySection onToast={addToast} onLogout={onLogout} />
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Toast stack */}
      <div style={{
        position: 'fixed', bottom: 24, right: 24,
        display: 'flex', flexDirection: 'column', gap: 10,
        zIndex: 200,
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            background: t.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            border: `1px solid ${t.type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
            color: t.type === 'success' ? '#10b981' : '#ef4444',
            fontSize: 13, fontWeight: 600,
            backdropFilter: 'blur(12px)',
            animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
            boxShadow: 'var(--shadow-md)',
            maxWidth: 280,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            {t.type === 'success' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            )}
            {t.msg}
          </div>
        ))}
      </div>
    </>
  );
}
