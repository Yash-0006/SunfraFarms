'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { useAiPageContext } from './AiPageContext';
import { useUserStore } from '@/lib/store';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: any[];
  timestamp: number;
}

const QUICK_PROMPTS = [
  { label: "📊 Today's production", prompt: "What is today's egg production?" },
  { label: '💰 Today\'s sales', prompt: "Show me today's sales" },
  { label: '📦 Current stock', prompt: 'What is the current stock?' },
  { label: '➕ Record a production', prompt: 'I want to record a new production' },
  { label: '➕ Record a sale', prompt: 'I want to record a new sale' },
];

export default function AiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pulseVisible, setPulseVisible] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);

  const aiContext = useAiPageContext();
  const { isAiVisible } = useUserStore();

  // Load messages from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('sf_ai_chat');
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    } catch { }
  }, []);

  // Save messages to sessionStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        sessionStorage.setItem('sf_ai_chat', JSON.stringify(messages));
      } catch { }
    }
  }, [messages]);

  // Scroll to bottom when new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // Keyboard shortcut Ctrl+J
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Hide pulse after first open
  useEffect(() => {
    if (isOpen) setPulseVisible(false);
  }, [isOpen]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Build conversation history for the API
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          pageContext: aiContext.pageName,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `AI request failed (${res.status})`);
      }

      const data = await res.json();

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.message || 'I could not generate a response.',
        actions: data.actions || [],
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Handle actions
      if (data.actions && data.actions.length > 0) {
        for (const action of data.actions) {
          if (action.action === 'navigate') {
            aiContext.navigate(action.url);
          }
          // fill_form actions are handled by the UI button
        }

        // If any write action was performed, refresh data
        const hasWriteAction = data.actions.some(
          (a: any) => !a.action // non-UI actions (DB writes return without action field)
        );
        if (hasWriteAction) {
          aiContext.refreshData();
        }
      }

      // If the AI performed a DB write (indicated by tool calls that aren't UI actions),
      // refresh data after the response
      if (data.message && (
        data.message.includes('recorded') ||
        data.message.includes('added') ||
        data.message.includes('deleted') ||
        data.message.includes('✅')
      )) {
        aiContext.refreshData();
      }

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, aiContext]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleFormFill = (action: any) => {
    const isSales = action.formType === 'sale';
    const isProduction = action.formType === 'production';
    const currentPath = window.location.pathname;

    if (isSales && !currentPath.includes('/sales')) {
      sessionStorage.setItem('pending_form_fill', JSON.stringify(action));
      aiContext.navigate('/admin/godown/sales');
      return;
    }

    if (isProduction && !currentPath.includes('/production')) {
      sessionStorage.setItem('pending_form_fill', JSON.stringify(action));
      aiContext.navigate('/admin/godown/production');
      return;
    }

    aiContext.fillForm({
      formType: action.formType,
      fields: action.fields,
    });
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    sessionStorage.removeItem('sf_ai_chat');
  };

  const formatMessageContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:rgba(0,0,0,0.06);padding:1px 4px;border-radius:3px;font-size:12px">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  if (!isAiVisible) return null;

  return (
    <>
      {/* Chat Panel */}
      <div
        ref={chatPanelRef}
        style={{
          fontFamily: 'var(--font-sans)',
          position: 'fixed',
          bottom: 90,
          right: 24,
          width: 380,
          maxWidth: 'calc(100vw - 48px)',
          height: isOpen ? 600 : 0,
          maxHeight: 'calc(100vh - 120px)',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: isOpen ? '0 12px 48px rgba(0,0,0,0.12), 0 0 0 1px var(--border)' : 'none',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'var(--grey-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Sparkles size={18} color="var(--primary)" />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>SunfraFarms AI</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
                Powered by Groq Llama 3.3
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                title="Clear chat"
                style={{
                  width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                  border: 'none', background: 'transparent',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--grey-bg)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <RefreshCw size={14} />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              style={{
                width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                border: 'none', background: 'transparent',
                color: 'var(--text-secondary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--grey-bg)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          background: 'var(--bg)',
        }}>
          {messages.length === 0 && !isLoading && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 24, padding: '20px 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 'var(--radius-lg)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              }}>
                <Sparkles size={28} color="var(--primary)" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>
                  How can I help you?
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  Ask me anything about your farm data.<br />
                  Type in any language.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                {QUICK_PROMPTS.map((qp, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(qp.prompt)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', borderRadius: 'var(--radius-md)',
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      cursor: 'pointer', fontSize: 13, fontWeight: 600,
                      color: 'var(--text-primary)',
                      transition: 'all 0.15s',
                      fontFamily: 'inherit',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--text-muted)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                    }}
                  >
                    <span>{qp.label}</span>
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: 12,
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 32, height: 32, borderRadius: 'var(--radius-sm)', flexShrink: 0,
                background: msg.role === 'user'
                  ? 'var(--primary)'
                  : 'var(--surface)',
                border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: msg.role === 'assistant' ? '0 2px 4px rgba(0,0,0,0.02)' : 'none'
              }}>
                {msg.role === 'user'
                  ? <User size={16} color="#fff" />
                  : <Sparkles size={16} color="var(--primary)" />
                }
              </div>

              {/* Bubble */}
              <div style={{
                maxWidth: '82%',
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? 'var(--radius-md) var(--radius-md) 4px var(--radius-md)' : 'var(--radius-md) var(--radius-md) var(--radius-md) 4px',
                background: msg.role === 'user' ? 'var(--primary)' : 'var(--surface)',
                color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                fontSize: 14,
                lineHeight: 1.6,
                fontWeight: 500,
                boxShadow: msg.role === 'user' ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
                border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                letterSpacing: '-0.01em',
              }}>
                <div
                  dangerouslySetInnerHTML={{ __html: formatMessageContent(msg.content) }}
                />

                {/* Action buttons for fill_form */}
                {msg.actions && msg.actions.length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {msg.actions.map((action: any, i: number) => {
                      if (action.action === 'fill_form') {
                        return (
                          <button
                            key={i}
                            onClick={() => handleFormFill(action)}
                            style={{
                              padding: '6px 14px', borderRadius: 'var(--radius-sm)',
                              background: 'var(--primary)',
                              color: '#fff', border: 'none', cursor: 'pointer',
                              fontSize: 12, fontWeight: 700,
                              display: 'flex', alignItems: 'center', gap: 6,
                              transition: 'opacity 0.15s', fontFamily: 'inherit',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                          >
                            ✏️ Fill Form
                          </button>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 'var(--radius-sm)', flexShrink: 0,
                background: 'var(--surface)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <Sparkles size={16} color="var(--primary)" />
              </div>
              <div style={{
                padding: '12px 16px', borderRadius: 'var(--radius-md) var(--radius-md) var(--radius-md) 4px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div className="ai-thinking-dots">
                  <span /><span /><span />
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Thinking...</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 16px', borderRadius: 'var(--radius-md)',
              background: '#FFF0F0', border: '1px solid #FFD4D4',
              fontSize: 13, color: '#DC2626', fontWeight: 500,
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{
          padding: '16px',
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              background: 'var(--bg)',
              padding: '6px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              transition: 'border-color 0.2s',
            }}
            onFocusCapture={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--text-muted)';
            }}
            onBlurCapture={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything..."
              disabled={isLoading}
              style={{
                flex: 1, padding: '8px 12px',
                border: 'none', background: 'transparent',
                fontSize: 14, fontWeight: 500, color: 'var(--text-primary)',
                outline: 'none', fontFamily: 'inherit',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              style={{
                width: 36, height: 36, borderRadius: 'var(--radius-md)',
                background: input.trim() && !isLoading
                  ? 'var(--primary)'
                  : 'transparent',
                border: input.trim() && !isLoading ? 'none' : '1px solid var(--border)',
                cursor: input.trim() && !isLoading ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', flexShrink: 0,
              }}
            >
              {isLoading
                ? <Loader2 size={16} color="var(--text-muted)" className="ai-spin" />
                : <Send size={16} color={input.trim() ? '#fff' : 'var(--text-muted)'} />
              }
            </button>
          </form>
          {/* Footer hint */}
          <div style={{
            marginTop: 8,
            textAlign: 'center',
            fontSize: 11,
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}>
            Ctrl+J to toggle · Powered by SunfraFarms AI
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        id="ai-chat-toggle"
        onClick={() => setIsOpen(prev => !prev)}
        title="SunfraFarms AI Assistant (Click to open, Ctrl+J)"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 'var(--radius-lg)',
          background: '#111',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(19, 23, 31, 0.2)',
          transition: 'background 0.3s, box-shadow 0.3s, transform 0.2s',
          zIndex: 1000,
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {isOpen ? (
          <X size={24} color="#C8F096" />
        ) : (
          <Sparkles size={24} color="#C8F096" />
        )}

        {/* Pulse ring */}
        {pulseVisible && !isOpen && (
          <span style={{
            position: 'absolute',
            inset: -4,
            borderRadius: 'calc(var(--radius-lg) + 4px)',
            border: '2px solid #111',
            animation: 'ai-pulse 2s ease-in-out infinite',
          }} />
        )}
      </button>

      {/* Injected styles */}
      <style>{`
        @keyframes ai-pulse {
          0%, 100% { opacity: 0; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.15); }
        }

        .ai-thinking-dots {
          display: flex;
          gap: 5px;
          align-items: center;
        }
        .ai-thinking-dots span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--text-muted);
          animation: ai-dot-bounce 1.4s ease-in-out infinite;
        }
        .ai-thinking-dots span:nth-child(2) { animation-delay: 0.16s; }
        .ai-thinking-dots span:nth-child(3) { animation-delay: 0.32s; }

        @keyframes ai-dot-bounce {
          0%, 80%, 100% { opacity: 0.4; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.1); }
        }

        .ai-spin {
          animation: ai-spin-anim 1s linear infinite;
        }
        @keyframes ai-spin-anim {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Mobile responsive */
        @media (max-width: 480px) {
          #ai-chat-toggle {
            bottom: 16px !important;
            right: 16px !important;
          }
        }
      `}</style>
    </>
  );
}
