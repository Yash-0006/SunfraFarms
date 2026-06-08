'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Warehouse, LogOut, LayoutDashboard, Settings, ChevronDown, ChevronRight, Users, Sparkles } from 'lucide-react';
import { useUserStore } from '@/lib/store';

const NAV = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { 
    href: '/admin/godown', 
    icon: Warehouse, 
    label: 'Egg Godown',
    subItems: [
      { href: '/admin/godown/production', label: 'Production' },
      { href: '/admin/godown/sales', label: 'Sales' }
    ]
  },
  { 
    href: '/admin/labour', 
    icon: Users, 
    label: 'Labour',
    subItems: [
      { href: '/admin/labour/registration', label: 'Registration' },
      { href: '/admin/labour/attendance', label: 'Attendance' }
    ]
  },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
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
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { isAiVisible, toggleAiVisibility } = useUserStore();

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setOpen(false);
    }
    if (pathname.startsWith('/admin/godown')) {
      setExpanded(prev => ({ ...prev, '/admin/godown': true }));
    }
    if (pathname.startsWith('/admin/labour')) {
      setExpanded(prev => ({ ...prev, '/admin/labour': true }));
    }
  }, [pathname]);

  const isActive = (href: string, exact = false) => exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/?login=true');
      router.refresh();
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  const handleToggle = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!open) {
      setOpen(true);
      setExpanded(prev => ({ ...prev, [href]: true }));
    } else {
      setExpanded(prev => ({ ...prev, [href]: !prev[href] }));
    }
  };

  return (
    <>
      <style>{`
        .sidebar-wrapper {
          flex-shrink: 0;
          height: 100svh;
          transition: width 0.25s cubic-bezier(0.4,0,0.2,1);
          position: sticky;
          top: 0;
          z-index: 40;
        }
        .sidebar-inner {
          height: 100svh;
          background: var(--white);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          position: absolute;
          top: 0;
          left: 0;
          transition: width 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s;
          overflow: hidden;
        }
        .mobile-overlay { display: none; }

        /* Desktop */
        @media (min-width: 769px) {
          .sidebar-wrapper {
            width: ${open ? '200px' : '64px'};
          }
          .sidebar-inner {
            width: ${open ? '200px' : '64px'};
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .sidebar-wrapper {
            width: 64px;
          }
          .sidebar-inner {
            width: ${open ? '200px' : '64px'};
            box-shadow: ${open ? '4px 0 24px rgba(0,0,0,0.1)' : 'none'};
          }
          .mobile-overlay {
            display: ${open ? 'block' : 'none'};
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.2);
            z-index: -1;
          }
        }
      `}</style>
      <div className="sidebar-wrapper">
        <div className="mobile-overlay" onClick={() => setOpen(false)} />
        <aside className="sidebar-inner">

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
        {NAV.map(({ href, icon: Icon, label, subItems }) => {
          const activeExact = pathname === href;
          const activePrefix = isActive(href);
          const isHighlighted = subItems ? activePrefix : activeExact;

          return (
            <div key={href} style={{ width: '100%' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                margin: '0 10px',
                position: 'relative'
              }}>
                <Link
                  href={href}
                  title={!open ? label : undefined}
                  style={{
                    display: 'flex',
                    flex: 1,
                    alignItems: 'center',
                    gap: open ? '10px' : '0px',
                    padding: open ? '0 10px' : '0',
                    paddingRight: subItems && open ? '36px' : (open ? '10px' : '0'), // space for toggle
                    height: '40px',
                    borderRadius: '12px',
                    background: open && isHighlighted ? 'var(--primary)' : 'transparent',
                    color: open && isHighlighted ? '#fff' : (isHighlighted ? 'var(--primary)' : 'var(--text-muted)'),
                    transition: 'background 0.15s, color 0.15s',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    justifyContent: open ? 'flex-start' : 'center',
                  }}
                  onMouseEnter={e => {
                    if (!isHighlighted) {
                      (e.currentTarget as HTMLElement).style.background = 'var(--grey-bg)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isHighlighted) {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                    }
                  }}
                >
                  <span style={{
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    background: !open && isHighlighted ? 'var(--primary)' : 'transparent',
                    color: !open && isHighlighted ? '#fff' : 'inherit',
                    transition: 'background 0.15s',
                  }}>
                    <Icon size={20} strokeWidth={isHighlighted ? 2.2 : 1.8} />
                  </span>
                  
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    flex: 1,
                    opacity: open ? 1 : 0,
                    maxWidth: open ? '120px' : '0px',
                    overflow: 'hidden',
                    transition: 'opacity 0.2s, max-width 0.25s cubic-bezier(0.4,0,0.2,1)',
                  }}>
                    {label}
                  </span>
                </Link>

                {subItems && open && (
                  <button
                    onClick={(e) => handleToggle(href, e)}
                    style={{
                      position: 'absolute',
                      right: 4,
                      background: 'transparent',
                      border: 'none',
                      color: isHighlighted ? '#fff' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 6,
                      borderRadius: 8,
                      zIndex: 2,
                    }}
                    onMouseEnter={e => {
                       (e.currentTarget as HTMLElement).style.background = isHighlighted ? 'rgba(255,255,255,0.2)' : 'var(--border)';
                    }}
                    onMouseLeave={e => {
                       (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    {expanded[href] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                )}
              </div>

              {/* Sub items */}
              {subItems && expanded[href] && open && (
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: 4, gap: 2 }}>
                  {subItems.map(sub => {
                    const subActive = pathname === sub.href;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          height: '32px',
                          margin: '0 10px 0 46px', // indent to align with text
                          padding: '0 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: subActive ? 'var(--primary)' : 'var(--text-muted)',
                          background: subActive ? 'var(--grey-bg)' : 'transparent',
                          textDecoration: 'none',
                          transition: 'background 0.15s, color 0.15s',
                        }}
                        onMouseEnter={e => {
                          if (!subActive) {
                            (e.currentTarget as HTMLElement).style.background = 'var(--grey-bg)';
                            (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!subActive) {
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                            (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                          }
                        }}
                      >
                        <ChevronRight size={14} style={{ marginRight: '6px', opacity: subActive ? 1 : 0.6 }} />
                        {sub.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout & AI Toggle */}
      <div style={{ padding: '12px 0 20px', width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={() => toggleAiVisibility()}
          title="Toggle AI Chat"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: open ? '10px' : '0px',
            margin: '0 10px',
            padding: '10px 12px',
            width: 'calc(100% - 20px)',
            borderRadius: '8px',
            background: '#111',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.15s',
            whiteSpace: 'nowrap',
            justifyContent: open ? 'space-between' : 'center',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.opacity = '0.85';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.opacity = '1';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: open ? '10px' : '0px' }}>
            <Sparkles size={18} strokeWidth={2} style={{ flexShrink: 0 }} color={isAiVisible ? '#C8F096' : '#fff'} />
            <span style={{
              fontSize: '13px',
              fontWeight: 600,
              opacity: open ? 1 : 0,
              maxWidth: open ? '120px' : '0px',
              overflow: 'hidden',
              transition: 'opacity 0.2s, max-width 0.25s cubic-bezier(0.4,0,0.2,1)',
            }}>
              Ask AI
            </span>
          </div>
          {open && (
            <div style={{
              width: 32, height: 18, borderRadius: 12,
              background: isAiVisible ? '#C8F096' : '#333',
              position: 'relative', transition: 'background 0.2s',
            }}>
              <div style={{
                width: 14, height: 14, borderRadius: '50%', 
                background: isAiVisible ? '#111' : '#888',
                position: 'absolute', top: 2, left: isAiVisible ? 16 : 2,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', 
                boxShadow: isAiVisible ? 'none' : '0 1px 2px rgba(0,0,0,0.2)'
              }} />
            </div>
          )}
        </button>
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
      </div>
    </>
  );
}
