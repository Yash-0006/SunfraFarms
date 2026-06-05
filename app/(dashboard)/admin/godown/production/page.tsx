'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Calendar } from 'lucide-react';
import { formatQuantityDisplay } from '@/lib/quantity-utils';
import CustomSelect from '@/components/ui/CustomSelect';

export default function ProductionPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('today');

  const [location, setLocation] = useState('');
  const [goodQuantityInput, setGoodQuantityInput] = useState('');
  const [badQuantityInput, setBadQuantityInput] = useState('');

  const fetchData = async (dateStr?: string, periodStr?: string) => {
    setIsLoading(true);
    try {
      let url = '/api/production';
      const params = new URLSearchParams();
      if (dateStr) params.set('date', dateStr);
      else if (periodStr) params.set('period', periodStr);
      
      const q = params.toString();
      if (q) url += `?${q}`;

      const res = await fetch(url);
      if (res.ok) setData(await res.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchData(dateFilter, periodFilter); }, [dateFilter, periodFilter]);

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingLocation(item.location);
      setLocation(item.location);
      setGoodQuantityInput(item.goodQuantity?.toString() ?? '');
      setBadQuantityInput(item.badQuantity?.toString() ?? '');
    } else {
      setEditingLocation(null);
      setLocation('');
      setGoodQuantityInput('');
      setBadQuantityInput('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { oldLocation: editingLocation, location, goodQuantity: goodQuantityInput, badQuantity: badQuantityInput };
    try {
      const res = await fetch('/api/production', {
        method: editingLocation ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) { setIsModalOpen(false); fetchData(dateFilter, periodFilter); }
      else alert('Failed to save data');
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (locationName: string) => {
    if (!window.confirm(`Delete all records for ${locationName}?`)) return;
    try {
      const res = await fetch('/api/production', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: locationName }),
      });
      if (res.ok) fetchData(dateFilter, periodFilter); else alert('Failed to delete');
    } catch (error) { console.error(error); }
  };

  const filteredData = data.filter(row =>
    row.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }} className="animate-fadeup">
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Egg Production</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Manage daily egg collection grouped by location.</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={16} />
          Add Record
        </button>
      </div>

      {/* Table card */}
      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }} className="animate-fadeup-2">
        {/* Search bar */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 260, maxWidth: '100%' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input"
              style={{ paddingLeft: 36 }}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search location…"
            />
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <CustomSelect
              value={periodFilter}
              onChange={(val) => {
                setPeriodFilter(val);
                setDateFilter('');
              }}
              options={[
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'year', label: 'This Year' },
                { value: 'all', label: 'All Time' },
              ]}
              style={{ width: '130px' }}
            />
            <div style={{ position: 'relative', width: 140 }}>
              <Calendar size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input 
                type="date" 
                className="input date-picker-custom" 
                style={{ paddingLeft: 36, width: '100%', cursor: 'pointer', height: '36px' }} 
                value={dateFilter} 
                onChange={e => {
                  setDateFilter(e.target.value);
                  setPeriodFilter('');
                }} 
              />
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Location / Shed</th>
                <th style={{ textAlign: 'right' }}>Good Eggs</th>
                <th style={{ textAlign: 'right' }}>Bad Eggs</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading…</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  {searchQuery ? 'No locations match your search.' : 'No production records found.'}
                </td></tr>
              ) : filteredData.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{row.location}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 12px',
                      borderRadius: 99,
                      fontSize: '12px',
                      fontWeight: 700,
                      background: 'var(--green-light)',
                      color: '#3E6B22',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {formatQuantityDisplay(row.goodQuantity)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 12px',
                      borderRadius: 99,
                      fontSize: '12px',
                      fontWeight: 700,
                      background: 'var(--pink)',
                      color: '#8B2E2E',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {formatQuantityDisplay(row.badQuantity)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => handleOpenModal(row)}
                      title="Edit"
                      style={{ padding: '6px 8px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', transition: 'background 0.15s, color 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--grey-bg)'; (e.currentTarget as HTMLElement).style.color = 'var(--primary)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(row.location)}
                      title="Delete"
                      style={{ padding: '6px 8px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', transition: 'background 0.15s, color 0.15s', marginLeft: 4 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FFF0F0'; (e.currentTarget as HTMLElement).style.color = '#EF4444'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(19,23,31,0.5)', backdropFilter: 'blur(6px)',
          zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 440, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {editingLocation ? 'Edit Location' : 'Add Production Record'}
              </p>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Location / Shed</label>
                <input className="input" type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Shed A" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#3E6B22', marginBottom: 6 }}>Good Eggs Qty</label>
                  <input
                    className="input"
                    style={{ borderColor: '#C8F096', background: 'var(--green-light)' }}
                    type="number" step="0.01" value={goodQuantityInput}
                    onChange={e => setGoodQuantityInput(e.target.value)}
                    placeholder="Trays.Eggs"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#8B2E2E', marginBottom: 6 }}>Bad Eggs Qty</label>
                  <input
                    className="input"
                    style={{ borderColor: '#FFB0B0', background: 'var(--pink)' }}
                    type="number" step="0.01" value={badQuantityInput}
                    onChange={e => setBadQuantityInput(e.target.value)}
                    placeholder="Trays.Eggs"
                  />
                </div>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Format: Trays.Eggs — e.g. 1.30 = 1 Tray + 30 Eggs (1 tray = 30 eggs). Leave blank if 0.
              </p>
              <div style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Records</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
