import React, { useState, useMemo } from 'react';
import { Clock, X, Search, Trash2, RefreshCw, Save, Check, Plus } from 'lucide-react';

/* ── Types ─────────────────────────────────────────────────── */
type ClaimStatus = 'Pending' | 'Processing' | 'Failed' | 'Retry';

interface PendingClaim {
  id: number;
  invoiceNum: string;
  dateSubmitted: string;
  network: 'Safelite' | 'Lynx' | 'Other';
  status: ClaimStatus;
  soldTo: string;
  amount: string;
}

/* ── Mock data ── */
const MOCK: PendingClaim[] = [
  { id: 1, invoiceNum: 'INV-0011', dateSubmitted: '06/01/26', network: 'Safelite', status: 'Pending',    soldTo: 'APEX GLASS WORKS',   amount: '$438.29' },
  { id: 2, invoiceNum: 'INV-0009', dateSubmitted: '05/28/26', network: 'Lynx',     status: 'Processing', soldTo: 'CENTRAL COLLISION',  amount: '$289.00' },
  { id: 3, invoiceNum: 'INV-0007', dateSubmitted: '05/22/26', network: 'Safelite', status: 'Failed',     soldTo: 'DIAMOND AUTO GLASS', amount: '$524.75' },
  { id: 4, invoiceNum: 'INV-0005', dateSubmitted: '05/15/26', network: 'Lynx',     status: 'Retry',      soldTo: 'BLUE RIDGE AUTO',    amount: '$189.50' },
  { id: 5, invoiceNum: 'INV-0003', dateSubmitted: '05/10/26', network: 'Other',    status: 'Pending',    soldTo: '',                   amount: '$310.00' },
];

const ALL_STATUSES: ClaimStatus[] = ['Pending', 'Processing', 'Failed', 'Retry'];

const STATUS_STYLE: Record<ClaimStatus, { bg: string; color: string; dot: string }> = {
  Pending:    { bg: '#fffbeb', color: '#d97706', dot: '#f59e0b' },
  Processing: { bg: '#eff6ff', color: '#2563eb', dot: '#3b82f6' },
  Failed:     { bg: '#fff1f2', color: '#e11d48', dot: '#f43f5e' },
  Retry:      { bg: '#faf5ff', color: '#7c3aed', dot: '#8b5cf6' },
};

const NETWORK_STYLE: Record<string, { bg: string; color: string }> = {
  Safelite: { bg: '#eff6ff', color: '#2563eb' },
  Lynx:     { bg: '#faf5ff', color: '#7c3aed' },
  Other:    { bg: '#f8fafc', color: '#64748b' },
};

interface Props { onClose: () => void; }

