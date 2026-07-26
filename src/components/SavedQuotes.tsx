import React, { useState, useMemo } from 'react';
import { BookOpen, X, Search, Trash2, Plus } from 'lucide-react';

interface SavedQuote {
  id: number;
  customerName: string;
  year: string;
  make: string;
  model: string;
  bodyStyle: string;
  discount: string;
}

const MOCK_QUOTES: SavedQuote[] = [
  { id: 45, customerName: '',                   year: '2024', make: 'Honda',    model: 'Odyssey', bodyStyle: 'Minivan',          discount: 'CASH'   },
  { id: 44, customerName: '',                   year: '2023', make: 'Honda',    model: 'CR-V',    bodyStyle: '4 Door Utility',   discount: 'CASH'   },
  { id: 43, customerName: '',                   year: '2024', make: 'Honda',    model: 'CR-V',    bodyStyle: '4 Door Utility',   discount: 'CASH'   },
  { id: 42, customerName: '',                   year: '2023', make: 'Honda',    model: 'CR-V',    bodyStyle: '4 Door Utility',   discount: 'CASH'   },
  { id: 41, customerName: '',                   year: '2018', make: 'Honda',    model: 'Civic',   bodyStyle: '4 Door Hatchback', discount: 'CASH'   },
  { id: 40, customerName: '',                   year: '2018', make: 'Honda',    model: 'Clarity', bodyStyle: '4 Door Sedan',     discount: 'CASH'   },
  { id: 39, customerName: '',                   year: '2020', make: 'Honda',    model: 'HR-V',    bodyStyle: '4 Door Hatchback', discount: 'CASH'   },
  { id: 38, customerName: '',                   year: '2018', make: 'Honda',    model: 'CR-V',    bodyStyle: '4 Door Utility',   discount: 'CASH'   },
  { id: 37, customerName: 'APEX GLASS WORKS',   year: '2018', make: 'Hyundai',  model: 'Elantra', bodyStyle: '4 Door Sedan',     discount: 'SENIOR' },
  { id: 36, customerName: '',                   year: '2022', make: 'Honda',    model: 'HR-V',    bodyStyle: '4 Door Hatchback', discount: 'CASH'   },
  { id: 35, customerName: '',                   year: '2022', make: 'Maserati', model: 'Levante', bodyStyle: '4 Door Utility',   discount: 'CASH'   },
  { id: 33, customerName: 'CENTRAL COLLISION',  year: '2023', make: 'Audi',     model: 'A4',      bodyStyle: '4 Door Sedan',     discount: 'FLEET'  },
  { id: 32, customerName: '',                   year: '2022', make: 'BMW',      model: '530e',    bodyStyle: '4 Door Sedan',     discount: 'CASH'   },
  { id: 31, customerName: 'DIAMOND AUTO GLASS', year: '2019', make: 'Audi',     model: 'A4',      bodyStyle: '4 Door Sedan',     discount: 'CASH'   },
];

const DISCOUNT_COLOR: Record<string, { bg: string; color: string }> = {
  CASH:   { bg: '#f0fdf4', color: '#16a34a' },
  FLEET:  { bg: '#eff6ff', color: '#2563eb' },
  SENIOR: { bg: '#faf5ff', color: '#9333ea' },
};

interface Props { onClose: () => void; }

