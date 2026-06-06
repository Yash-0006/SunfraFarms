'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

/* ─── Password rules ────────────────────────────────────── */
const RULES = [
  { key: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { key: 'upper', label: 'One uppercase letter (A–Z)', test: (p: string) => /[A-Z]/.test(p) },
  { key: 'lower', label: 'One lowercase letter (a–z)', test: (p: string) => /[a-z]/.test(p) },
  { key: 'number', label: 'One number (0–9)', test: (p: string) => /[0-9]/.test(p) },
  { key: 'symbol', label: 'One symbol (!@#$%^&*…)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function FieldError({ msg }: { msg: string }) {
  return msg ? (
    <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '6px', display: 'flex', alignItems: 'center', gap: 4 }}>
      <X size={11} strokeWidth={3} /> {msg}
    </p>
  ) : null;
}

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function SignupModal({ isOpen, onClose, onSwitchToLogin }: SignupModalProps) {
  const router = useRouter();
  const toast = useToast();

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', mobile: '', email: '', password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);


  /* ─── Live validation ─────────────────────────────────── */
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!formData.firstName.trim()) e.firstName = 'First name is required.';
    if (!formData.lastName.trim()) e.lastName = 'Last name is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = 'Enter a valid email address.';
    if (!/^\d{10}$/.test(formData.mobile))
      e.mobile = 'Mobile must be exactly 10 digits.';
    return e;
  }, [formData]);

  const passwordRules = RULES.map(r => ({ ...r, ok: r.test(formData.password) }));
  const allRulesOk = passwordRules.every(r => r.ok);
  const formValid = Object.keys(errors).length === 0 && allRulesOk && formData.password.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleBlur = (name: string) =>
    setTouched(prev => ({ ...prev, [name]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ firstName: true, lastName: true, email: true, mobile: true, password: true });
    if (!formValid) return;

    setIsLoading(true);
    setServerError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success('Account created successfully! Please sign in.');
        onSwitchToLogin();
      } else {
        const d = await res.json();
        const errorMsg = d.error || 'Signup failed. Please try again.';
        setServerError(errorMsg);
        toast.error(errorMsg);
      }
    } catch {
      setServerError('Something went wrong. Please try again.');
      toast.error('Something went wrong. Please try again.');
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

  if (!isOpen) return null;

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
            <div style={{ marginBottom: '28px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Create an account
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
                Sign up to manage your farm's production and sales
              </p>
            </div>

            {serverError && (
              <div style={{ padding: '12px 14px', marginBottom: '16px', background: '#FFF0F0', borderRadius: '12px', fontSize: '12px', color: '#8B2E2E', fontWeight: 500, display: 'flex', gap: 8, alignItems: 'center' }}>
                <X size={14} color="#EF4444" strokeWidth={2.5} /> {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', paddingLeft: '4px' }}>
                    First Name
                  </label>
                  <input
                    type="text" name="firstName" value={formData.firstName}
                    onChange={handleChange} onBlur={() => handleBlur('firstName')}
                    placeholder="Amélie"
                    style={{ ...inputStyle, borderColor: touched.firstName && errors.firstName ? '#EF4444' : 'transparent' }}
                  />
                  {touched.firstName && <FieldError msg={errors.firstName || ''} />}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', paddingLeft: '4px' }}>
                    Last Name
                  </label>
                  <input
                    type="text" name="lastName" value={formData.lastName}
                    onChange={handleChange} onBlur={() => handleBlur('lastName')}
                    placeholder="Laurent"
                    style={{ ...inputStyle, borderColor: touched.lastName && errors.lastName ? '#EF4444' : 'transparent' }}
                  />
                  {touched.lastName && <FieldError msg={errors.lastName || ''} />}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', paddingLeft: '4px' }}>
                    Mobile Number
                  </label>
                  <input
                    type="tel" name="mobile" value={formData.mobile}
                    onChange={handleChange} onBlur={() => handleBlur('mobile')}
                    placeholder="10-digit mobile" maxLength={10}
                    style={{ ...inputStyle, borderColor: touched.mobile && errors.mobile ? '#EF4444' : 'transparent' }}
                  />
                  {touched.mobile && <FieldError msg={errors.mobile || ''} />}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', paddingLeft: '4px' }}>
                    Email Address
                  </label>
                  <input
                    type="email" name="email" value={formData.email}
                    onChange={handleChange} onBlur={() => handleBlur('email')}
                    placeholder="amelielaurent@gmail.com"
                    style={{ ...inputStyle, borderColor: touched.email && errors.email ? '#EF4444' : 'transparent' }}
                  />
                  {touched.email && <FieldError msg={errors.email || ''} />}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', paddingLeft: '4px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                    onChange={handleChange} onBlur={() => handleBlur('password')}
                    placeholder="••••••••••••"
                    style={{ ...inputStyle, paddingRight: '48px', borderColor: touched.password && !formValid && formData.password.length > 0 ? '#EF4444' : 'transparent' }}
                  />
                  <button
                    type="button" onClick={() => setShowPassword(v => !v)}
                    style={{
                      position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {formData.password.length > 0 && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '4px' }}>
                    {passwordRules.map(rule => (
                      <div key={rule.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: rule.ok ? 'var(--primary)' : 'transparent',
                          border: `1px solid ${rule.ok ? 'var(--primary)' : '#D1D5DB'}`,
                          transition: 'all 0.2s',
                        }}>
                          {rule.ok && <Check size={8} color="#fff" strokeWidth={4} />}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 500, color: rule.ok ? 'var(--primary)' : 'var(--text-muted)' }}>
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%', padding: '15px', borderRadius: '16px', border: 'none',
                  background: '#111111',
                  color: '#fff', fontSize: '14px', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s', marginTop: '8px',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? 'Creating...' : 'Signup'}
              </button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '32px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>Have an account? <button onClick={onSwitchToLogin} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'underline' }}>Sign in</button></span>
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
          {/* Subtle gradient overlay to match the reference's soft look */}
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