const PendingEDIClaims: React.FC<Props> = ({ onClose }) => {
  const [liveQuery,  setLiveQuery]  = useState('');
  const [query,      setQuery]      = useState('');
  const [searchMode, setSearchMode] = useState<'all' | 'invoice'>('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [claims,     setClaims]     = useState<PendingClaim[]>(() => {
    try {
      const stored = localStorage.getItem('gl_pendingClaims');
      return stored ? JSON.parse(stored) : MOCK;
    } catch { return MOCK; }
  });
  const [statusDrop, setStatusDrop] = useState<{ id: number; top: number; left: number } | null>(null);
  const [saved,      setSaved]      = useState(false);
  const [showInsert, setShowInsert] = useState(false);
  const [form, setForm] = useState({ invoiceNum: '', dateSubmitted: '', network: 'Safelite' as PendingClaim['network'], soldTo: '', amount: '', status: 'Pending' as ClaimStatus });

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return claims;
    if (searchMode === 'invoice') return claims.filter(c => c.invoiceNum.toUpperCase().includes(q));
    return claims.filter(c =>
      c.invoiceNum.toUpperCase().includes(q) ||
      c.soldTo.toUpperCase().includes(q) ||
      c.network.toUpperCase().includes(q) ||
      c.status.toUpperCase().includes(q)
    );
  }, [query, searchMode, claims]);

  const doSearch     = (mode: 'all' | 'invoice') => { setSearchMode(mode); setQuery(liveQuery); };
  const doShowAll    = () => { setLiveQuery(''); setQuery(''); setSearchMode('all'); setSelectedId(null); };
  const handleDelete = () => {
    if (selectedId === null) return;
    setClaims(prev => prev.filter(c => c.id !== selectedId));
    setSelectedId(null);
  };

  const openStatusDrop = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setStatusDrop({ id, top: rect.bottom + 4, left: rect.left });
  };

  const changeStatus = (id: number, status: ClaimStatus) => {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    setStatusDrop(null);
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('gl_pendingClaims', JSON.stringify(claims));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleInsert = () => {
    if (!form.invoiceNum.trim() || !form.dateSubmitted.trim() || !form.amount.trim()) return;
    const newId = Math.max(0, ...claims.map(c => c.id)) + 1;
    const amt = form.amount.trim().startsWith('$') ? form.amount.trim() : `$${form.amount.trim()}`;
    setClaims(prev => [{ id: newId, invoiceNum: form.invoiceNum.trim(), dateSubmitted: form.dateSubmitted.trim(), network: form.network, soldTo: form.soldTo.trim(), amount: amt, status: form.status }, ...prev]);
    setForm({ invoiceNum: '', dateSubmitted: '', network: 'Safelite', soldTo: '', amount: '', status: 'Pending' });
    setShowInsert(false);
    setSaved(false);
  };

  const failedCount  = claims.filter(c => c.status === 'Failed').length;
  const pendingCount = claims.filter(c => c.status === 'Pending').length;

  return (
    <>
      <div style={st.card}>

        {/* ── Header ── */}
        <div style={st.header}>
          <div style={st.headerLeft}>
            <div style={st.headerIcon}><Clock size={20} color="#fff" /></div>
            <div>
              <div style={st.headerTitle}>Pending EDI Claims</div>
              <div style={st.headerSub}>Track and manage EDI claims awaiting network processing</div>
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
              placeholder="Enter invoice #, network, sold to, or status..."
              value={liveQuery}
              onChange={e => setLiveQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch('all')}
            />
          </div>

          {/* Actions */}
          <div style={st.actions}>
            <div style={st.actionsLeft}>
              <button style={st.btnPrimary} onClick={() => doSearch('all')}>
                <Search size={14} color="#fff" /> Search
              </button>
              <button style={st.btnInsert} onClick={() => setShowInsert(true)}>
                <Plus size={14} color="#fff" /> Insert
              </button>
              <button style={st.btnOutline} onClick={doShowAll}>Show All</button>
              <button
                style={{ ...st.btnOutline, ...st.btnDelete, opacity: selectedId === null ? 0.45 : 1 }}
                onClick={handleDelete}
                disabled={selectedId === null}
              >
                <Trash2 size={14} color="#ef4444" />
                <span style={{ color: '#ef4444' }}>Delete</span>
              </button>
            </div>
            <button style={st.btnRefresh} onClick={doShowAll}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {/* Table */}
          <div style={st.tableWrapper}>
            <table style={st.table}>
              <thead>
                <tr style={st.tableHead}>
                  <th style={{ ...st.th, width: 130 }}>EDI Invoice #</th>
                  <th style={{ ...st.th, width: 130 }}>Date Submitted</th>
                  <th style={{ ...st.th, width: 110 }}>Network</th>
                  <th style={st.th}>Sold To</th>
                  <th style={{ ...st.th, width: 100, textAlign: 'right' as const }}>Amount</th>
                  <th style={{ ...st.th, width: 140 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={st.emptyRow}>
                      {claims.length === 0 ? 'No pending EDI claims' : 'No claims match your search'}
                    </td>
                  </tr>
                )}
                {filtered.map(c => {
                  const sel   = selectedId === c.id;
                  const sSt   = STATUS_STYLE[c.status];
                  const netSt = NETWORK_STYLE[c.network];
                  return (
                    <tr
                      key={c.id}
                      style={{ ...st.tr, background: sel ? '#f0fdf4' : '#fff', outline: sel ? '1px solid #bbf7d0' : 'none' }}
                      onClick={() => setSelectedId(sel ? null : c.id)}
                    >
                      <td style={{ ...st.td, fontWeight: 700, color: '#16a34a', fontFamily: 'monospace', fontSize: 12 }}>
                        {c.invoiceNum}
                      </td>
                      <td style={{ ...st.td, color: '#374151' }}>{c.dateSubmitted}</td>
                      <td style={st.td}>
                        <span style={{ ...st.pill, background: netSt.bg, color: netSt.color }}>
                          {c.network}
                        </span>
                      </td>
                      <td style={{ ...st.td, color: c.soldTo ? '#111827' : '#9ca3af' }}>
                        {c.soldTo || '—'}
                      </td>
                      <td style={{ ...st.td, textAlign: 'right' as const, fontWeight: 600 }}>{c.amount}</td>
                      <td style={st.td}>
                        {/* Clickable status badge */}
                        <button
                          style={{ ...st.statusBtn, background: sSt.bg, color: sSt.color }}
                          onClick={e => openStatusDrop(e, c.id)}
                          title="Click to change status"
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: sSt.dot, display: 'inline-block', flexShrink: 0 }} />
                          {c.status}
                          <span style={{ fontSize: 9, opacity: 0.7 }}>▾</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={st.footer}>
            <span style={st.footerCount}>
              {filtered.length} claim{filtered.length !== 1 ? 's' : ''}
              {selectedId !== null && (
                <span style={st.footerSel}>
                  {' '}· {claims.find(c => c.id === selectedId)?.invoiceNum} selected
                </span>
              )}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>
                {failedCount} failed · {pendingCount} pending
              </span>

              {/* Save button */}
              <button
                style={{ ...st.btnSave, ...(saved ? st.btnSaved : {}) }}
                onClick={handleSave}
              >
                {saved ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save</>}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Insert dialog ── */}
      {showInsert && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 9997 }} onClick={() => setShowInsert(false)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 9999, background: '#fff', borderRadius: 14, boxShadow: '0 8px 40px rgba(0,0,0,0.18)', width: 480, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>New EDI Claim</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} onClick={() => setShowInsert(false)}><X size={18} color="#6b7280" /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'Invoice #',       key: 'invoiceNum',     placeholder: 'e.g. INV-0012' },
                { label: 'Date Submitted',  key: 'dateSubmitted',  placeholder: 'MM/DD/YY' },
                { label: 'Sold To',         key: 'soldTo',         placeholder: 'Customer name' },
                { label: 'Amount',          key: 'amount',         placeholder: 'e.g. 250.00' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>{label}</label>
                  <input
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' as const }}
                    placeholder={placeholder}
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Network</label>
                <select style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, background: '#fff' }}
                  value={form.network} onChange={e => setForm(f => ({ ...f, network: e.target.value as PendingClaim['network'] }))}>
                  <option>Safelite</option><option>Lynx</option><option>Other</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Status</label>
                <select style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, background: '#fff' }}
                  value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ClaimStatus }))}>
                  {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
              <button style={{ padding: '9px 20px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', color: '#374151' }} onClick={() => setShowInsert(false)}>Cancel</button>
              <button
                style={{ padding: '9px 22px', background: (!form.invoiceNum.trim() || !form.dateSubmitted.trim() || !form.amount.trim()) ? '#86efac' : '#16a34a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: (!form.invoiceNum.trim() || !form.dateSubmitted.trim() || !form.amount.trim()) ? 'not-allowed' : 'pointer' }}
                onClick={handleInsert}
              >
                + Insert
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Status dropdown (fixed — never clipped by overflow) ── */}
      {statusDrop && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
            onClick={() => setStatusDrop(null)}
          />
          <div style={{
            position: 'fixed', top: statusDrop.top, left: statusDrop.left,
            zIndex: 9999, background: '#fff', border: '1px solid #e5e7eb',
            borderRadius: 10, boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
            overflow: 'hidden', minWidth: 148,
          }}>
            {ALL_STATUSES.map((s, i) => {
              const sst = STATUS_STYLE[s];
              return (
                <button
                  key={s}
                  onClick={() => changeStatus(statusDrop.id, s)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '9px 14px', background: 'none',
                    border: 'none', cursor: 'pointer', fontSize: 13,
                    borderBottom: i < ALL_STATUSES.length - 1 ? '1px solid #f3f4f6' : 'none',
                    color: sst.color, fontWeight: 600,
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: sst.dot, flexShrink: 0 }} />
                  {s}
                </button>
              );
            })}
          </div>
        </>
      )}
    </>
  );
};

