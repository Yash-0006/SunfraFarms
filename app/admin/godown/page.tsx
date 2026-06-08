import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { query } from '@/lib/db';
import { parseToTotalEggs, normalizeQuantity, formatQuantityDisplay, getDynamicFontSize, formatCompactNumber } from '@/lib/quantity-utils';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let totalProductionQty = 0;
  let totalSalesQty = 0;

  let goodEggs = 0;
  let damagedEggs = 0;
  let bigEggs = 0;
  let smallEggs = 0;
  let bigSalesEggs = 0;
  let smallSalesEggs = 0;

  try {
    const prodRows: any = await query('SELECT * FROM egg_production');
    prodRows.forEach((row: any) => {
      const eggs = parseToTotalEggs(row.quantity);
      if (row.conditionn === 'Good') goodEggs += eggs;
      else if (row.conditionn === 'Damaged') damagedEggs += eggs;
      else if (row.conditionn === 'Big') bigEggs += eggs;
      else if (row.conditionn === 'Small') smallEggs += eggs;
      else damagedEggs += eggs;
    });
    const totalProdEggs = goodEggs + damagedEggs + bigEggs + smallEggs;
    totalProductionQty = normalizeQuantity(totalProdEggs);

    const salesRows: any = await query('SELECT * FROM egg_sale');
    salesRows.forEach((row: any) => {
      bigSalesEggs += parseToTotalEggs(row.big_quantity);
      smallSalesEggs += parseToTotalEggs(row.small_quantity);
    });
    const totalSalesEggs = bigSalesEggs + smallSalesEggs;
    totalSalesQty = normalizeQuantity(totalSalesEggs);
  } catch (error) {
    console.error('Failed to fetch metrics', error);
  }

  const stockEggs = parseToTotalEggs(totalProductionQty) - parseToTotalEggs(totalSalesQty);
  const currentStockQty = normalizeQuantity(stockEggs);

  const bigStockEggs = bigEggs - bigSalesEggs;
  const smallStockEggs = smallEggs - smallSalesEggs;

  const stats = [
    {
      label: 'Total Production',
      sublabel: 'All-time egg collection',
      value: formatCompactNumber(totalProductionQty),
      unit: 'Trays',
      href: '/admin/godown/production',
      linkLabel: 'Manage Production',
      bg: 'var(--green-light)',
      accent: '#4A7C2F',
    },
    {
      label: 'Total Sales',
      sublabel: 'All-time eggs sold',
      value: formatCompactNumber(totalSalesQty),
      unit: 'Trays',
      href: '/admin/godown/sales',
      linkLabel: 'Manage Sales',
      bg: 'var(--champagne)',
      accent: '#A05A2C',
    },
    {
      label: 'Current Stock',
      sublabel: 'Production minus sales',
      value: formatCompactNumber(currentStockQty),
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

      {/* 3 Columns Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Column 1: Production */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
          {/* Divider Line */}
          <div style={{ position: 'absolute', right: '-12px', top: 0, bottom: 0, width: '1px', background: 'var(--border)' }} />
          {/* Main Card */}
          <div className="animate-fadeup" style={{ background: stats[0].bg, borderRadius: 'var(--radius-xl)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: 20, bottom: 20, display: 'flex', alignItems: 'flex-end', gap: 4, opacity: 0.18 }}>
              {[40, 65, 45, 80, 55, 90, 70].map((h, j) => (
                <div key={j} style={{ width: 6, height: h * 0.6, background: stats[0].accent, borderRadius: 3 }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: stats[0].accent }}>{stats[0].label}</p>
              <span style={{ fontSize: '11px', fontWeight: 600, background: 'rgba(0,0,0,0.08)', color: stats[0].accent, padding: '2px 8px', borderRadius: '99px' }}>All Time</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
              <span style={{ fontSize: '38px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>{stats[0].value}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', opacity: 0.8, flexShrink: 0 }}>Trays</span>
            </div>
            <p style={{ fontSize: '12px', color: stats[0].accent, fontWeight: 500 }}>{stats[0].sublabel}</p>
            {stats[0].href && (
              <Link href={stats[0].href} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: '20px', fontSize: '12px', fontWeight: 600, color: stats[0].accent, textDecoration: 'none', opacity: 0.85 }}>
                {stats[0].linkLabel} <ArrowRight size={13} />
              </Link>
            )}
          </div>
          {/* Breakdown Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {[
              { label: 'Good Eggs', val: formatCompactNumber(normalizeQuantity(goodEggs)), bg: 'var(--green-light)', accent: '#3E6B22' },
              { label: 'Damaged', val: formatCompactNumber(normalizeQuantity(damagedEggs)), bg: 'var(--pink)', accent: '#8B2E2E' },
              { label: 'Big Eggs', val: formatCompactNumber(normalizeQuantity(bigEggs)), bg: '#E0F2FE', accent: '#0369A1' },
              { label: 'Small Eggs', val: formatCompactNumber(normalizeQuantity(smallEggs)), bg: '#FEF3C7', accent: '#B45309' },
            ].map(c => (
              <div key={c.label} className="animate-fadeup" style={{ background: c.bg, borderRadius: 'var(--radius-lg)', padding: '16px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: c.accent, marginBottom: '8px' }}>{c.label}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em', margin: 0 }}>{c.val}</p>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Trays</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Sales */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
          {/* Divider Line */}
          <div style={{ position: 'absolute', right: '-12px', top: 0, bottom: 0, width: '1px', background: 'var(--border)' }} />
          {/* Main Card */}
          <div className="animate-fadeup" style={{ background: stats[1].bg, borderRadius: 'var(--radius-xl)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: 20, bottom: 20, display: 'flex', alignItems: 'flex-end', gap: 4, opacity: 0.18 }}>
              {[40, 65, 45, 80, 55, 90, 70].map((h, j) => (
                <div key={j} style={{ width: 6, height: h * 0.6, background: stats[1].accent, borderRadius: 3 }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: stats[1].accent }}>{stats[1].label}</p>
              <span style={{ fontSize: '11px', fontWeight: 600, background: 'rgba(0,0,0,0.08)', color: stats[1].accent, padding: '2px 8px', borderRadius: '99px' }}>All Time</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
              <span style={{ fontSize: '38px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>{stats[1].value}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', opacity: 0.8, flexShrink: 0 }}>Trays</span>
            </div>
            <p style={{ fontSize: '12px', color: stats[1].accent, fontWeight: 500 }}>{stats[1].sublabel}</p>
            {stats[1].href && (
              <Link href={stats[1].href} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: '20px', fontSize: '12px', fontWeight: 600, color: stats[1].accent, textDecoration: 'none', opacity: 0.85 }}>
                {stats[1].linkLabel} <ArrowRight size={13} />
              </Link>
            )}
          </div>
          {/* Breakdown Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {[
              { label: 'Big Sold', val: formatCompactNumber(normalizeQuantity(bigSalesEggs)), bg: '#E0F2FE', accent: '#0369A1' },
              { label: 'Small Sold', val: formatCompactNumber(normalizeQuantity(smallSalesEggs)), bg: '#FEF3C7', accent: '#B45309' },
            ].map(c => (
              <div key={c.label} className="animate-fadeup" style={{ background: c.bg, borderRadius: 'var(--radius-lg)', padding: '16px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: c.accent, marginBottom: '8px' }}>{c.label}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em', margin: 0 }}>{c.val}</p>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Trays</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Stock */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Main Card */}
          <div className="animate-fadeup" style={{ background: stats[2].bg, borderRadius: 'var(--radius-xl)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: 20, bottom: 20, display: 'flex', alignItems: 'flex-end', gap: 4, opacity: 0.18 }}>
              {[40, 65, 45, 80, 55, 90, 70].map((h, j) => (
                <div key={j} style={{ width: 6, height: h * 0.6, background: stats[2].accent, borderRadius: 3 }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: stats[2].accent }}>{stats[2].label}</p>
              <span style={{ fontSize: '11px', fontWeight: 600, background: 'rgba(0,0,0,0.08)', color: stats[2].accent, padding: '2px 8px', borderRadius: '99px' }}>Current</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
              <span style={{ fontSize: '38px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>{stats[2].value}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', opacity: 0.8, flexShrink: 0 }}>Trays</span>
            </div>
            <p style={{ fontSize: '12px', color: stats[2].accent, fontWeight: 500 }}>{stats[2].sublabel}</p>
            {stats[2].href ? (
              <Link href={stats[2].href} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: '20px', fontSize: '12px', fontWeight: 600, color: stats[2].accent, textDecoration: 'none', opacity: 0.85 }}>
                {stats[2].linkLabel} <ArrowRight size={13} />
              </Link>
            ) : (
              <div style={{ marginTop: '20px', height: '18px' }} />
            )}
          </div>
          {/* Breakdown Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {[
              { label: 'Big Stock', val: formatCompactNumber(normalizeQuantity(bigStockEggs)), bg: '#E0F2FE', accent: '#0369A1' },
              { label: 'Small Stock', val: formatCompactNumber(normalizeQuantity(smallStockEggs)), bg: '#FEF3C7', accent: '#B45309' },
            ].map(c => (
              <div key={c.label} className="animate-fadeup" style={{ background: c.bg, borderRadius: 'var(--radius-lg)', padding: '16px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: c.accent, marginBottom: '8px' }}>{c.label}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em', margin: 0 }}>{c.val}</p>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Trays</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '16px' }} className="animate-fadeup">
        {[
          { label: 'Record Production', desc: "Add today's egg collection by shed", href: '/admin/godown/production' },
          { label: 'Record Sales', desc: 'Log eggs sold to buyers', href: '/admin/godown/sales' },
          { label: 'View Dashboard', desc: 'Analytics and trends', href: '/admin/dashboard' },
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

