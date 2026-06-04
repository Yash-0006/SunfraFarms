'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Warehouse, LogOut, LayoutDashboard, Settings } from 'lucide-react';

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/', icon: Warehouse, label: 'Egg Godown' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

/* Animated hamburger → X icon */
function HamburgerIcon({ open }: { open: boolean }) {
  const bar = (rotate: string, y: string, opacity = 1) => (
    <span style={{
      display: 'block',
      position: 'absolute',
      height: '2px',
      width: '20px',
      background: 'var(--text-primary)',
      borderRadius: '2px',
      left: '50%',
      top: '50%',
      marginLeft: '-10px',
      transform: `translateY(${y}) rotate(${rotate})`,
      opacity,
      transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.2s',
    }} />
  );

  return (
    <span style={{ position: 'relative', width: 20, height: 20, display: 'inline-block' }}>
      {open
        ? <>
          {bar('45deg', '-1px')}
          {bar('0deg', '0px', 0)}
          {bar('-45deg', '1px')}
        </>
        : <>
          {bar('0deg', '-6px')}
          {bar('0deg', '0px')}
          {bar('0deg', '6px')}
        </>
      }
    </span>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const isActive = (href: string) => pathname === href;

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
    <aside style={{
      width: open ? '200px' : '64px',
      height: '100svh',
      background: 'var(--white)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 40,
      transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
      overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{
        width: '100%',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: open ? 'space-between' : 'center',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        padding: open ? '0 14px 0 16px' : '0',
        transition: 'padding 0.25s',
      }}>
        {/* "Menu" label — left side, only when open */}
        {open && (
          <span style={{
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            Menu
          </span>
        )}

        {/* Hamburger toggle — always right (or centered when collapsed) */}
        <button
          onClick={() => setOpen(o => !o)}
          title={open ? 'Close menu' : 'Open menu'}
          style={{
            width: 36, height: 36, borderRadius: '10px',
            border: 'none', background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--grey-bg)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <HamburgerIcon open={open} />
        </button>
      </div>

      {/* Nav links */}
      <nav style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: open ? 'stretch' : 'center',
        padding: '16px 0',
        gap: '4px',
        width: '100%',
      }}>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              title={!open ? label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: open ? '10px' : '0px',
                margin: '0 10px',
                padding: open ? '0 10px' : '0',
                height: '40px',
                borderRadius: '12px',
                background: 'transparent',
                color: active ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'background 0.15s, color 0.15s',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                justifyContent: open ? 'flex-start' : 'center',
                ...(open && active ? { background: 'var(--primary)', color: '#fff' } : {}),
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--grey-bg)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                }
              }}
            >
              {/* Icon — always in a fixed 40×40 square so it stays symmetrical */}
              <span style={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: !open && active ? 'var(--primary)' : 'transparent',
                color: !open && active ? '#fff' : 'inherit',
                transition: 'background 0.15s',
              }}>
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              </span>
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                opacity: open ? 1 : 0,
                maxWidth: open ? '120px' : '0px',
                overflow: 'hidden',
                transition: 'opacity 0.2s, max-width 0.25s cubic-bezier(0.4,0,0.2,1)',
              }}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 0 20px', width: '100%' }}>
        <button
          onClick={handleLogout}
          title="Logout"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: open ? '10px' : '0px',
            margin: '0 10px',
            padding: '10px',
            width: 'calc(100% - 20px)',
            borderRadius: '12px',
            background: 'transparent',
            color: 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.15s, color 0.15s',
            whiteSpace: 'nowrap',
            justifyContent: open ? 'flex-start' : 'center',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = '#FFF0F0';
            (e.currentTarget as HTMLElement).style.color = '#EF4444';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
          }}
        >
          <LogOut size={20} strokeWidth={1.8} style={{ flexShrink: 0 }} />
          <span style={{
            fontSize: '13px',
            fontWeight: 600,
            opacity: open ? 1 : 0,
            maxWidth: open ? '120px' : '0px',
            overflow: 'hidden',
            transition: 'opacity 0.2s, max-width 0.25s cubic-bezier(0.4,0,0.2,1)',
          }}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
