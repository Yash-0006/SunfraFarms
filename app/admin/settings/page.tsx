'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Save, Edit2, Eye, EyeOff, Check } from 'lucide-react';
import { useUserStore } from '@/lib/store';

const RULES = [
  { key: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { key: 'upper', label: 'One uppercase letter (A–Z)', test: (p: string) => /[A-Z]/.test(p) },
  { key: 'lower', label: 'One lowercase letter (a–z)', test: (p: string) => /[a-z]/.test(p) },
  { key: 'number', label: 'One number (0–9)', test: (p: string) => /[0-9]/.test(p) },
  { key: 'symbol', label: 'One symbol (!@#$%^&*…)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const { setProfile: setGlobalProfile } = useUserStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setProfile({
            firstName: data.user.first_name || '',
            lastName: data.user.last_name || '',
            email: data.user.email || '',
            mobile: data.user.mobile || '',
            password: ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRules = RULES.map(r => ({ ...r, ok: r.test(profile.password) }));
  const allRulesOk = passwordRules.every(r => r.ok);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isChangingPassword && profile.password && !allRulesOk) {
      setMessage({ type: 'error', text: 'Please ensure your new password meets all the requirements.' });
      return;
    }
    
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        
        // Update global Zustand store instantly
        setGlobalProfile({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          mobile: profile.mobile
        });

        setProfile(prev => ({ ...prev, password: '' })); // clear password
        setIsEditing(false);
        setIsChangingPassword(false);
        
        setTimeout(() => setMessage({ type: '', text: '' }), 3000); // Clear success message after 3s
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>Loading settings...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <style>{`
        .show-on-mobile { display: none; }
        .hide-on-mobile { display: inline; }
        @media (max-width: 600px) {
          .show-on-mobile { display: inline !important; }
          .hide-on-mobile { display: none !important; }
        }
      `}</style>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }} className="animate-fadeup">
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Profile Settings
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Manage your personal details and account security.
          </p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)} 
            className="btn-primary" 
            style={{ background: 'var(--primary)', color: '#fff' }}
          >
            <Edit2 size={14} /> Edit Details
          </button>
        )}
      </div>

      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '32px' }} className="animate-fadeup">
        {message.text && (
          <div style={{ 
            padding: '12px 16px', 
            borderRadius: 'var(--radius-sm)', 
            marginBottom: '24px', 
            fontSize: '13px', 
            fontWeight: 600,
            background: message.type === 'success' ? 'var(--green-light)' : 'var(--pink)',
            color: message.type === 'success' ? '#3E6B22' : '#8B2E2E'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Name Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <User size={14} /> First Name
              </label>
              {isEditing ? (
                <input 
                  type="text" 
                  className="input" 
                  value={profile.firstName} 
                  onChange={e => setProfile({...profile, firstName: e.target.value})} 
                  required 
                />
              ) : (
                <p style={{ fontSize: '14px', fontWeight: 500, padding: '10px 14px', background: 'var(--grey-bg)', borderRadius: 'var(--radius-md)', border: '1px solid transparent', wordBreak: 'break-word' }}>
                  {profile.firstName}
                </p>
              )}
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <User size={14} /> Last Name
              </label>
              {isEditing ? (
                <input 
                  type="text" 
                  className="input" 
                  value={profile.lastName} 
                  onChange={e => setProfile({...profile, lastName: e.target.value})} 
                  required 
                />
              ) : (
                <p style={{ fontSize: '14px', fontWeight: 500, padding: '10px 14px', background: 'var(--grey-bg)', borderRadius: 'var(--radius-md)', border: '1px solid transparent', wordBreak: 'break-word' }}>
                  {profile.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Contact Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <Mail size={14} /> Email Address
              </label>
              {isEditing ? (
                <input 
                  type="email" 
                  className="input" 
                  value={profile.email} 
                  onChange={e => setProfile({...profile, email: e.target.value})} 
                  required 
                />
              ) : (
                <p style={{ fontSize: '14px', fontWeight: 500, padding: '10px 14px', background: 'var(--grey-bg)', borderRadius: 'var(--radius-md)', border: '1px solid transparent', wordBreak: 'break-word' }}>
                  {profile.email}
                </p>
              )}
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <Phone size={14} /> Mobile Number
              </label>
              {isEditing ? (
                <input 
                  type="text" 
                  className="input" 
                  value={profile.mobile} 
                  onChange={e => setProfile({...profile, mobile: e.target.value})} 
                  required 
                />
              ) : (
                <p style={{ fontSize: '14px', fontWeight: 500, padding: '10px 14px', background: 'var(--grey-bg)', borderRadius: 'var(--radius-md)', border: '1px solid transparent', wordBreak: 'break-word' }}>
                  {profile.mobile}
                </p>
              )}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)' }} />

          {/* Password Section */}
          <div>
            {!isChangingPassword ? (
              <button 
                type="button" 
                onClick={() => setIsChangingPassword(true)} 
                className="btn-ghost" 
                style={{ fontSize: '12px' }}
              >
                <Lock size={14} /> Change Password
              </button>
            ) : (
              <div style={{ maxWidth: 400 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <Lock size={14} /> New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    className="input" 
                    style={{ paddingRight: '40px' }}
                    value={profile.password} 
                    onChange={e => setProfile({...profile, password: e.target.value})} 
                    placeholder="Enter new password"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {profile.password.length > 0 && (
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

                <button 
                  type="button" 
                  onClick={() => { setIsChangingPassword(false); setProfile({...profile, password: ''}); }} 
                  style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '11px', fontWeight: 600, marginTop: '8px', cursor: 'pointer' }}
                >
                  Cancel Password Change
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          {(isEditing || isChangingPassword) && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <button 
                type="button" 
                className="btn-ghost" 
                onClick={() => { 
                  setIsEditing(false); 
                  setIsChangingPassword(false); 
                  fetchProfile(); 
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSaving || (isChangingPassword && profile.password.length > 0 && !allRulesOk)}>
                <Save size={16} />
                {isSaving ? 'Saving...' : (
                  <>
                    <span className="hide-on-mobile">Save Changes</span>
                    <span className="show-on-mobile">Save</span>
                  </>
                )}
              </button>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}
