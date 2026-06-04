'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Check, X, ArrowLeft } from 'lucide-react';

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

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', mobile: '', email: '', password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        router.push('/login');
      } else {
        const d = await res.json();
        setServerError(d.error || 'Signup failed. Please try again.');
      }
    } catch {
      setServerError('Something went wrong. Please try again.');
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
      minHeight: '100svh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)', /* Soft muted background matching app */
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
            <div style={{ marginBottom: '28px', textAlign: 'center' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Create an account
              </h1>
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
              <span>Have an account? <Link href="/login" style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'underline' }}>Sign in</Link></span>
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
            src="/signup-bg.png"
            alt="Farm landscape"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          {/* Subtle gradient overlay to match the reference's soft look */}
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
