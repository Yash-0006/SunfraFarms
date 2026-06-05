'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatQuantityDisplay, formatCompactNumber, getDynamicFontSize, formatTraysLooseDisplay } from '@/lib/quantity-utils';
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
      <div className="page-loader">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>Loading dashboard...</p>
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

  let { metrics, chartData, recentProduction, recentSales } = data;

  const totalEggs = {
    today: metrics.goodEggs.today + metrics.damagedEggs.today + metrics.bigEggs.today + metrics.smallEggs.today,
    allTime: metrics.goodEggs.allTime + metrics.damagedEggs.allTime + metrics.bigEggs.allTime + metrics.smallEggs.allTime,
  };

  const metricCards = [
    { label: 'Total Production', today: formatCompactNumber(totalEggs.today), allTime: formatCompactNumber(totalEggs.allTime), bg: 'var(--white)', accent: 'var(--primary)', barH: [30, 45, 20, 60, 40, 70, 50, 80] },
    { label: 'Good Eggs', today: formatCompactNumber(metrics.goodEggs.today), allTime: formatCompactNumber(metrics.goodEggs.allTime), bg: 'var(--green-light)', accent: '#3E6B22', barH: [20, 30, 25, 40, 30, 50, 40, 60] },
    { label: 'Damaged Eggs', today: formatCompactNumber(metrics.damagedEggs.today), allTime: formatCompactNumber(metrics.damagedEggs.allTime), bg: 'var(--pink)', accent: '#8B2E2E', barH: [10, 15, 12, 20, 15, 25, 20, 30] },
    { label: 'Big Eggs', today: formatCompactNumber(metrics.bigEggs.today), allTime: formatCompactNumber(metrics.bigEggs.allTime), bg: '#E0F2FE', accent: '#0369A1', barH: [25, 35, 20, 50, 30, 60, 40, 70] },
    { label: 'Small Eggs', today: formatCompactNumber(metrics.smallEggs.today), allTime: formatCompactNumber(metrics.smallEggs.allTime), bg: '#FEF3C7', accent: '#B45309', barH: [25, 35, 20, 50, 30, 60, 40, 70] },
    { label: 'Sales Qty', today: formatCompactNumber(metrics.salesQty.today), allTime: formatCompactNumber(metrics.salesQty.allTime), bg: 'var(--champagne)', accent: '#8B4A1A', barH: [25, 35, 20, 50, 30, 60, 40, 70] },
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

      {/* Removed Metric cards as per layout change */}

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px', alignItems: 'stretch', marginBottom: '24px' }} className="animate-fadeup">
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
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C8F096" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#C8F096" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDamaged" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFB0B0" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FFB0B0" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBig" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#BAE6FD" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#BAE6FD" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSmall" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FDE68A" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FDE68A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="0" vertical={false} stroke="var(--border-light)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={false} dy={8} />
                  <YAxis axisLine={false} tickLine={false} width={45} tickFormatter={formatCompactNumber} tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }} />
                  <Tooltip itemSorter={(item) => { const order: any = { good: 1, damaged: 2, big: 3, small: 4 }; return order[item.dataKey as string] || 0; }} labelFormatter={(label) => { if (typeof label === 'string' && label.split('-').length === 3) { const parts = label.split('-'); return `${parts[2]}-${parts[1]}-${parts[0]}`; } return label; }} cursor={{ fill: 'var(--grey-bg)', rx: 6 }} contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontFamily: 'DM Sans, sans-serif', fontSize: 12 }} />
                  <Area type="linear" dataKey="good" name="Good Eggs" stroke="#3E6B22" strokeWidth={2} fill="url(#colorGood)" />
                  <Area type="linear" dataKey="damaged" name="Damaged Eggs" stroke="#8B2E2E" strokeWidth={2} fill="url(#colorDamaged)" />
                  <Area type="linear" dataKey="big" name="Big Eggs" stroke="#0369A1" strokeWidth={2} fill="url(#colorBig)" />
                  <Area type="linear" dataKey="small" name="Small Eggs" stroke="#B45309" strokeWidth={2} fill="url(#colorSmall)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No production data yet.
              </div>
            )}
          </div>
        </div>

        {/* Sales Trends Chart */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Sales Trends
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
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBigSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#BAE6FD" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#BAE6FD" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSmallSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FDE68A" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FDE68A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="0" vertical={false} stroke="var(--border-light)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={false} dy={8} />
                  <YAxis axisLine={false} tickLine={false} width={45} tickFormatter={formatCompactNumber} tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }} />
                  <Tooltip itemSorter={(item) => { const order: any = { bigSales: 1, smallSales: 2 }; return order[item.dataKey as string] || 0; }} labelFormatter={(label) => { if (typeof label === 'string' && label.split('-').length === 3) { const parts = label.split('-'); return `${parts[2]}-${parts[1]}-${parts[0]}`; } return label; }} cursor={{ fill: 'var(--grey-bg)', rx: 6 }} contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontFamily: 'DM Sans, sans-serif', fontSize: 12 }} />
                  <Area type="linear" dataKey="bigSales" name="Big Eggs Sold" stroke="#0369A1" strokeWidth={3} fill="url(#colorBigSales)" />
                  <Area type="linear" dataKey="smallSales" name="Small Eggs Sold" stroke="#B45309" strokeWidth={3} fill="url(#colorSmallSales)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No sales data yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', alignItems: 'stretch' }} className="animate-fadeup">
        {/* Recent Production */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Production</p>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {recentProduction.length > 0 ? recentProduction.map((item: any, i: number) => (
              <div key={i} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.location}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>
                    {item.date ? (() => { const d = new Date(item.date); return isNaN(d.getTime()) ? '—' : `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`; })() : '—'}
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, max-content)', gap: '6px', justifyContent: 'end' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: 'var(--green-light)', color: '#3E6B22', textAlign: 'center' }}>
                    Good: {formatTraysLooseDisplay(item.goodQuantity)}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: 'var(--pink)', color: '#8B2E2E', textAlign: 'center' }}>
                    Damaged: {formatTraysLooseDisplay(item.damagedQuantity)}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: '#E0F2FE', color: '#0369A1', textAlign: 'center' }}>
                    Big: {formatTraysLooseDisplay(item.bigQuantity)}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: '#FEF3C7', color: '#B45309', textAlign: 'center' }}>
                    Small: {formatTraysLooseDisplay(item.smallQuantity)}
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
              <div key={item.id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>
                    {item.date ? (() => { const d = new Date(item.date); return isNaN(d.getTime()) ? '—' : `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`; })() : '—'}
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, max-content)', gap: '6px', justifyContent: 'end' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: '#E0F2FE', color: '#0369A1' }}>
                    Big: {formatTraysLooseDisplay(item.big_quantity)}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: '#FEF3C7', color: '#B45309' }}>
                    Small: {formatTraysLooseDisplay(item.small_quantity)}
                  </span>
                </div>
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
