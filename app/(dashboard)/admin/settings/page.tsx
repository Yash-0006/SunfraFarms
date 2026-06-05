'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Save, Edit2, Eye, EyeOff } from 'lucide-react';

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setProfile(prev => ({ ...prev, password: '' })); // clear password
        setIsEditing(false);
        setIsChangingPassword(false);
        // Dispatch an event so the Topbar can listen and update
        window.dispatchEvent(new Event('profileUpdated'));
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: 36, height: 36, border: '3px solid var(--green-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }} className="animate-fadeup">
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

      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '32px' }} className="animate-fadeup-2">
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                <p style={{ fontSize: '14px', fontWeight: 500, padding: '10px 14px', background: 'var(--grey-bg)', borderRadius: 'var(--radius-md)', border: '1px solid transparent' }}>
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
                <p style={{ fontSize: '14px', fontWeight: 500, padding: '10px 14px', background: 'var(--grey-bg)', borderRadius: 'var(--radius-md)', border: '1px solid transparent' }}>
                  {profile.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Contact Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                <p style={{ fontSize: '14px', fontWeight: 500, padding: '10px 14px', background: 'var(--grey-bg)', borderRadius: 'var(--radius-md)', border: '1px solid transparent' }}>
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
                <p style={{ fontSize: '14px', fontWeight: 500, padding: '10px 14px', background: 'var(--grey-bg)', borderRadius: 'var(--radius-md)', border: '1px solid transparent' }}>
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
              <button type="submit" className="btn-primary" disabled={isSaving}>
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}
