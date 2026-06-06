'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, X } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

export default function LoginModal({ isOpen, onClose, onSwitchToSignup }: LoginModalProps) {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen) return null;

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
        toast.success('Logged in successfully!');
        router.push('/admin/godown');
        router.refresh();
      } else {
        const data = await res.json();
        const msg = data.error || 'Login failed';
        setErrorMsg(msg);
        toast.error(msg);
      }
    } catch {
      const msg = 'Something went wrong. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
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

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
      padding: '24px',
    }}>
      {/* Floating Card Container */}
      <div className="animate-fadeup" style={{
        width: '100%',
        maxWidth: '900px',
        background: '#FFFFFF',
        borderRadius: '32px',
        display: 'flex',
        padding: '14px',
        gap: '14px',
        boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
        position: 'relative',
        maxHeight: '90vh',
      }}>

        {/* Floating close button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '24px', right: '24px', zIndex: 10,
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-primary)', border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'transform 0.2s',
        }} onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')} onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
          <X size={18} />
        </button>

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
              <Image src="/logo.png" alt="Logo" width={40} height={40} style={{ objectFit: 'contain', width: 'auto', height: 'auto' }} />
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#2E5C1A' }}>Sunfra Farms</span>
            </div>
          </div>

          <div style={{ maxWidth: '420px', margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Welcome back
              </h2>
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

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '32px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>No account? <button onClick={onSwitchToSignup} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'underline' }}>Sign up</button></span>
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
            sizes="40vw"
            style={{ objectFit: 'cover' }}
            priority
          />
          {/* Subtle gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(0,0,0,0.1), transparent)',
          }} />
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
