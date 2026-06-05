'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  style?: React.CSSProperties;
}

export default function CustomSelect({ options, value, onChange, style }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', ...style }}>
      <button
        type="button"
        className="input"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '8px 12px',
          height: 'auto',
          minHeight: '36px',
          background: 'var(--white)',
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: '13px',
          color: 'var(--text-primary)',
        }}
      >
        <span>{selectedOption?.label}</span>
        <ChevronDown 
          size={14} 
          style={{ 
            marginLeft: '8px', 
            color: 'var(--text-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }} 
        />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
          zIndex: 100,
          padding: '6px',
          animation: 'fadeUp 0.15s ease-out'
        }}>
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: option.value === value ? 600 : 500,
                color: option.value === value ? 'var(--primary)' : 'var(--text-primary)',
                background: option.value === value ? 'var(--green-light)' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                if (option.value !== value) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--grey-bg)';
                }
              }}
              onMouseLeave={(e) => {
                if (option.value !== value) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