/* ── Styles ─────────────────────────────────────────────────── */
const st: Record<string, React.CSSProperties> = {
  card:       { flex: 1, display: 'flex', flexDirection: 'column', margin: 24, borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', background: '#fff' },

  header:     { background: '#16a34a', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  headerIcon: { width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle:{ fontSize: 18, fontWeight: 700, color: '#fff' },
  headerSub:  { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  closeBtn:   { background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' },

  body:          { padding: 24, display: 'flex', flexDirection: 'column', gap: 16, flex: 1, overflow: 'hidden', minHeight: 0 },
  searchSection: { display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 },
  searchLabel:   { fontSize: 13, fontWeight: 600, color: '#374151' },
  searchInput:   { width: '100%', padding: '10px 14px', border: '1.5px solid #16a34a', borderRadius: 8, fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box' as const },

  actions:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexShrink: 0 },
  actionsLeft: { display: 'flex', gap: 10, flexWrap: 'wrap' as const },
  btnPrimary:  { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#16a34a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' },
  btnOutline:  { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' },
  btnDelete:   { borderColor: '#fecaca' },
  btnRefresh:  { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' },
  btnInsert:   { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#16a34a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' },

  tableWrapper: { border: '1px solid #e5e7eb', borderRadius: 10, overflowX: 'hidden' as const, overflowY: 'scroll' as const, maxHeight: 340 },
  table:        { width: '100%', borderCollapse: 'collapse' as const },
  tableHead:    { background: '#16a34a' },
  th:           { padding: '12px 18px', fontSize: 13, fontWeight: 600, color: '#fff', textAlign: 'left' as const, position: 'sticky' as const, top: 0, zIndex: 1, background: '#16a34a' },
  tr:           { borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background 0.1s' },
  td:           { padding: '13px 18px', fontSize: 13, color: '#111827' },
  emptyRow:     { padding: '40px 0', textAlign: 'center' as const, fontSize: 13, color: '#9ca3af' },

  pill:      { display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
  statusBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' as const },

  footer:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  footerCount:{ fontSize: 12, color: '#9ca3af' },
  footerSel:  { color: '#16a34a', fontWeight: 600 },

  btnSave:  { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 22px', background: '#16a34a', border: '1px solid transparent', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', transition: 'background 0.2s, color 0.2s, border-color 0.2s' },
  btnSaved: { background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac', cursor: 'default' },
};

export default PendingEDIClaims;
