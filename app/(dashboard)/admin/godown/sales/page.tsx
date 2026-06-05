'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, Calendar } from 'lucide-react';
import CustomDatePicker from '@/components/CustomDatePicker';
import { formatQuantityDisplay, formatTraysLooseDisplay } from '@/lib/quantity-utils';
import CustomSelect from '@/components/ui/CustomSelect';
import { useAiPageContext } from '@/components/AiPageContext';
import { useRouter } from 'next/navigation';

export default function SalesPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('today');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const aiContext = useAiPageContext();
  const router = useRouter();

  const [name, setName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [bigTrays, setBigTrays] = useState('');
  const [bigLoose, setBigLoose] = useState('');
  const [smallTrays, setSmallTrays] = useState('');
  const [smallLoose, setSmallLoose] = useState('');

  const fetchData = async (dateStr?: string, periodStr?: string) => {
    setIsLoading(true);
    try {
      let url = '/api/sales';
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

  // Check for pending form fill on mount
  useEffect(() => {
    const pending = sessionStorage.getItem('pending_form_fill');
    if (pending) {
      try {
        const action = JSON.parse(pending);
        if (action.formType === 'sale') {
          sessionStorage.removeItem('pending_form_fill');
          setTimeout(() => {
            const f = action.fields;
            if (f.name) setName(f.name);
            if (f.bigTrays) setBigTrays(f.bigTrays);
            if (f.bigLoose) setBigLoose(f.bigLoose);
            if (f.smallTrays) setSmallTrays(f.smallTrays);
            if (f.smallLoose) setSmallLoose(f.smallLoose);
            if (f.remarks) setRemarks(f.remarks);
            setEditingId(null);
            setIsModalOpen(true);
          }, 100);
        }
      } catch (e) {}
    }
  }, []);

  // Register AI context integrations
  useEffect(() => {
    aiContext.registerDataRefresher(() => fetchData(dateFilter, periodFilter));
    aiContext.registerNavigator((url: string) => router.push(url));
    aiContext.registerFormFiller((action) => {
      if (action.formType === 'sale') {
        const f = action.fields;
        if (f.name) setName(f.name);
        if (f.bigTrays) setBigTrays(f.bigTrays);
        if (f.bigLoose) setBigLoose(f.bigLoose);
        if (f.smallTrays) setSmallTrays(f.smallTrays);
        if (f.smallLoose) setSmallLoose(f.smallLoose);
        if (f.remarks) setRemarks(f.remarks);
        setEditingId(null);
        setIsModalOpen(true);
      }
    });
  }, [dateFilter, periodFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFilter, periodFilter]);

  const setTraysLoose = (qty: number, setT: any, setL: any) => {
    if (!qty) { setT(''); setL(''); return; }
    const total = Math.round(qty * 100);
    const trays = Math.floor(qty);
    const loose = total - (trays * 100);
    setT(trays > 0 ? trays.toString() : '');
    setL(loose > 0 ? loose.toString() : '');
  };

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setName(item.name);
      setRemarks(item.remarks ?? '');
      setTraysLoose(item.big_quantity, setBigTrays, setBigLoose);
      setTraysLoose(item.small_quantity, setSmallTrays, setSmallLoose);
    } else {
      setEditingId(null);
      setName('');
      setRemarks('');
      setBigTrays(''); setBigLoose('');
      setSmallTrays(''); setSmallLoose('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const getQty = (t: string, l: string) => {
      const trays = parseInt(t) || 0;
      const loose = parseInt(l) || 0;
      if (trays === 0 && loose === 0) return '';
      return (trays + (loose / 100)).toFixed(2);
    };

    const bigQtyStr = getQty(bigTrays, bigLoose);
    const smallQtyStr = getQty(smallTrays, smallLoose);
    
    if (!bigQtyStr && !smallQtyStr) {
      alert('Please enter at least one quantity');
      return;
    }

    const payload = { id: editingId, name, remarks, bigQuantity: bigQtyStr, smallQuantity: smallQtyStr };
    try {
      const res = await fetch('/api/sales', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) { setIsModalOpen(false); fetchData(dateFilter, periodFilter); }
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
      if (res.ok) fetchData(dateFilter, periodFilter); else alert('Failed to delete');
    } catch (error) { console.error(error); }
  };

  const filteredData = data.filter(row =>
    row.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }} className="animate-fadeup">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 260, maxWidth: '100%' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input"
              style={{ paddingLeft: 36 }}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search buyer…"
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
            <CustomDatePicker 
              value={dateFilter} 
              onChange={(val) => {
                setDateFilter(val);
                setPeriodFilter('');
              }} 
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Buyer Name</th>
                <th style={{ textAlign: 'center' }}>Big Quantity</th>
                <th style={{ textAlign: 'center' }}>Small Quantity</th>
                <th>Remarks</th>
                <th>Date</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div className="spinner" />
                      <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading sales records...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  {searchQuery ? 'No buyers match your search.' : 'No sales records found.'}
                </td></tr>
              ) : paginatedData.map((row) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 600 }}>{row.name}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 12px',
                      borderRadius: 99,
                      fontSize: '12px',
                      fontWeight: 700,
                      background: '#E0F2FE',
                      color: '#0369A1',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {formatTraysLooseDisplay(row.big_quantity)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 12px',
                      borderRadius: 99,
                      fontSize: '12px',
                      fontWeight: 700,
                      background: '#FEF3C7',
                      color: '#B45309',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {formatTraysLooseDisplay(row.small_quantity)}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{row.remarks || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {row.date ? (() => { const d = new Date(row.date); return isNaN(d.getTime()) ? '—' : `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`; })() : '—'}
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length} entries
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn-ghost" 
                style={{ padding: '6px 12px', fontSize: '13px' }} 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', fontSize: '13px', fontWeight: 600, background: 'var(--grey-bg)', borderRadius: '6px' }}>
                {currentPage}
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
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Big Eggs Quantity</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <input className="input" style={{ flex: 1 }} type="number" min="0" value={bigTrays} onChange={e => setBigTrays(e.target.value)} placeholder="Big Trays" />
                  <input className="input" style={{ flex: 1 }} type="number" min="0" max="29" value={bigLoose} onChange={e => setBigLoose(e.target.value)} placeholder="Big Loose" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Small Eggs Quantity</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <input className="input" style={{ flex: 1 }} type="number" min="0" value={smallTrays} onChange={e => setSmallTrays(e.target.value)} placeholder="Small Trays" />
                  <input className="input" style={{ flex: 1 }} type="number" min="0" max="29" value={smallLoose} onChange={e => setSmallLoose(e.target.value)} placeholder="Small Loose" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>1 tray = 30 eggs.</p>
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
