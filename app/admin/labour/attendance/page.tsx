'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Users, Search } from 'lucide-react';

interface Worker {
  id: number;
  name: string;
}

type AttStatus = 'P' | 'A' | 'P/2' | '';
const CYCLE: AttStatus[] = ['', 'P', 'A', 'P/2'];

function nextStatus(current: AttStatus): AttStatus {
  const idx = CYCLE.indexOf(current);
  return CYCLE[(idx + 1) % CYCLE.length];
}

function getStatusStyle(status: AttStatus): React.CSSProperties {
  switch (status) {
    case 'P':   return { background: 'var(--green-light)', color: '#3A6B1A', fontWeight: 800 };
    case 'A':   return { background: 'var(--pink)', color: '#9B1313', fontWeight: 800 };
    case 'P/2': return { background: 'var(--champagne)', color: '#7C4B00', fontWeight: 800 };
    default:    return { background: 'transparent', color: 'var(--text-muted)', fontWeight: 400 };
  }
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

const ITEMS_PER_PAGE = 15;

export default function AttendancePage() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendance, setAttendance] = useState<Record<number, Record<string, AttStatus>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const tableScrollRef = useRef<HTMLDivElement>(null);

  const scrollTable = (dir: -1 | 1) => {
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollBy({ left: dir * 220, behavior: 'smooth' });
    }
  };

  const monthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;

  const fetchAttendance = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/labour/attendance?month=${monthStr}`);
      if (res.ok) {
        const data = await res.json();
        setWorkers(data.workers || []);
        setAttendance(data.attendanceMap || {});
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  }, [monthStr]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  // Reset page when search changes
  useEffect(() => { setCurrentPage(1); }, [searchQuery, monthStr]);

  const navigateMonth = (dir: -1 | 1) => {
    const d = new Date(viewYear, viewMonth + dir, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const totalDays = daysInMonth(viewYear, viewMonth);
  const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  const maxDay = isCurrentMonth ? today.getDate() : totalDays;
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  // Filter & paginate workers
  const filteredWorkers = workers.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredWorkers.length / ITEMS_PER_PAGE);
  const paginatedWorkers = filteredWorkers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCellClick = async (workerId: number, day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const key = `${workerId}_${dateStr}`;
    if (dateStr > todayDateStr) return;

    const current: AttStatus = attendance[workerId]?.[dateStr] ?? '';
    const next = nextStatus(current);

    setAttendance(prev => ({
      ...prev,
      [workerId]: { ...(prev[workerId] || {}), [dateStr]: next },
    }));

    setSaving(key);
    try {
      await fetch('/api/labour/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labour_id: workerId, date: dateStr, status: next || '' }),
      });
    } catch (e) {
      console.error(e);
      setAttendance(prev => ({
        ...prev,
        [workerId]: { ...(prev[workerId] || {}), [dateStr]: current },
      }));
    }
    setSaving(null);
  };

  // Day summary is computed over ALL filtered workers (not just this page)
  const daySummary = days.map(day => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    let p = 0, a = 0, half = 0;
    filteredWorkers.forEach(w => {
      const s = attendance[w.id]?.[dateStr] ?? '';
      if (s === 'P') p++;
      else if (s === 'A') a++;
      else if (s === 'P/2') half++;
    });
    return { p, a, half };
  });

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleString('en-US', { month: 'long' });

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* Page header */}
      <div className="animate-fadeup" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Attendance Register</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Click any cell to cycle: <strong style={{ color: '#3A6B1A' }}>P</strong> → <strong style={{ color: '#9B1313' }}>A</strong> → <strong style={{ color: '#7C4B00' }}>P/2</strong> → blank
          </p>
        </div>

        {/* Month navigator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '6px 8px' }}>
          <button
            onClick={() => navigateMonth(-1)}
            style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--grey-bg)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', minWidth: 120, textAlign: 'center' }}>
            {monthName} {viewYear}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            disabled={isCurrentMonth}
            style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent', cursor: isCurrentMonth ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isCurrentMonth ? 'var(--grey-bg-2)' : 'var(--text-muted)', transition: 'background 0.15s' }}
            onMouseEnter={e => { if (!isCurrentMonth) (e.currentTarget.style.background = 'var(--grey-bg)'); }}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="animate-fadeup-2" style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'Present (P)', bg: 'var(--green-light)', color: '#3A6B1A' },
          { label: 'Absent (A)', bg: 'var(--pink)', color: '#9B1313' },
          { label: 'Half Day (P/2)', bg: 'var(--champagne)', color: '#7C4B00' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', fontWeight: 600, color: item.color }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: item.bg, display: 'inline-block' }} />
            {item.label}
          </div>
        ))}
      </div>

      {/* Attendance grid card */}
      <div className="animate-fadeup-2" style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>

        {/* Search + count bar + scroll controls */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input"
              style={{ paddingLeft: 36 }}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search worker by name…"
            />
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
            {filteredWorkers.length} worker{filteredWorkers.length !== 1 ? 's' : ''}
            {searchQuery && workers.length !== filteredWorkers.length && ` (of ${workers.length})`}
          </span>
        </div>

        <div ref={tableScrollRef} style={{ overflowX: 'auto' }}>
          {isLoading ? (
            <div style={{ padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div className="spinner" />
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading attendance…</span>
            </div>
          ) : workers.length === 0 ? (
            <div style={{ padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--grey-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={24} color="var(--text-muted)" />
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No active workers found. Add workers in Registration first.</span>
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div style={{ padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--grey-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Search size={24} color="var(--text-muted)" />
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No workers match your search.</span>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>

                  {/* Sticky: Worker Name */}
                  <th style={{
                    padding: '10px 16px',
                    textAlign: 'left',
                    fontWeight: 800,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#000',
                    background: 'var(--white)',
                    position: 'sticky',
                    left: 0,
                    zIndex: 3,
                    minWidth: 160,
                    borderRight: '2px solid var(--border)',
                    whiteSpace: 'nowrap',
                  }}>
                    Worker Name
                  </th>

                  {/* Sticky: Left scroll arrow — sits right after name column */}
                  <th style={{
                    padding: '0 4px',
                    width: 32,
                    minWidth: 32,
                    background: 'var(--white)',
                    position: 'sticky',
                    left: 160,
                    zIndex: 3,
                    borderRight: '1px solid var(--border)',
                    textAlign: 'center',
                  }}>
                    <button
                      onClick={() => scrollTable(-1)}
                      title="Scroll left"
                      style={{
                        width: 26, height: 26,
                        borderRadius: 6,
                        border: '1.5px solid rgba(0,0,0,0.12)',
                        background: '#13171F',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                        transition: 'opacity 0.15s',
                        padding: 0,
                        margin: '0 auto',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      <ChevronLeft size={13} strokeWidth={2.5} />
                    </button>
                  </th>

                  {/* Scrolling day columns */}
                  {days.map(day => {
                    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isToday = dateStr === todayDateStr;
                    const dow = new Date(viewYear, viewMonth, day).toLocaleString('en-US', { weekday: 'short' });
                    const isSun = new Date(viewYear, viewMonth, day).getDay() === 0;
                    return (
                      <th key={day} style={{
                        padding: '6px 4px',
                        textAlign: 'center',
                        fontWeight: isToday ? 800 : 600,
                        fontSize: '11px',
                        color: isToday ? 'var(--primary)' : (isSun ? '#EF4444' : '#000'),
                        background: isToday ? 'rgba(19,23,31,0.04)' : 'transparent',
                        minWidth: 40,
                        maxWidth: 44,
                        borderBottom: isToday ? '2px solid var(--primary)' : undefined,
                      }}>
                        <div>{day}</div>
                        <div style={{ fontSize: '9px', opacity: 0.7, fontWeight: 500, textTransform: 'uppercase' }}>{dow}</div>
                      </th>
                    );
                  })}

                  {/* Sticky: Right scroll arrow — sits right before Total P */}
                  <th style={{
                    padding: '0 4px',
                    width: 32,
                    minWidth: 32,
                    background: 'var(--white)',
                    position: 'sticky',
                    right: 60,
                    zIndex: 3,
                    borderLeft: '1px solid var(--border)',
                    textAlign: 'center',
                  }}>
                    <button
                      onClick={() => scrollTable(1)}
                      title="Scroll right"
                      style={{
                        width: 26, height: 26,
                        borderRadius: 6,
                        border: '1.5px solid rgba(0,0,0,0.12)',
                        background: '#13171F',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                        transition: 'opacity 0.15s',
                        padding: 0,
                        margin: '0 auto',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      <ChevronRight size={13} strokeWidth={2.5} />
                    </button>
                  </th>

                  {/* Sticky: Total P */}
                  <th style={{
                    padding: '10px 8px',
                    textAlign: 'center',
                    fontWeight: 800,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#000',
                    minWidth: 60,
                    width: 60,
                    background: 'var(--white)',
                    position: 'sticky',
                    right: 0,
                    zIndex: 3,
                    borderLeft: '2px solid var(--border)',
                  }}>Total P</th>

                </tr>
              </thead>
              <tbody>
                {paginatedWorkers.map((worker, workerIdx) => {
                  let presentCount = 0;
                  days.forEach(day => {
                    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const s = attendance[worker.id]?.[dateStr] ?? '';
                    if (s === 'P') presentCount++;
                    else if (s === 'P/2') presentCount += 0.5;
                  });
                  const rowBg = workerIdx % 2 === 0 ? 'var(--white)' : 'rgba(239,239,245,0.3)';

                  return (
                    <tr key={worker.id} style={{ borderBottom: '1px solid var(--border-light)' }}>

                      {/* Sticky: Name */}
                      <td style={{
                        padding: '8px 16px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        background: rowBg,
                        position: 'sticky',
                        left: 0,
                        zIndex: 1,
                        borderRight: '2px solid var(--border)',
                        whiteSpace: 'nowrap',
                        fontSize: '13px',
                      }}>
                        {worker.name}
                      </td>

                      {/* Sticky: Left arrow placeholder cell */}
                      <td style={{
                        background: rowBg,
                        position: 'sticky',
                        left: 160,
                        zIndex: 1,
                        width: 32,
                        borderRight: '1px solid var(--border)',
                      }} />

                      {/* Day cells */}
                      {days.map(day => {
                        const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const isFuture = dateStr > todayDateStr;
                        const isToday = dateStr === todayDateStr;
                        const status: AttStatus = attendance[worker.id]?.[dateStr] ?? '';
                        const isSaving = saving === `${worker.id}_${dateStr}`;
                        const cellStyle = getStatusStyle(status);

                        return (
                          <td key={day} style={{
                            padding: '4px 2px',
                            textAlign: 'center',
                            background: isToday
                              ? 'rgba(19,23,31,0.03)'
                              : rowBg,
                          }}>
                            <button
                              onClick={() => !isFuture && handleCellClick(worker.id, day)}
                              disabled={isFuture || isSaving}
                              title={isFuture ? 'Future date' : `Click to mark attendance`}
                              style={{
                                width: 36,
                                height: 28,
                                borderRadius: 6,
                                border: 'none',
                                cursor: isFuture ? 'default' : 'pointer',
                                fontSize: '11px',
                                fontFamily: 'var(--font-sans)',
                                transition: 'background 0.12s, transform 0.1s',
                                opacity: isFuture ? 0.2 : (isSaving ? 0.5 : 1),
                                transform: isSaving ? 'scale(0.9)' : 'scale(1)',
                                ...cellStyle,
                              }}
                              onMouseEnter={e => {
                                if (!isFuture && !isSaving) {
                                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.12)';
                                }
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                              }}
                            >
                              {status || '·'}
                            </button>
                          </td>
                        );
                      })}

                      {/* Sticky: Right arrow placeholder cell */}
                      <td style={{
                        background: rowBg,
                        position: 'sticky',
                        right: 60,
                        zIndex: 1,
                        width: 32,
                        borderLeft: '1px solid var(--border)',
                      }} />

                      {/* Sticky: Total P */}
                      <td style={{
                        padding: '8px',
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: '13px',
                        color: presentCount > 0 ? '#3A6B1A' : 'var(--text-muted)',
                        background: 'var(--green-light)',
                        position: 'sticky',
                        right: 0,
                        zIndex: 1,
                        borderLeft: '2px solid var(--border)',
                        minWidth: 60,
                        width: 60,
                      }}>
                        {presentCount % 1 === 0 ? presentCount : presentCount.toFixed(1)}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
              {/* Summary footer */}
              {!searchQuery && (
                <tfoot>
                  <tr style={{ borderTop: '2px solid var(--border)', background: 'var(--white)' }}>
                    <td style={{
                      padding: '10px 16px',
                      fontWeight: 800,
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#000',
                      position: 'sticky',
                      left: 0,
                      background: 'var(--white)',
                      borderRight: '2px solid var(--border)',
                      whiteSpace: 'nowrap',
                      zIndex: 1,
                    }}>
                      Summary
                    </td>
                    {/* Left arrow placeholder */}
                    <td style={{ background: 'var(--white)', position: 'sticky', left: 160, zIndex: 1, borderRight: '1px solid var(--border)' }} />
                    {daySummary.map((s, i) => (
                      <td key={i} style={{ padding: '4px 2px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          {s.p > 0 && <span style={{ fontSize: '9px', fontWeight: 700, color: '#3A6B1A' }}>{s.p}P</span>}
                          {s.a > 0 && <span style={{ fontSize: '9px', fontWeight: 700, color: '#9B1313' }}>{s.a}A</span>}
                          {s.half > 0 && <span style={{ fontSize: '9px', fontWeight: 700, color: '#7C4B00' }}>{s.half}H</span>}
                          {s.p === 0 && s.a === 0 && s.half === 0 && <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>—</span>}
                        </div>
                      </td>
                    ))}
                    {/* Right arrow placeholder */}
                    <td style={{ background: 'var(--white)', position: 'sticky', right: 60, zIndex: 1, borderLeft: '1px solid var(--border)' }} />
                    <td style={{ borderLeft: '2px solid var(--border)', background: 'var(--white)', position: 'sticky', right: 0, zIndex: 1 }} />
                  </tr>
                </tfoot>
              )}
            </table>
          )}
        </div> {/* end overflowX: auto */}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredWorkers.length)} of {filteredWorkers.length} workers
            </span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                className="btn-ghost"
                style={{ padding: '6px 12px', fontSize: '13px' }}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <div style={{ display: 'flex', gap: 4 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) => p === '...' ? (
                    <span key={`ellipsis-${i}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, fontSize: '13px', color: 'var(--text-muted)' }}>…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      style={{
                        width: 32, height: 32,
                        borderRadius: 6,
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600,
                        fontFamily: 'var(--font-sans)',
                        background: currentPage === p ? 'var(--primary)' : 'var(--grey-bg)',
                        color: currentPage === p ? '#fff' : 'var(--text-secondary)',
                        transition: 'background 0.15s, color 0.15s',
                      }}
                    >
                      {p}
                    </button>
                  ))}
              </div>
              <button
                className="btn-ghost"
                style={{ padding: '6px 12px', fontSize: '13px' }}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
