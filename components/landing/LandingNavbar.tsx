'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

interface LandingNavbarProps {
  onOpenLogin: () => void;
  onOpenSignup: () => void;
}

export default function LandingNavbar({ onOpenLogin, onOpenSignup }: LandingNavbarProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('Admin');
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
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px 40px',
      background: 'transparent',
      position: 'absolute',
      top: 0, left: 0, right: 0,
      zIndex: 50,
      maxWidth: '1440px',
      margin: '0 auto'
    }}>
      {/* Left Links */}
      <div style={{ display: 'flex', gap: '32px', flex: 1 }}>
        <Link href="#product" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none' }}>Product</Link>
        <Link href="#about" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none' }}>About Us</Link>
        <Link href="#clients" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none' }}>Clients</Link>
        <Link href="#faqs" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none' }}>FAQs</Link>
      </div>

      {/* Center Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <Image src="/logo.png" alt="Sunfra Farms" width={42} height={42} style={{ width: 'auto', height: 'auto' }} />
        <span style={{ fontSize: '20px', fontWeight: 800, color: '#2E5C1A' }}>Sunfra Farms</span>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '24px', flex: 1 }}>
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
    </nav>
  );
}
