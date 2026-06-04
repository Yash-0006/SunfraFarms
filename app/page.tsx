import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { query } from '@/lib/db';
import { parseToTotalEggs, normalizeQuantity, formatQuantityDisplay } from '@/lib/quantity-utils';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let totalProductionQty = 0;
  let totalSalesQty = 0;

  try {
    const prodRows: any = await query('SELECT quantity FROM egg_production');
    const totalProdEggs = prodRows.reduce((acc: number, row: any) => acc + parseToTotalEggs(row.quantity), 0);
    totalProductionQty = normalizeQuantity(totalProdEggs);

    const salesRows: any = await query('SELECT quantity FROM egg_sale');
    const totalSalesEggs = salesRows.reduce((acc: number, row: any) => acc + parseToTotalEggs(row.quantity), 0);
    totalSalesQty = normalizeQuantity(totalSalesEggs);
  } catch (error) {
    console.error('Failed to fetch metrics', error);
  }

  const stockEggs = parseToTotalEggs(totalProductionQty) - parseToTotalEggs(totalSalesQty);
  const currentStockQty = normalizeQuantity(stockEggs);

  const stats = [
    {
      label: 'Total Production',
      sublabel: 'All-time egg collection',
      value: formatQuantityDisplay(totalProductionQty),
      unit: 'Trays',
      href: '/production',
      linkLabel: 'Manage Production',
      bg: 'var(--green-light)',
      accent: '#4A7C2F',
    },
    {
      label: 'Total Sales',
      sublabel: 'All-time eggs sold',
      value: formatQuantityDisplay(totalSalesQty),
      unit: 'Trays',
      href: '/sales',
      linkLabel: 'Manage Sales',
      bg: 'var(--champagne)',
      accent: '#A05A2C',
    },
    {
      label: 'Current Stock',
      sublabel: 'Production minus sales',
      value: formatQuantityDisplay(currentStockQty),
      unit: 'Trays',
      href: null,
      linkLabel: null,
      bg: 'var(--sky)',
      accent: '#1A6E8E',
    },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: '28px' }} className="animate-fadeup">
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Egg Godown
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Overview of your farm's egg production and sales.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`animate-fadeup-${i + 2}`}
            style={{
              background: s.bg,
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Mini bar chart decoration */}
            <div style={{ position: 'absolute', right: 20, bottom: 20, display: 'flex', alignItems: 'flex-end', gap: 4, opacity: 0.18 }}>
              {[40, 65, 45, 80, 55, 90, 70].map((h, j) => (
                <div key={j} style={{ width: 6, height: h * 0.6, background: s.accent, borderRadius: 3 }} />
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: s.accent }}>{s.label}</p>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                background: 'rgba(0,0,0,0.08)',
                color: s.accent,
                padding: '2px 8px',
                borderRadius: '99px',
              }}>
                All Time
              </span>
            </div>

            <div style={{ marginBottom: '6px' }}>
              <span style={{ fontSize: '38px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {s.value}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: s.accent, fontWeight: 500 }}>{s.unit} · {s.sublabel}</p>

            {s.href && (
              <Link
                href={s.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: s.accent,
                  textDecoration: 'none',
                  opacity: 0.85,
                }}
              >
                {s.linkLabel}
                <ArrowRight size={13} />
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }} className="animate-fadeup-4">
        {[
          { label: 'Record Production', desc: "Add today's egg collection by shed", href: '/production' },
          { label: 'Record Sales', desc: 'Log eggs sold to buyers', href: '/sales' },
          { label: 'View Dashboard', desc: 'Analytics and trends', href: '/dashboard' },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="quick-link-card"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{link.label}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>{link.desc}</p>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