const SavedQuotes: React.FC<Props> = ({ onClose }) => {
  const [liveQuery,  setLiveQuery]  = useState('');
  const [query,      setQuery]      = useState('');
  const [searchMode, setSearchMode] = useState<'all' | 'name'>('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [quotes,     setQuotes]     = useState<SavedQuote[]>(MOCK_QUOTES);

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return quotes;
    return quotes.filter(r => {
      if (searchMode === 'name') return r.customerName.toUpperCase().includes(q);
      return (
        String(r.id).includes(q) ||
        r.make.toUpperCase().includes(q) ||
        r.model.toUpperCase().includes(q) ||
        r.customerName.toUpperCase().includes(q)
      );
    });
  }, [query, searchMode, quotes]);

  const doSearch  = (mode: 'all' | 'name') => { setSearchMode(mode); setQuery(liveQuery); };
  const doShowAll = () => { setLiveQuery(''); setQuery(''); setSearchMode('all'); setSelectedId(null); };
  const doDelete  = () => {
    if (selectedId === null) return;
    setQuotes(prev => prev.filter(q => q.id !== selectedId));
    setSelectedId(null);
  };

  return (
    <div style={st.card}>

      {/* ── Header ── */}
      <div style={st.header}>
        <div style={st.headerLeft}>
          <div style={st.headerIcon}><BookOpen size={20} color="#fff" /></div>
          <div>
            <div style={st.headerTitle}>Saved Quotes</div>
            <div style={st.headerSub}>Search and manage saved quotes</div>
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
            placeholder="Enter quote #, make, model, or customer name..."
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
            <button style={st.btnOutline} onClick={() => doSearch('name')}>Search By Name</button>
            <button style={st.btnOutline} onClick={doShowAll}>Show All</button>
            <button
              style={{ ...st.btnOutline, ...st.btnDelete, opacity: selectedId === null ? 0.45 : 1 }}
              onClick={doDelete}
              disabled={selectedId === null}
            >
              <Trash2 size={14} color="#ef4444" />
              <span style={{ color: '#ef4444' }}>Delete</span>
            </button>
          </div>
          <button style={st.btnInsert}>
            <Plus size={14} color="#fff" /> Insert
          </button>
        </div>

        {/* Table */}
        <div style={st.tableWrapper}>
          <table style={st.table}>
            <thead>
              <tr style={st.tableHead}>
                <th style={{ ...st.th, width: 80 }}>Quote #</th>
                <th style={st.th}>Customer Name</th>
                <th style={{ ...st.th, width: 60 }}>Year</th>
                <th style={{ ...st.th, width: 110 }}>Make</th>
                <th style={{ ...st.th, width: 130 }}>Model</th>
                <th style={{ ...st.th, width: 160 }}>Body Style</th>
                <th style={{ ...st.th, width: 100 }}>Discount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={st.emptyRow}>No quotes found — try Show All</td>
                </tr>
              )}
              {filtered.map(q => {
                const sel = selectedId === q.id;
                const dc  = DISCOUNT_COLOR[q.discount] ?? { bg: '#f9fafb', color: '#374151' };
                return (
                  <tr
                    key={q.id}
                    style={{ ...st.tr, background: sel ? '#f0fdf4' : '#fff', outline: sel ? '1px solid #bbf7d0' : 'none' }}
                    onClick={() => setSelectedId(sel ? null : q.id)}
                  >
                    <td style={{ ...st.td, fontWeight: 700, color: '#16a34a' }}>#{q.id}</td>
                    <td style={{ ...st.td, color: q.customerName ? '#111827' : '#9ca3af' }}>
                      {q.customerName || '—'}
                    </td>
                    <td style={{ ...st.td, fontWeight: 600 }}>{q.year}</td>
                    <td style={st.td}>{q.make}</td>
                    <td style={st.td}>{q.model}</td>
                    <td style={{ ...st.td, color: '#6b7280' }}>{q.bodyStyle}</td>
                    <td style={st.td}>
                      <span style={{ ...st.badge, background: dc.bg, color: dc.color }}>
                        {q.discount}
                      </span>
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
            {filtered.length} quote{filtered.length !== 1 ? 's' : ''}
            {selectedId !== null && <span style={st.footerSel}> · Quote #{selectedId} selected</span>}
          </span>
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

  actions:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  actionsLeft: { display: 'flex', gap: 10, flexWrap: 'wrap' as const },

  btnPrimary: { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#16a34a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' },
  btnOutline: { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' },
  btnDelete:  { borderColor: '#fecaca' },
  btnInsert:  { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: '#16a34a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' },

  tableWrapper: { border: '1px solid #e5e7eb', borderRadius: 10, overflowX: 'hidden' as const, overflowY: 'auto' as const, maxHeight: 340 },
  table:        { width: '100%', borderCollapse: 'collapse' as const },
  tableHead:    { background: '#16a34a' },
  th:           { padding: '12px 18px', fontSize: 13, fontWeight: 600, color: '#fff', textAlign: 'left' as const, position: 'sticky' as const, top: 0, zIndex: 1, background: '#16a34a' },
  tr:           { borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background 0.1s' },
  td:           { padding: '13px 18px', fontSize: 13, color: '#111827' },
  emptyRow:     { padding: 28, textAlign: 'center' as const, fontSize: 13, color: '#9ca3af' },

  badge:      { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
  footer:     { display: 'flex', alignItems: 'center' },
  footerCount:{ fontSize: 12, color: '#9ca3af' },
  footerSel:  { color: '#16a34a', fontWeight: 600 },
};

export default SavedQuotes;
