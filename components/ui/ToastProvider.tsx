'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, X, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ConfirmConfig {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface ToastContextType {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
  confirm: (config: ConfirmConfig) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const success = useCallback((msg: string) => addToast('success', msg), [addToast]);
  const error = useCallback((msg: string) => addToast('error', msg), [addToast]);
  const info = useCallback((msg: string) => addToast('info', msg), [addToast]);
  
  const confirm = useCallback((config: ConfirmConfig) => {
    setConfirmConfig(config);
  }, []);

  const handleConfirm = () => {
    if (confirmConfig) {
      confirmConfig.onConfirm();
      setConfirmConfig(null);
    }
  };

  const handleCancel = () => {
    if (confirmConfig) {
      if (confirmConfig.onCancel) confirmConfig.onCancel();
      setConfirmConfig(null);
    }
  };

  return (
    <ToastContext.Provider value={{ success, error, info, confirm }}>
      {children}

      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        top: 24,
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        zIndex: 9999,
        pointerEvents: 'none',
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="animate-slideleft"
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px var(--border)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              pointerEvents: 'auto',
              minWidth: '300px',
            }}
          >
            {toast.type === 'success' && <CheckCircle2 size={20} color="#10B981" />}
            {toast.type === 'error' && <AlertCircle size={20} color="#EF4444" />}
            {toast.type === 'info' && <Info size={20} color="#3B82F6" />}
            <p style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
            }}>
              {toast.message}
            </p>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              style={{
                marginLeft: 'auto',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: 4,
              }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Confirm Modal */}
      {confirmConfig && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          fontFamily: 'var(--font-sans)',
        }}>
          <div className="animate-fadeup" style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: 420,
            boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '24px' }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--pink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}>
                <AlertCircle size={24} color="#8B2E2E" />
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {confirmConfig.title}
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {confirmConfig.message}
              </p>
            </div>
            <div style={{
              padding: '16px 24px',
              background: 'var(--grey-bg)',
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-end',
              borderTop: '1px solid var(--border)',
            }}>
              <button
                onClick={handleCancel}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: 'transparent',
                  border: '1px solid var(--border-dark)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {confirmConfig.cancelText || 'Cancel'}
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: '#EF4444',
                  border: 'none',
                  color: '#FFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                }}
              >
                {confirmConfig.confirmText || 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideleft {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideleft {
          animation: slideleft 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
}
