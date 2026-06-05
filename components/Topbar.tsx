'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut, Settings } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/admin/godown': 'Egg Godown',
  '/admin/dashboard': 'Dashboard',
  '/admin/godown/production': 'Production',
  '/admin/godown/sales': 'Sales',
};

export default function Topbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState('Admin');
  const subtitle = PAGE_TITLES[pathname] ?? 'Overview';

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const fullName = `${data.user.first_name || ''} ${data.user.last_name || ''}`.trim();
          if (fullName) setUserName(fullName);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUser();
    window.addEventListener('profileUpdated', fetchUser);
    return () => window.removeEventListener('profileUpdated', fetchUser);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  return (
    <header style={{
      height: '64px',
      background: 'var(--white)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      {/* Left: Brand logo + name */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '2px', textDecoration: 'none' }}>
        <Image
          src="/logo.png"
          alt="Sufra Farms"
          width={60}
          height={60}
          style={{ objectFit: 'contain', height: 'auto' }}
        />
        <div>
          <p style={{
            fontSize: '16px',
            fontWeight: 800,
            color: '#2E5C1A',
            letterSpacing: '-0.01em',
            lineHeight: 1.1,
          }}>
            Sufra Farms
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
            {subtitle}
          </p>
        </div>
      </Link>

      {/* Right: User avatar with dropdown + Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

        {/* Avatar with hover dropdown */}
        <div
          className={`topbar-user-wrap ${dropdownOpen ? 'clicked-open' : ''}`}
        >
          {/* Trigger area */}
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="topbar-user-trigger"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '4px 6px',
              borderRadius: '12px',
              transition: 'background 0.15s',
            }}
          >
            {/* User profile image */}
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
              border: '2px solid var(--border)',
            }}>
              <Image
                src="/user_profile.png"
                alt="Admin"
                width={36}
                height={36}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </div>
            <div style={{ lineHeight: 1.3 }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{userName}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Farm Manager</p>
            </div>
            {/* Chevron */}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>

          {/* Dropdown — shows on hover via CSS */}
          <div className="topbar-dropdown" style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '180px',
            background: 'var(--white)',
            borderRadius: '14px',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 32px rgba(19,23,31,0.10)',
            padding: '6px',
            zIndex: 100,
            opacity: 0,
            pointerEvents: 'none',
            transform: 'translateY(-6px)',
            transition: 'opacity 0.18s, transform 0.18s',
          }}>
            <Link
              href="/admin/dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                textDecoration: 'none',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--grey-bg)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              Dashboard
            </Link>
            <Link
              href="/admin/settings"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                textDecoration: 'none',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--grey-bg)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Settings size={15} strokeWidth={2} />
              Settings
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

        {/* Logout button */}
        <button
          onClick={handleLogout}
          title="Logout"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            transition: 'background 0.15s, color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = '#FFF0F0';
            (e.currentTarget as HTMLElement).style.color = '#EF4444';
            (e.currentTarget as HTMLElement).style.borderColor = '#FFB0B0';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
          }}
        >
          <LogOut size={15} strokeWidth={2} />
          Logout
        </button>
      </div>

      {/* Dropdown hover CSS — triggered on the parent wrapper */}
      <style>{`
        .topbar-user-wrap { position: relative; }
        .topbar-user-wrap:hover .topbar-user-trigger, .topbar-user-wrap.clicked-open .topbar-user-trigger { background: var(--grey-bg); }
        .topbar-user-wrap:hover .topbar-dropdown, .topbar-user-wrap.clicked-open .topbar-dropdown {
          opacity: 1 !important;
          pointer-events: auto !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </header>
  );
}
