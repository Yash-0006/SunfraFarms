'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';

export default function CustomDatePicker({ 
  value, 
  onChange,
  style
}: { 
  value: string; 
  onChange: (val: string) => void;
  style?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use today's date if no value provided
  const parsedDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = currentMonth.getDay();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleSelectDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setOpen(false);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getTodayStr = () => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };
  const todayStr = getTodayStr();

  // If the popup is opened and we change the value externally, update current month
  useEffect(() => {
    if (value && open) {
      const d = new Date(value + 'T00:00:00');
      setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }, [value, open]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: 150, fontFamily: 'var(--font-sans)', ...style }}>
      <div 
        onClick={() => setOpen(!open)}
        className="input"
        style={{ 
          paddingLeft: 36, 
          paddingRight: value ? 36 : 14,
          width: '100%', 
          cursor: 'pointer', 
          height: '36px', 
          display: 'flex', 
          alignItems: 'center',
          color: value ? 'var(--text-primary)' : 'var(--text-muted)',
          fontSize: '13px',
          whiteSpace: 'nowrap'
        }}
      >
        <CalendarIcon size={14} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)' }} />
        {value ? (value.split('-').length === 3 ? `${value.split('-')[2]}-${value.split('-')[1]}-${value.split('-')[0]}` : value) : 'Select Date'}
        
        {value && (
          <div 
            onClick={handleClear}
            style={{ 
              position: 'absolute', 
              right: 10, 
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: 'transparent'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--border)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <X size={12} />
          </div>
        )}
      </div>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(19,23,31,0.1)',
          padding: '16px',
          zIndex: 50,
          width: '260px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <button type="button" onClick={handlePrevMonth} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><ChevronLeft size={18} /></button>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
            <button type="button" onClick={handleNextMonth} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><ChevronRight size={18} /></button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: 8, textAlign: 'center' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {days.map((d, i) => {
              if (!d) return <div key={i} />;
              
              const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
              const isSelected = value === dateStr;
              const isToday = todayStr === dateStr;
              
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectDate(d)}
                  style={{
                    height: 28,
                    borderRadius: 6,
                    border: 'none',
                    background: isSelected ? 'var(--primary)' : 'transparent',
                    color: isSelected ? '#fff' : (isToday ? 'var(--primary)' : 'var(--text-primary)'),
                    fontSize: '12px',
                    fontWeight: isSelected || isToday ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.1s'
                  }}
                  onMouseEnter={e => { if(!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--grey-bg)' }}
                  onMouseLeave={e => { if(!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  {d.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
