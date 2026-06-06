'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, User } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

interface Worker {
  id: number;
  name: string;
  mobile: string;
  aadhar: string;
  reference: string;
  status: 'active' | 'inactive';
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

export default function LabourRegistrationPage() {
  const toast = useToast();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Form fields
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [reference, setReference] = useState('');
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchWorkers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/labour');
      if (res.ok) setWorkers(await res.json());
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchWorkers(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const openModal = (worker?: Worker) => {
    if (worker) {
      setEditingId(worker.id);
      setName(worker.name);
      setMobile(worker.mobile);
      setAadhar(worker.aadhar);
      setReference(worker.reference || '');
    } else {
      setEditingId(null);
      setName(''); setMobile(''); setAadhar(''); setReference('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSaving(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // status is not included — status is toggled directly in the table
    const payload = { id: editingId, name, mobile, aadhar, reference, status: editingId
      ? workers.find(w => w.id === editingId)?.status ?? 'active'
      : 'active' };
    try {
      const res = await fetch('/api/labour', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) { 
        closeModal(); 
        fetchWorkers();
        toast.success(editingId ? 'Worker updated successfully!' : 'Worker registered successfully!');
      }
      else toast.error('Failed to save worker');
    } catch (e) { 
      console.error(e); 
      toast.error('An error occurred');
    }
    setSaving(false);
  };

  const handleToggleStatus = async (worker: Worker) => {
    if (togglingId === worker.id) return;
    const newStatus = worker.status === 'active' ? 'inactive' : 'active';
    // Optimistic update
    setWorkers(prev => prev.map(w => w.id === worker.id ? { ...w, status: newStatus } : w));
    setTogglingId(worker.id);
    try {
      await fetch('/api/labour', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...worker, status: newStatus }),
      });
    } catch (e) {
      // Revert on error
      setWorkers(prev => prev.map(w => w.id === worker.id ? { ...w, status: worker.status } : w));
    }
    setTogglingId(null);
  };

  const handleDelete = async (id: number) => {
    toast.confirm({
      title: 'Delete Worker',
      message: 'Delete this worker? All their attendance records will also be deleted.',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/labour', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
          });
          if (res.ok) {
            fetchWorkers();
            toast.success('Worker deleted successfully');
          } else {
            toast.error('Failed to delete worker');
          }
        } catch (e) { 
          console.error(e); 
          toast.error('An error occurred');
        }
      }
    });
  };

  const filteredWorkers = workers.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.mobile.includes(searchQuery)
  );
  const totalPages = Math.ceil(filteredWorkers.length / ITEMS_PER_PAGE);
  const paginatedWorkers = filteredWorkers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Page header */}
      <div
        className="animate-fadeup"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}
      >
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Labour Registration</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Manage farm workers — register, update status and details.</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={16} />
          Add Worker
        </button>
      </div>

      {/* Table card */}
      <div className="animate-fadeup" style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        {/* Search bar */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input"
              style={{ paddingLeft: 36 }}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name or mobile…"
            />
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
            {filteredWorkers.length} worker{filteredWorkers.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Mobile No.</th>
                <th>Aadhar No.</th>
                <th>Reference</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div className="spinner" />
                      <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading workers…</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedWorkers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--grey-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={24} color="var(--text-muted)" />
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        {searchQuery ? 'No workers match your search.' : 'No workers registered yet. Add your first worker!'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : paginatedWorkers.map((worker, idx) => (
                <tr key={worker.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12, width: 48 }}>
                    {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                  </td>
                  <td style={{ fontWeight: 600 }}>{worker.name}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em' }}>{worker.mobile}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em', color: 'var(--text-muted)' }}>{worker.aadhar}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{worker.reference || '—'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => handleToggleStatus(worker)}
                      disabled={togglingId === worker.id}
                      title={`Click to mark as ${worker.status === 'active' ? 'Inactive' : 'Active'}`}
                      style={{
                        position: 'relative',
                        width: 44,
                        height: 24,
                        borderRadius: 99,
                        border: 'none',
                        cursor: togglingId === worker.id ? 'wait' : 'pointer',
                        background: worker.status === 'active' ? '#4ADE80' : 'var(--grey-bg-2)',
                        opacity: togglingId === worker.id ? 0.6 : 1,
                        transition: 'background 0.2s, opacity 0.15s',
                        flexShrink: 0,
                        display: 'inline-block',
                        verticalAlign: 'middle',
                      }}
                    >
                      <span style={{
                        position: 'absolute',
                        top: 3,
                        left: worker.status === 'active' ? 23 : 3,
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: '#fff',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                        transition: 'left 0.2s cubic-bezier(0.4,0,0.2,1)',
                        display: 'block',
                      }} />
                    </button>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => openModal(worker)}
                      title="Edit"
                      style={{ padding: '6px 8px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', transition: 'background 0.15s, color 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--grey-bg)'; (e.currentTarget as HTMLElement).style.color = 'var(--primary)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(worker.id)}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredWorkers.length)} of {filteredWorkers.length} workers
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: '13px' }} disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>Previous</button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', fontSize: '13px', fontWeight: 600, background: 'var(--grey-bg)', borderRadius: '6px', padding: '0 10px' }}>
                {currentPage}
              </div>
              <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: '13px' }} disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>Next</button>
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
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 440, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }}>
            {/* Modal header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {editingId ? 'Edit Worker' : 'Add New Worker'}
              </p>
              <button onClick={closeModal} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}>✕</button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Full Name *</label>
                <input className="input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ramesh Kumar" required />
              </div>

              {/* Mobile */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Mobile No. *</label>
                <input className="input" type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="e.g. 9876543210" required maxLength={15} />
              </div>

              {/* Aadhar */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Aadhar No. *</label>
                <input className="input" type="text" value={aadhar} onChange={e => setAadhar(e.target.value)} placeholder="e.g. 1234 5678 9012" required maxLength={20} />
              </div>

              {/* Reference */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Reference</label>
                <input className="input" type="text" value={reference} onChange={e => setReference(e.target.value)} placeholder="e.g. Referred by Suresh" />
              </div>


              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>
                  {saving ? 'Saving…' : (editingId ? 'Update Worker' : 'Add Worker')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
