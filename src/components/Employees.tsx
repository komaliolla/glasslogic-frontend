import React, { useState, useRef, useEffect } from 'react';
import { Users, X, Trash2, Plus, Check } from 'lucide-react';
import { api, type Employee } from '../api/client';

interface Props { onClose: () => void; }

const Employees: React.FC<Props> = ({ onClose }) => {
  const [query,      setQuery]      = useState('');
  const [employees,  setEmployees]  = useState<Employee[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [inserting,  setInserting]  = useState(false);
  const [draftId,    setDraftId]    = useState('');
  const [draftName,  setDraftName]  = useState('');
  const [draftHours, setDraftHours] = useState('');
  const [insertError, setInsertError] = useState<string | null>(null);
  const idInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { api.getEmployees().then(setEmployees).catch(() => {}); }, []);
  useEffect(() => { if (inserting) idInputRef.current?.focus(); }, [inserting]);

  const filtered = query.trim()
    ? employees.filter(e => e.name.toLowerCase().includes(query.trim().toLowerCase()))
    : employees;

  const confirmInsert = () => {
    const id = parseInt(draftId, 10);
    const trimmedName = draftName.trim().toUpperCase();
    if (!draftId.trim() || Number.isNaN(id) || id <= 0) { setInsertError('Enter a valid Employee ID'); return; }
    if (!trimmedName) { setInsertError('Enter an employee name'); return; }
    if (employees.some(e => e.id === id)) { setInsertError('Employee ID already exists'); return; }

    const hours = parseFloat(draftHours) || 0;
    api.createEmployee({ id, name: trimmedName, total_working_hours: hours }).then(created => {
      setEmployees(prev => [...prev, created]);
      cancelInsert();
    }).catch(err => setInsertError(err.message ?? 'Failed to add employee'));
  };

  const cancelInsert = () => {
    setDraftId(''); setDraftName(''); setDraftHours(''); setInsertError(null); setInserting(false);
  };

  const handleDelete = () => {
    if (selectedId === null) return;
    api.deleteEmployee(selectedId).then(() => {
      setEmployees(prev => prev.filter(e => e.id !== selectedId));
      setSelectedId(null);
    }).catch(() => {});
  };

  return (
    <div style={st.card}>

      {/* ── Header ── */}
      <div style={st.header}>
        <div style={st.headerLeft}>
          <div style={st.headerIcon}><Users size={20} color="#fff" /></div>
          <div>
            <div style={st.headerTitle}>Employees</div>
            <div style={st.headerSub}>Manage employees and their working hours</div>
          </div>
        </div>
        <button style={st.closeBtn} onClick={onClose}><X size={18} color="#fff" /></button>
      </div>

      {/* ── Body ── */}
      <div style={st.body}>

        {/* Search */}
        <div style={st.searchSection}>
          <label style={st.searchLabel}>Search:</label>
          <input
            style={st.searchInput}
            placeholder="Enter employee name..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div style={st.actions}>
          <button style={st.btnInsert} onClick={() => { setInserting(true); setSelectedId(null); }}>
            <Plus size={14} color="#fff" /> Insert
          </button>
          <button
            style={{ ...st.btnOutline, ...st.btnDelete, opacity: selectedId === null ? 0.45 : 1 }}
            onClick={handleDelete}
            disabled={selectedId === null}
          >
            <Trash2 size={14} color="#ef4444" />
            <span style={{ color: '#ef4444' }}>Delete</span>
          </button>
        </div>

        {/* Table */}
        <div style={st.tableWrapper}>
          <table style={st.table}>
            <thead>
              <tr style={st.tableHead}>
                <th style={{ ...st.th, width: 120 }}>Employee ID</th>
                <th style={st.th}>Employee Name</th>
                <th style={{ ...st.th, width: 220 }}>Number of Working Hours</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr
                  key={e.id}
                  style={{ ...st.tr, background: selectedId === e.id ? '#f0fdf4' : '#fff', outline: selectedId === e.id ? '1px solid #bbf7d0' : 'none' }}
                  onClick={() => setSelectedId(e.id)}
                >
                  <td style={{ ...st.td, color: '#9ca3af' }}>{e.id}</td>
                  <td style={st.td}>{e.name}</td>
                  <td style={st.td}>{e.total_working_hours}</td>
                </tr>
              ))}

              {inserting && (
                <tr style={{ ...st.tr, background: '#f0fdf4', borderLeft: '3px solid #16a34a' }}>
                  <td style={st.td}>
                    <input
                      ref={idInputRef}
                      type="number"
                      min="1"
                      value={draftId}
                      onChange={e => { setDraftId(e.target.value); setInsertError(null); }}
                      onKeyDown={e => { if (e.key === 'Enter') confirmInsert(); if (e.key === 'Escape') cancelInsert(); }}
                      placeholder="ID"
                      style={st.draftInput}
                    />
                  </td>
                  <td style={st.td}>
                    <input
                      value={draftName}
                      onChange={e => { setDraftName(e.target.value); setInsertError(null); }}
                      onKeyDown={e => { if (e.key === 'Enter') confirmInsert(); if (e.key === 'Escape') cancelInsert(); }}
                      placeholder="Enter employee name..."
                      style={st.draftInput}
                    />
                  </td>
                  <td style={st.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={draftHours}
                        onChange={e => setDraftHours(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') confirmInsert(); if (e.key === 'Escape') cancelInsert(); }}
                        placeholder="0.00"
                        style={{ ...st.draftInput, flex: '0 0 100px' }}
                      />
                      <button onClick={confirmInsert} style={st.confirmBtn}>
                        <Check size={13} color="#fff" />
                      </button>
                      <button onClick={cancelInsert} style={st.cancelBtn}>
                        <X size={13} color="#ef4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {inserting && insertError && (
                <tr>
                  <td colSpan={3} style={st.insertErrorRow}>{insertError}</td>
                </tr>
              )}

              {filtered.length === 0 && !inserting && (
                <tr>
                  <td colSpan={3} style={st.emptyRow}>
                    No employees found — click Insert to add one
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={st.footer}>
          <span style={st.footerCount}>{filtered.length} employee{filtered.length !== 1 ? 's' : ''}</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={st.btnOutline} onClick={onClose}>Cancel</button>
            <button style={st.btnPrimary} onClick={onClose}>Ok</button>
          </div>
        </div>

        <div style={st.note}>
          <strong>Note:</strong> Working hours are tracked per employee across all jobs.
        </div>

      </div>
    </div>
  );
};

const st: Record<string, React.CSSProperties> = {
  card:       { flex: 1, display: 'flex', flexDirection: 'column', margin: 24, borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', background: '#fff' },

  header:     { background: '#16a34a', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  headerIcon: { width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle:{ fontSize: 18, fontWeight: 700, color: '#fff' },
  headerSub:  { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  closeBtn:   { background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' },

  body:          { padding: 24, display: 'flex', flexDirection: 'column', gap: 16, flex: 1, overflowY: 'auto' as const },
  searchSection: { display: 'flex', flexDirection: 'column', gap: 8 },
  searchLabel:   { fontSize: 13, fontWeight: 600, color: '#374151' },
  searchInput:   { width: '100%', padding: '10px 14px', border: '1.5px solid #16a34a', borderRadius: 8, fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box' as const },

  actions:     { display: 'flex', alignItems: 'center', gap: 10 },

  btnPrimary: { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#16a34a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' },
  btnOutline: { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' },
  btnDelete:  { borderColor: '#fecaca' },
  btnInsert:  { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: '#16a34a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' },

  tableWrapper: { border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' },
  table:        { width: '100%', borderCollapse: 'collapse' as const },
  tableHead:    { background: '#16a34a' },
  th:           { padding: '12px 18px', fontSize: 13, fontWeight: 600, color: '#fff', textAlign: 'left' as const },
  tr:           { borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background 0.1s' },
  td:           { padding: '13px 18px', fontSize: 13, color: '#111827' },
  emptyRow:     { padding: 28, textAlign: 'center' as const, fontSize: 13, color: '#9ca3af' },
  insertErrorRow: { padding: '8px 18px', fontSize: 12, color: '#ef4444', background: '#fff5f5' },

  draftInput:  { width: '100%', padding: '7px 10px', border: '1.5px solid #16a34a', borderRadius: 6, fontSize: 13, color: '#111827', outline: 'none', boxSizing: 'border-box' as const },
  confirmBtn:  { width: 30, height: 30, background: '#16a34a', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cancelBtn:   { width: 30, height: 30, background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  footer:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  footerCount:{ fontSize: 12, color: '#9ca3af' },
  note:       { background: '#f0fdf4', border: '1px solid #d1fae5', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#374151' },
};

export default Employees;
