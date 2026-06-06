import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function LabourPage() {
  let totalWorkers = 0;
  let activeWorkers = 0;
  let inactiveWorkers = 0;
  let presentToday = 0;
  let absentToday = 0;
  let halfDayToday = 0;
  let presentThisMonth = 0;

  try {
    const workerRows: any = await query('SELECT status, COUNT(*) as count FROM labour GROUP BY status');
    workerRows.forEach((r: any) => {
      const c = Number(r.count);
      totalWorkers += c;
      if (r.status === 'active') activeWorkers = c;
      else inactiveWorkers = c;
    });

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const todayAtt: any = await query(
      `SELECT status, COUNT(*) as count FROM labour_attendance WHERE date = ? GROUP BY status`,
      [todayStr]
    );
    todayAtt.forEach((r: any) => {
      const c = Number(r.count);
      if (r.status === 'P') presentToday = c;
      else if (r.status === 'A') absentToday = c;
      else if (r.status === 'P/2') halfDayToday = c;
    });

    const monthAtt: any = await query(
      `SELECT COUNT(*) as count FROM labour_attendance WHERE date LIKE ? AND status IN ('P', 'P/2')`,
      [`${monthStr}%`]
    );
    presentThisMonth = Number(monthAtt[0]?.count ?? 0);
  } catch (error) {
    console.error('Failed to fetch labour metrics', error);
  }

  const unmarkedToday = activeWorkers - (presentToday + absentToday + halfDayToday);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: '28px' }} className="animate-fadeup">
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Labour
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Overview of your farm's workforce — registrations and daily attendance.
        </p>
      </div>

      {/* 3-column stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>

        {/* Col 1: Workers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
          <div style={{ position: 'absolute', right: '-12px', top: 0, bottom: 0, width: '1px', background: 'var(--border)' }} />
          <div className="animate-fadeup" style={{ background: 'var(--green-light)', borderRadius: 'var(--radius-xl)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
            {/* Decorative bars */}
            <div style={{ position: 'absolute', right: 20, bottom: 20, display: 'flex', alignItems: 'flex-end', gap: 4, opacity: 0.18 }}>
              {[30, 50, 40, 70, 55, 85, 65].map((h, j) => (
                <div key={j} style={{ width: 6, height: h * 0.6, background: '#4A7C2F', borderRadius: 3 }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#4A7C2F' }}>Total Workers</p>
              <span style={{ fontSize: '11px', fontWeight: 600, background: 'rgba(0,0,0,0.08)', color: '#4A7C2F', padding: '2px 8px', borderRadius: '99px' }}>All Time</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
              <span style={{ fontSize: '38px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>{totalWorkers}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', opacity: 0.8 }}>workers</span>
            </div>
            <p style={{ fontSize: '12px', color: '#4A7C2F', fontWeight: 500 }}>Registered in the system</p>
            <Link href="/admin/labour/registration" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: '20px', fontSize: '12px', fontWeight: 600, color: '#4A7C2F', textDecoration: 'none', opacity: 0.85 }}>
              Manage Registration <ArrowRight size={13} />
            </Link>
          </div>
          {/* Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {[
              { label: 'Active', val: activeWorkers, bg: 'var(--green-light)', accent: '#3E6B22' },
              { label: 'Inactive', val: inactiveWorkers, bg: 'var(--pink)', accent: '#8B2E2E' },
            ].map(c => (
              <div key={c.label} className="animate-fadeup" style={{ background: c.bg, borderRadius: 'var(--radius-lg)', padding: '16px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: c.accent, marginBottom: '8px' }}>{c.label}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <p style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em', margin: 0 }}>{c.val}</p>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>workers</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Col 2: Today's Attendance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
          <div style={{ position: 'absolute', right: '-12px', top: 0, bottom: 0, width: '1px', background: 'var(--border)' }} />
          <div className="animate-fadeup" style={{ background: 'var(--champagne)', borderRadius: 'var(--radius-xl)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: 20, bottom: 20, display: 'flex', alignItems: 'flex-end', gap: 4, opacity: 0.18 }}>
              {[50, 80, 60, 90, 70, 85, 75].map((h, j) => (
                <div key={j} style={{ width: 6, height: h * 0.6, background: '#A05A2C', borderRadius: 3 }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#A05A2C' }}>Today's Attendance</p>
              <span style={{ fontSize: '11px', fontWeight: 600, background: 'rgba(0,0,0,0.08)', color: '#A05A2C', padding: '2px 8px', borderRadius: '99px' }}>Today</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
              <span style={{ fontSize: '38px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>{presentToday}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', opacity: 0.8 }}>present</span>
            </div>
            <p style={{ fontSize: '12px', color: '#A05A2C', fontWeight: 500 }}>Out of {activeWorkers} active workers</p>
            <Link href="/admin/labour/attendance" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: '20px', fontSize: '12px', fontWeight: 600, color: '#A05A2C', textDecoration: 'none', opacity: 0.85 }}>
              Mark Attendance <ArrowRight size={13} />
            </Link>
          </div>
          {/* Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { label: 'Present', val: presentToday, bg: 'var(--green-light)', accent: '#3E6B22' },
              { label: 'Absent', val: absentToday, bg: 'var(--pink)', accent: '#8B2E2E' },
              { label: 'Half Day', val: halfDayToday, bg: 'var(--champagne)', accent: '#A05A2C' },
            ].map(c => (
              <div key={c.label} className="animate-fadeup" style={{ background: c.bg, borderRadius: 'var(--radius-lg)', padding: '14px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: c.accent, marginBottom: '8px' }}>{c.label}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                  <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em', margin: 0 }}>{c.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Col 3: This Month */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="animate-fadeup" style={{ background: 'var(--sky)', borderRadius: 'var(--radius-xl)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: 20, bottom: 20, display: 'flex', alignItems: 'flex-end', gap: 4, opacity: 0.18 }}>
              {[40, 65, 45, 80, 55, 90, 70].map((h, j) => (
                <div key={j} style={{ width: 6, height: h * 0.6, background: '#1A6E8E', borderRadius: 3 }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A6E8E' }}>This Month</p>
              <span style={{ fontSize: '11px', fontWeight: 600, background: 'rgba(0,0,0,0.08)', color: '#1A6E8E', padding: '2px 8px', borderRadius: '99px' }}>Month</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
              <span style={{ fontSize: '38px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>{presentThisMonth}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', opacity: 0.8 }}>attendances</span>
            </div>
            <p style={{ fontSize: '12px', color: '#1A6E8E', fontWeight: 500 }}>Total P + P/2 entries this month</p>
            <div style={{ marginTop: '20px', height: '18px' }} />
          </div>
          {/* Unmarked today */}
          <div className="animate-fadeup" style={{ background: unmarkedToday > 0 ? '#FEF2F2' : 'var(--green-light)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: unmarkedToday > 0 ? '#991B1B' : '#3E6B22', marginBottom: '8px' }}>
              {unmarkedToday > 0 ? '⚠ Unmarked Today' : '✓ All Marked Today'}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <p style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em', margin: 0 }}>{Math.max(0, unmarkedToday)}</p>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>workers not yet marked</span>
            </div>
          </div>
        </div>

      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }} className="animate-fadeup">
        {[
          { label: 'Worker Registration', desc: 'Add, edit and manage worker records', href: '/admin/labour/registration' },
          { label: 'Attendance Register', desc: 'Mark daily P / A / P/2 for all workers', href: '/admin/labour/attendance' },
          { label: 'View Dashboard', desc: 'Farm analytics and trends', href: '/admin/dashboard' },
        ].map(link => (
          <Link key={link.href} href={link.href} className="quick-link-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{link.label}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>{link.desc}</p>
              </div>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ArrowRight size={14} color="#FFF" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
