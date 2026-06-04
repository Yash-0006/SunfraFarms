'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, X } from 'lucide-react';

function FieldError({ msg }: { msg: string }) {
  return msg ? (
    <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '6px', display: 'flex', alignItems: 'center', gap: 4 }}>
      <X size={11} strokeWidth={3} /> {msg}
    </p>
  ) : null;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Login failed');
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 18px',
    borderRadius: '16px',
    border: '1px solid transparent',
    background: 'var(--bg)',
    fontSize: '13px',
    color: 'var(--text-primary)',
    outline: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
    transition: 'all 0.2s ease',
  };

  const formValid = email.trim().length > 0 && password.length > 0;

  return (
    <div style={{
      minHeight: '100svh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      fontFamily: 'var(--font-sans)',
      padding: '24px',
    }}>
      {/* Floating Card Container */}
      <div style={{
        width: '100%',
        maxWidth: '1080px',
        background: '#FFFFFF',
        borderRadius: '32px',
        display: 'flex',
        padding: '14px',
        gap: '14px',
        boxShadow: '0 30px 60px rgba(0,0,0,0.08)',
        position: 'relative',
        minHeight: '680px',
      }}>

        {/* Left: Form Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 32px',
          overflowY: 'auto',
        }}>
          {/* Top header area */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <Image src="/logo.png" alt="Logo" width={60} height={60} style={{ objectFit: 'contain' }} />
              <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>Sufra Farms</span>
            </div>
          </div>

          <div style={{ maxWidth: '420px', margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Welcome back
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
                Sign in and get back to managing your farm
              </p>
            </div>

            {errorMsg && (
              <div style={{ padding: '12px 14px', marginBottom: '20px', background: '#FFF0F0', borderRadius: '12px', fontSize: '12px', color: '#8B2E2E', fontWeight: 500, display: 'flex', gap: 8, alignItems: 'center' }}>
                <X size={14} color="#EF4444" strokeWidth={2.5} /> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', paddingLeft: '4px' }}>
                  Email Address
                </label>
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="amelielaurent@gmail.com"
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', paddingLeft: '4px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{ ...inputStyle, paddingRight: '48px' }}
                    required
                  />
                  <button
                    type="button" onClick={() => setShowPw(v => !v)}
                    style={{
                      position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0,
                    }}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#111111', width: 14, height: 14 }}
                  />
                  Remember me
                </label>
                <a href="#" style={{ color: 'var(--text-secondary)', fontWeight: 500, textDecoration: 'none' }}>
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%', padding: '15px', borderRadius: '16px', border: 'none',
                  background: '#111111',
                  color: '#fff', fontSize: '14px', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s', marginTop: '12px',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? 'Signing in…' : 'Login'}
              </button>
            </form>

            {/* Alternative sign in buttons styling similar to dribbble (optional decorative) */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button style={{ flex: 1, padding: '12px', borderRadius: '16px', border: '1px solid #E5E7EB', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.29-.88 3.56-.81 1.76.08 3.01.81 3.86 2.05-3.32 1.95-2.76 6.01.37 7.23-.74 1.76-1.58 3.23-2.87 3.7m-2.92-12.7c.69-1.04 1.19-2.31.96-3.58-1.25.1-2.61.85-3.37 1.83-.67.87-1.23 2.15-.96 3.42 1.34.1 2.62-.64 3.37-1.67" /></svg>
                Apple
              </button>
              <button style={{ flex: 1, padding: '12px', borderRadius: '16px', border: '1px solid #E5E7EB', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" /><path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z" /><path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z" /><path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0 7.565 0 3.515 2.7 1.545 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" /></svg>
                Google
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '32px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>No account? <Link href="/signup" style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'underline' }}>Sign up</Link></span>
            </div>
          </div>
        </div>

        {/* Right: Image Area */}
        <div style={{
          width: '45%',
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          display: 'none',
        }} className="desktop-image-panel">
          <Image
            src="/login-bg.png"
            alt="Farm landscape"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          {/* Subtle gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(0,0,0,0.1), transparent)',
          }} />

          {/* Floating close button */}
          <Link href="/" style={{
            position: 'absolute', top: '16px', right: '16px',
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-primary)', textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'transform 0.2s',
          }} onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')} onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
            <X size={18} />
          </Link>
        </div>
      </div>
      <style>{`
        @media (min-width: 900px) { .desktop-image-panel { display: block !important; } }
        /* Add focus ring for inputs */
        input:focus { border-color: #111111 !important; box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05) !important; }
      `}</style>
    </div>
  );
}
