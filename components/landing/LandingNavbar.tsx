'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';

interface LandingNavbarProps {
  onOpenLogin: () => void;
  onOpenSignup: () => void;
}

export default function LandingNavbar({ onOpenLogin, onOpenSignup }: LandingNavbarProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('Admin');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setIsAuthenticated(true);
            const fullName = `${data.user.first_name || ''} ${data.user.last_name || ''}`.trim();
            if (fullName) setUserName(fullName);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Failed to check auth status', err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      router.refresh();
      setIsSidebarOpen(false);
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  const navLinks = [
    { label: 'Product', href: '#product' },
    { label: 'About Us', href: '#about' },
    { label: 'Clients', href: '#clients' },
    { label: 'FAQs', href: '#faqs' }
  ];

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  return (
    <>
      <style>{`
        .desktop-nav-links { display: flex; gap: 32px; flex: 1; }
        .desktop-nav-controls { display: flex; align-items: center; justify-content: flex-end; gap: 24px; flex: 1; }
        .mobile-menu-btn { display: none; }
        .landing-nav-container { padding: 24px 40px; }
        
        @media (max-width: 900px) {
          .desktop-nav-links { display: none !important; }
          .desktop-nav-controls { display: none !important; }
          .mobile-menu-btn { 
            display: flex !important; 
            align-items: center; 
            justify-content: flex-end; 
            background: transparent;
            border: none;
            color: var(--text-primary);
            cursor: pointer;
            padding: 8px;
            margin-right: -8px;
          }
          .landing-nav-container { padding: 16px 20px !important; }
        }
      `}</style>

      <nav className="landing-nav-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'transparent',
        position: 'absolute',
        top: 0, left: 0, right: 0,
        zIndex: 50,
        maxWidth: '1440px',
        margin: '0 auto'
      }}>
        {/* Left Links */}
        <div className="desktop-nav-links">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none' }}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Center Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <Image src="/logo.png" alt="Sunfra Farms" width={42} height={42} style={{ width: 'auto', height: 'auto' }} priority />
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#2E5C1A' }}>Sunfra Farms</span>
        </div>

        {/* Right Controls */}
        <div className="desktop-nav-controls">
          {!isLoading && (
            isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border)' }}>
                    <Image src="/user_profile.png" alt="Admin" width={36} height={36} style={{ objectFit: 'cover' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>{userName}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Farm Manager</span>
                  </div>
                </div>
                <Link href="/admin/dashboard" style={{
                  fontSize: '13px', fontWeight: 600, color: '#fff', background: '#2E5C1A',
                  padding: '8px 16px', borderRadius: '10px', textDecoration: 'none', transition: 'opacity 0.2s'
                }} onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                  Admin Panel
                </Link>
                <button onClick={handleLogout} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '36px', height: '36px', borderRadius: '10px', border: '1px solid var(--border)',
                  background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s'
                }} title="Logout" onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = '#FFF0F0';
                  (e.currentTarget as HTMLElement).style.color = '#EF4444';
                  (e.currentTarget as HTMLElement).style.borderColor = '#FFB0B0';
                }} onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                }}>
                  <LogOut size={16} strokeWidth={2} />
                </button>
              </div>
            ) : (
              <>
                <button onClick={onOpenLogin} style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                  Login
                </button>
                <button onClick={onOpenSignup} style={{
                  fontSize: '14px', fontWeight: 600, color: '#fff', background: '#111',
                  padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer'
                }}>
                  Sign Up
                </button>
              </>
            )
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
          <Menu size={28} />
        </button>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <div 
        onClick={() => setIsSidebarOpen(false)}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99,
          opacity: isSidebarOpen ? 1 : 0, 
          visibility: isSidebarOpen ? 'visible' : 'hidden',
          transition: 'opacity 0.3s ease, visibility 0.3s ease'
        }} 
      />

      {/* Mobile Sidebar */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '280px',
        background: '#fff', zIndex: 100,
        transform: isSidebarOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '-8px 0 30px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column', padding: '24px'
      }}>
        {/* Sidebar Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Image src="/logo.png" alt="Sunfra Farms" width={32} height={32} style={{ width: 'auto', height: 'auto' }} />
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#2E5C1A' }}>Sunfra</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} style={{
            background: '#f3f4f6', border: 'none', cursor: 'pointer', padding: '6px', 
            borderRadius: '50%', color: 'var(--text-secondary)', display: 'flex'
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setIsSidebarOpen(false)} style={{
              fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none',
              padding: '8px 0', borderBottom: '1px solid #f3f4f6'
            }}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Sidebar Auth / Admin */}
        <div style={{ paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLoading && (
            isAuthenticated ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', padding: '12px', background: '#f9fafb', borderRadius: '12px' }}>
                  <Image src="/user_profile.png" alt="Admin" width={40} height={40} style={{ borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{userName}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Farm Manager</span>
                  </div>
                </div>
                <Link href="/admin/dashboard" onClick={() => setIsSidebarOpen(false)} style={{
                  fontSize: '15px', fontWeight: 600, color: '#fff', background: '#2E5C1A',
                  padding: '14px', borderRadius: '12px', textDecoration: 'none', textAlign: 'center'
                }}>
                  Admin Panel
                </Link>
                <button onClick={handleLogout} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #fca5a5',
                  background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontWeight: 600, fontSize: '15px'
                }}>
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { onOpenLogin(); setIsSidebarOpen(false); }} style={{
                  fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)',
                  padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer'
                }}>
                  Login
                </button>
                <button onClick={() => { onOpenSignup(); setIsSidebarOpen(false); }} style={{
                  fontSize: '15px', fontWeight: 600, color: '#fff', background: '#111',
                  padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer'
                }}>
                  Sign Up
                </button>
              </>
            )
          )}
        </div>
      </div>
    </>
  );
}
