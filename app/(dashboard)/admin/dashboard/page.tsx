'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatQuantityDisplay } from '@/lib/quantity-utils';
import Link from 'next/link';
import CustomSelect from '@/components/ui/CustomSelect';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState('7d');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/dashboard?period=${chartPeriod}`);
        if (res.ok) setData(await res.json());
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
      setIsLoading(false);
    })();
  }, [chartPeriod]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{
          width: 36, height: 36, border: '3px solid var(--green-light)', borderTopColor: 'var(--primary)',
          borderRadius: '50%', animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
        Failed to load dashboard data.
      </div>
    );
  }

  const { metrics, chartData, recentProduction, recentSales } = data;

  const metricCards = [
    {
      label: 'Good Eggs',
      sublabel: 'Today',
      today: formatQuantityDisplay(metrics.goodEggs.today),
      allTime: formatQuantityDisplay(metrics.goodEggs.allTime),
      bg: 'var(--green-light)',
      accent: '#3E6B22',
      barH: [50, 70, 45, 80, 60, 90, 75],
    },
    {
      label: 'Bad Eggs',
      sublabel: 'Today',
      today: formatQuantityDisplay(metrics.badEggs.today),
      allTime: formatQuantityDisplay(metrics.badEggs.allTime),
      bg: 'var(--pink)',
      accent: '#8B2E2E',
      barH: [40, 55, 30, 60, 45, 35, 50],
    },
    {
      label: 'Sales Qty',
      sublabel: 'Today',
      today: formatQuantityDisplay(metrics.salesQty.today),
      allTime: formatQuantityDisplay(metrics.salesQty.allTime),
      bg: 'var(--champagne)',
      accent: '#8B4A1A',
      barH: [60, 40, 75, 50, 80, 65, 55],
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: '28px' }} className="animate-fadeup">
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Dashboard
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Overview of egg production trends and sales activity.
        </p>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {metricCards.map((card, i) => (
          <div
            key={card.label}
            className={`animate-fadeup-${i + 2}`}
            style={{ background: card.bg, borderRadius: 'var(--radius-xl)', padding: '22px 24px', position: 'relative', overflow: 'hidden' }}
          >
            {/* Mini bar decoration */}
            <div style={{ position: 'absolute', right: 18, bottom: 16, display: 'flex', alignItems: 'flex-end', gap: 3, opacity: 0.15 }}>
              {card.barH.map((h, j) => (
                <div key={j} style={{ width: 5, height: h * 0.55, background: card.accent, borderRadius: 3 }} />
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: card.accent }}>{card.label}</p>
              <span style={{ fontSize: '11px', fontWeight: 600, background: 'rgba(0,0,0,0.08)', color: card.accent, padding: '2px 8px', borderRadius: 99 }}>
                Today
              </span>
            </div>

            <p style={{ fontSize: '34px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '6px' }}>
              {card.today}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <span style={{ fontSize: '11px', color: card.accent, fontWeight: 500 }}>All Time</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: card.accent }}>{card.allTime}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', alignItems: 'stretch' }} className="animate-fadeup-4">
        {/* Chart */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Production Trends
            </p>
            <CustomSelect
              value={chartPeriod}
              onChange={(val) => setChartPeriod(val)}
              options={[
                { value: '7d', label: 'Last 7 Days' },
                { value: '1m', label: '1 Month' },
                { value: '3m', label: '3 Months' },
                { value: '6m', label: '6 Months' },
                { value: '1y', label: '1 Year' },
                { value: '5y', label: '5 Years' },
              ]}
              style={{ width: '130px' }}
            />
          </div>
          <div style={{ flex: 1, minHeight: 280 }}>
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={4}>
                  <CartesianGrid strokeDasharray="0" vertical={false} stroke="var(--border-light)" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={false}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'var(--grey-bg)', rx: 6 }}
                    contentStyle={{
                      borderRadius: 10,
                      border: 'none',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="good" name="Good Eggs" fill="#C8F096" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="bad"  name="Bad Eggs"  fill="#FFB0B0" radius={[6, 6, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No production data yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Production */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Production</p>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {recentProduction.length > 0 ? recentProduction.map((item: any, i: number) => (
              <div key={i} style={{
                padding: '12px 20px',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 8,
              }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.location}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>
                    {item.date ? new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                    background: 'var(--green-light)', color: '#3E6B22',
                  }}>
                    ✓ {formatQuantityDisplay(item.goodQuantity)}
                  </span>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                    background: 'var(--pink)', color: '#8B2E2E',
                  }}>
                    ✗ {formatQuantityDisplay(item.badQuantity)}
                  </span>
                </div>
              </div>
            )) : (
              <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>No recent production</div>
            )}
          </div>
          {recentProduction.length > 0 && (
            <Link href="/admin/godown/production" style={{ marginTop: 'auto', display: 'block', padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', borderTop: '1px solid var(--border-light)' }}>
              Show more
            </Link>
          )}
        </div>

        {/* Recent Sales */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Sales</p>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {recentSales.length > 0 ? recentSales.map((item: any) => (
              <div key={item.id} style={{
                padding: '12px 20px',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>
                    {item.date ? new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
                  </p>
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: 99,
                  background: 'var(--champagne)',
                  color: '#8B4A1A',
                }}>
                  {formatQuantityDisplay(item.quantity)} Trays
                </span>
              </div>
            )) : (
              <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>No recent sales</div>
            )}
          </div>
          {recentSales.length > 0 && (
            <Link href="/admin/godown/sales" style={{ marginTop: 'auto', display: 'block', padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', borderTop: '1px solid var(--border-light)' }}>
              Show more
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
