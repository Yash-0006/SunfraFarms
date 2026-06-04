'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { formatQuantityDisplay } from '@/lib/quantity-utils';

export default function SalesPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [name, setName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [quantityInput, setQuantityInput] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sales');
      if (res.ok) setData(await res.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setName(item.name);
      setRemarks(item.remarks ?? '');
      setQuantityInput(item.quantity.toString());
    } else {
      setEditingId(null);
      setName('');
      setRemarks('');
      setQuantityInput('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { id: editingId, name, remarks, quantity: quantityInput };
    try {
      const res = await fetch('/api/sales', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) { setIsModalOpen(false); fetchData(); }
      else alert('Failed to save data');
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this sale record?')) return;
    try {
      const res = await fetch('/api/sales', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) fetchData(); else alert('Failed to delete');
    } catch (error) { console.error(error); }
  };

  const filteredData = data.filter(row =>
    row.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }} className="animate-fadeup">
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Egg Sales</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Record and manage egg sales to customers.</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={16} />
          Record Sale
        </button>
      </div>

      {/* Table card */}
      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }} className="animate-fadeup-2">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', width: 260 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input"
              style={{ paddingLeft: 32 }}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search buyer…"
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Buyer Name</th>
                <th style={{ textAlign: 'right' }}>Quantity (Trays.Eggs)</th>
                <th>Remarks</th>
                <th>Date</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading…</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  {searchQuery ? 'No buyers match your search.' : 'No sales records found.'}
                </td></tr>
              ) : filteredData.map((row) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 600 }}>{row.name}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 12px',
                      borderRadius: 99,
                      fontSize: '12px',
                      fontWeight: 700,
                      background: 'var(--champagne)',
                      color: '#8B4A1A',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {formatQuantityDisplay(row.quantity)}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{row.remarks || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {row.date_added ? new Date(row.date_added).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
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
                      onClick={() => handleDelete(row.id)}
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
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 420, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {editingId ? 'Edit Sale' : 'Record Sale'}
              </p>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Buyer Name</label>
                <input className="input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Quantity (Trays.Eggs)</label>
                <input className="input" type="number" step="0.01" value={quantityInput} onChange={e => setQuantityInput(e.target.value)} placeholder="e.g. 5.15" required />
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>1 tray = 30 eggs. e.g. 5.15 = 5 trays + 15 eggs</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Remarks</label>
                <input className="input" type="text" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="e.g. Paid in cash" />
              </div>
              <div style={{ display: 'flex', gap: 10, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save Sale</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
