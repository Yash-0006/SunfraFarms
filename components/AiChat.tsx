'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { useAiPageContext } from './AiPageContext';

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

  // Load messages from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('sf_ai_chat');
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Save messages to sessionStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        sessionStorage.setItem('sf_ai_chat', JSON.stringify(messages));
      } catch {}
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

  return (
    <>
      {/* Chat Panel */}
      <div
        ref={chatPanelRef}
        style={{
          position: 'fixed',
          bottom: 90,
          right: 24,
          width: 400,
          maxWidth: 'calc(100vw - 48px)',
          height: isOpen ? 560 : 0,
          maxHeight: 'calc(100vh - 140px)',
          background: 'var(--white)',
          borderRadius: 20,
          boxShadow: isOpen ? '0 24px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)' : 'none',
          overflow: 'hidden',
          transition: 'height 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s, opacity 0.25s',
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
          background: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Sparkles size={17} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>SunfraFarms AI</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', margin: 0, fontWeight: 500 }}>
              Powered by Groq Llama 3.3
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                title="Clear chat"
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  border: 'none', background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              >
                <RefreshCw size={13} />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              style={{
                width: 30, height: 30, borderRadius: 8,
                border: 'none', background: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          background: '#f8f9fb',
        }}>
          {messages.length === 0 && !isLoading && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 20, padding: '20px 0' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(102,126,234,0.3)',
              }}>
                <Sparkles size={26} color="#fff" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                  How can I help you?
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  Ask me anything about your farm data.<br />
                  Type in any language — English, Hindi, Telugu...
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                {QUICK_PROMPTS.map((qp, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(qp.prompt)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: 12,
                      background: 'var(--white)', border: '1px solid var(--border)',
                      cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      color: 'var(--text-secondary)',
                      transition: 'all 0.15s',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)';
                      (e.currentTarget as HTMLElement).style.background = 'var(--grey-bg)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                      (e.currentTarget as HTMLElement).style.background = 'var(--white)';
                    }}
                  >
                    <span>{qp.label}</span>
                    <ChevronRight size={13} style={{ opacity: 0.4 }} />
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
                gap: 8,
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: msg.role === 'user'
                  ? 'var(--primary)'
                  : 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {msg.role === 'user'
                  ? <User size={14} color="#fff" />
                  : <Sparkles size={14} color="#fff" />
                }
              </div>

              {/* Bubble */}
              <div style={{
                maxWidth: '78%',
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: msg.role === 'user' ? 'var(--primary)' : 'var(--white)',
                color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                fontSize: 13,
                lineHeight: 1.55,
                fontWeight: 500,
                boxShadow: msg.role === 'user' ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
                border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
              }}>
                <div
                  dangerouslySetInnerHTML={{ __html: formatMessageContent(msg.content) }}
                />

                {/* Action buttons for fill_form */}
                {msg.actions && msg.actions.length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {msg.actions.map((action: any, i: number) => {
                      if (action.action === 'fill_form') {
                        return (
                          <button
                            key={i}
                            onClick={() => handleFormFill(action)}
                            style={{
                              padding: '5px 12px', borderRadius: 8,
                              background: 'var(--primary)',
                              color: '#fff', border: 'none', cursor: 'pointer',
                              fontSize: 11, fontWeight: 700,
                              display: 'flex', alignItems: 'center', gap: 4,
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
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={14} color="#fff" />
              </div>
              <div style={{
                padding: '12px 16px', borderRadius: '14px 14px 14px 4px',
                background: 'var(--white)', border: '1px solid var(--border)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div className="ai-thinking-dots">
                  <span /><span /><span />
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Thinking...</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px', borderRadius: 12,
              background: '#FFF0F0', border: '1px solid #FFD4D4',
              fontSize: 12, color: '#DC2626', fontWeight: 500,
            }}>
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border)',
            background: 'var(--white)',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 12,
              border: '1px solid var(--border)', background: '#f8f9fb',
              fontSize: 13, fontWeight: 500, color: 'var(--text-primary)',
              outline: 'none', transition: 'border-color 0.15s',
              fontFamily: 'inherit',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            style={{
              width: 38, height: 38, borderRadius: 12,
              background: input.trim() && !isLoading
                ? 'var(--primary)'
                : 'var(--grey-bg)',
              border: 'none', cursor: input.trim() && !isLoading ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', flexShrink: 0,
            }}
          >
            {isLoading
              ? <Loader2 size={16} color="var(--text-muted)" className="ai-spin" />
              : <Send size={15} color={input.trim() ? '#fff' : 'var(--text-muted)'} />
            }
          </button>
        </form>
        
        {/* Footer hint */}
        <div style={{
          padding: '6px 16px 10px',
          background: 'var(--white)',
          textAlign: 'center',
          fontSize: 10,
          color: 'var(--text-muted)',
          fontWeight: 500,
          flexShrink: 0,
        }}>
          Ctrl+J to toggle · Type in any language
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        id="ai-chat-toggle"
        onClick={() => setIsOpen(prev => !prev)}
        title="SunfraFarms AI Assistant (Ctrl+J)"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 52,
          height: 52,
          borderRadius: 16,
          background: 'var(--primary)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(19, 23, 31, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1000,
        }}
      >
        {isOpen ? (
          <X size={22} color="#fff" />
        ) : (
          <Sparkles size={22} color="#fff" />
        )}

        {/* Pulse ring */}
        {pulseVisible && !isOpen && (
          <span style={{
            position: 'absolute',
            inset: -4,
            borderRadius: 20,
            border: '2px solid var(--primary)',
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
          gap: 4px;
          align-items: center;
        }
        .ai-thinking-dots span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--primary);
          animation: ai-dot-bounce 1.4s ease-in-out infinite;
        }
        .ai-thinking-dots span:nth-child(2) { animation-delay: 0.16s; }
        .ai-thinking-dots span:nth-child(3) { animation-delay: 0.32s; }

        @keyframes ai-dot-bounce {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
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
