import React, { useState, useCallback } from 'react';
import { Hash, X, Search, FileText, Loader } from 'lucide-react';
import { api, type NagsGlassPart, type VehicleFitment } from '../api/client';
import { formatPrice } from '../test_data/db';

interface Props {
  onClose: () => void;
  onTurnIntoInvoice?: () => void;
}

const TYPE_COLOR: Record<string, string> = {
  Windshield: '#16a34a',
  Tempered:   '#2563eb',
  Laminated:  '#9333ea',
};

const NAGSByPartNumber: React.FC<Props> = ({ onClose, onTurnIntoInvoice }) => {
  const [liveQuery,   setLiveQuery]   = useState('');
  const [loading,     setLoading]     = useState(false);
  const [loadingFit,  setLoadingFit]  = useState(false);
  const [error,       setError]       = useState('');
  const [parts,       setParts]       = useState<NagsGlassPart[]>([]);
  const [fitment,     setFitment]     = useState<VehicleFitment[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const doSearch = useCallback(async () => {
    const q = liveQuery.trim();
    setHasSearched(true);
    setSelectedIdx(null);
    setFitment([]);
    setError('');
    setLoading(true);
    try {
      const results = await api.searchGlassParts(q || undefined, 300);
      setParts(results);
    } catch {
      setError('Search failed — check server connection');
      setParts([]);
    } finally {
      setLoading(false);
    }
  }, [liveQuery]);

  const doShowAll = useCallback(async () => {
    setLiveQuery('');
    setSelectedIdx(null);
    setFitment([]);
    setError('');
    setHasSearched(true);
    setLoading(true);
    try {
      const results = await api.searchGlassParts(undefined, 300);
      setParts(results);
    } catch {
      setError('Failed to load parts');
      setParts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelect = useCallback(async (idx: number) => {
    setSelectedIdx(idx);
    const part = parts[idx];
    if (!part) return;
    setLoadingFit(true);
    setFitment([]);
    try {
      const fit = await api.getFitment(part.part_no);
      setFitment(fit);
    } catch {
      setFitment([]);
    } finally {
      setLoadingFit(false);
    }
  }, [parts]);

  const selected = selectedIdx !== null ? parts[selectedIdx] ?? null : null;

  return (
    <div style={st.card}>

      {/* ── Header ── */}
      <div style={st.header}>
        <div style={st.headerLeft}>
          <div style={st.headerIcon}><Hash size={18} color="#fff" /></div>
          <div>
            <div style={st.headerTitle}>NAGS by Part #</div>
            <div style={st.headerSub}>Search glass parts by NAGS part number</div>
          </div>
        </div>
        <button style={st.closeBtn} onClick={onClose}><X size={16} color="#fff" /></button>
      </div>

      {/* ── Search bar ── */}
      <div style={st.searchBar}>
        <div style={st.inputWrap}>
          <Search size={13} color="#9ca3af" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            style={st.input}
            value={liveQuery}
            onChange={e => setLiveQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            placeholder="Enter NAGS part number (e.g. FW01234)…"
          />
        </div>
        <button style={st.btnPrimary} onClick={doSearch} disabled={loading}>
          {loading ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={13} />}
          {' '}Search
        </button>
        <button style={st.btnOutline} onClick={doShowAll} disabled={loading}>Show All</button>
        <button
          style={{ ...st.btnOutline, ...(selected ? st.btnInvoiceActive : st.btnInvoiceOff) }}
          onClick={() => selected && onTurnIntoInvoice?.()}
          disabled={!selected}
        >
          <FileText size={13} /> Invoice It!
        </button>
      </div>

      {error && <div style={st.errorBanner}>{error}</div>}

      {/* ── Body ── */}
      <div style={st.body}>

        {/* Left: part list */}
        <div style={st.leftPanel}>
          <div style={st.listHead}>
            <span style={{ flex: 3, ...st.headCell }}>Part #</span>
            <span style={{ flex: 2, ...st.headCell }}>Description</span>
            <span style={{ flex: 1, ...st.headCell, textAlign: 'right' }}>List</span>
          </div>
          <div style={st.listScroll}>
            {!hasSearched && (
              <div style={st.emptyList}>Enter a part number and press Search, or click Show All</div>
            )}
            {hasSearched && loading && (
              <div style={st.emptyList}>
                <Loader size={20} color="#16a34a" style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
                <div>Searching…</div>
              </div>
            )}
            {hasSearched && !loading && parts.length === 0 && (
              <div style={st.emptyList}>No parts found — try a shorter search term</div>
            )}
            {hasSearched && !loading && parts.map((p, i) => (
              <button
                key={p.part_no}
                style={{
                  ...st.listRow,
                  background:  selectedIdx === i ? '#f0fdf4' : i % 2 === 0 ? '#fff' : '#fafafa',
                  borderLeft:  selectedIdx === i ? '3px solid #16a34a' : '3px solid transparent',
                }}
                onClick={() => handleSelect(i)}
              >
                <div style={{ flex: 3 }}>
                  <div style={st.partNo}>{p.part_no}</div>
                  <span style={{ ...st.typeBadge, background: (TYPE_COLOR[p.type] ?? '#6b7280') + '18', color: TYPE_COLOR[p.type] ?? '#6b7280' }}>
                    {p.type}
                  </span>
                </div>
                <div style={{ flex: 2, fontSize: 11, color: '#6b7280', paddingRight: 8 }}>{p.description}</div>
                <div style={{ flex: 1, textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#111827' }}>
                  {p.list_price > 0 ? formatPrice(p.list_price) : '—'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: detail panel */}
        <div style={st.rightPanel}>
          {!selected ? (
            <div style={st.emptyRight}>
              <Hash size={36} color="#d1d5db" />
              <span style={st.emptyRightText}>
                {hasSearched ? 'Select a part on the left to view fitment' : 'Search for a NAGS part number'}
              </span>
            </div>
          ) : (
            <>
              {/* Info strip */}
              <div style={st.infoStrip}>
                <div style={st.stripLeft}>
                  <span style={st.stripPartNo}>{selected.part_no}</span>
                  <span style={st.stripDesc}>{selected.description}</span>
                  <span style={{ ...st.typePill, background: (TYPE_COLOR[selected.type] ?? '#6b7280') + '18', color: TYPE_COLOR[selected.type] ?? '#6b7280' }}>
                    {selected.type}
                  </span>
                </div>
                <div style={st.stripRight}>
                  <div style={st.stripStat}>
                    <span style={st.stripStatLabel}>List Price</span>
                    <span style={{ ...st.stripStatVal, color: '#16a34a' }}>
                      {selected.list_price > 0 ? formatPrice(selected.list_price) : 'Call'}
                    </span>
                  </div>
                  {selected.labor_hours > 0 && (
                    <>
                      <div style={st.stripDivider} />
                      <div style={st.stripStat}>
                        <span style={st.stripStatLabel}>Labor</span>
                        <span style={st.stripStatVal}>{selected.labor_hours.toFixed(1)} hrs</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Fitment table */}
              <div style={st.fitmentWrap}>
                <div style={st.fitmentHead}>
                  <span style={st.fitmentHeadLabel}>Vehicle Fitment</span>
                  {!loadingFit && (
                    <span style={st.fitmentCount}>{fitment.length} match{fitment.length !== 1 ? 'es' : ''}</span>
                  )}
                </div>
                {loadingFit ? (
                  <div style={st.noFitment}>
                    <Loader size={18} color="#16a34a" style={{ animation: 'spin 1s linear infinite', marginBottom: 6 }} />
                    <div>Loading fitment…</div>
                  </div>
                ) : fitment.length === 0 ? (
                  <div style={st.noFitment}>No fitment data available for this part</div>
                ) : (
                  <div style={st.tableScroll}>
                    <table style={st.table}>
                      <thead>
                        <tr style={st.fitmentThead}>
                          <th style={st.fth}>Year</th>
                          <th style={st.fth}>Make</th>
                          <th style={st.fth}>Model</th>
                          <th style={st.fth}>Style</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fitment.map((f, i) => (
                          <tr
                            key={i}
                            style={{
                              ...st.ftr,
                              background: i === 0 ? '#f0fdf4' : i % 2 === 0 ? '#fff' : '#fafafa',
                              borderLeft: i === 0 ? '3px solid #16a34a' : '3px solid transparent',
                            }}
                          >
                            <td style={{ ...st.ftd, fontWeight: 600 }}>{f.year}</td>
                            <td style={st.ftd}>{f.make}</td>
                            <td style={st.ftd}>{f.model}</td>
                            <td style={{ ...st.ftd, color: '#6b7280' }}>{f.style || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const st: Record<string, React.CSSProperties> = {
  card:       { flex: 1, display: 'flex', flexDirection: 'column', margin: 20, borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', background: '#fff' },
  header:     { background: '#16a34a', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  headerIcon: { width: 34, height: 34, background: 'rgba(255,255,255,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle:{ fontSize: 16, fontWeight: 700, color: '#fff' },
  headerSub:  { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  closeBtn:   { background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' },
  searchBar:  { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderBottom: '1px solid #e5e7eb', background: '#fafafa', flexShrink: 0 },
  inputWrap:  { position: 'relative', flex: 1, maxWidth: 380 },
  input:      { width: '100%', padding: '7px 10px 7px 32px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12, color: '#111827', outline: 'none', boxSizing: 'border-box' as const },
  btnPrimary: { display: 'flex', alignItems: 'center', gap: 5, padding: '7px 16px', background: '#16a34a', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#fff', cursor: 'pointer' },
  btnOutline: { display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' },
  btnInvoiceActive: { border: '1px solid #16a34a', color: '#16a34a', background: '#f0fdf4' },
  btnInvoiceOff:    { opacity: 0.4, cursor: 'not-allowed' as const },
  errorBanner:{ background: '#fef2f2', color: '#dc2626', fontSize: 12, padding: '6px 16px', flexShrink: 0 },
  body:       { flex: 1, display: 'flex', overflow: 'hidden' },
  leftPanel:  { width: 340, borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 },
  listHead:   { display: 'flex', padding: '8px 14px', borderBottom: '2px solid #e5e7eb', background: '#fff', flexShrink: 0 },
  headCell:   { fontSize: 11, fontWeight: 700, color: '#374151' },
  listScroll: { flex: 1, overflowY: 'auto' as const },
  listRow:    { width: '100%', display: 'flex', alignItems: 'center', padding: '9px 14px', border: 'none', borderBottom: '1px solid #f0f0f0', textAlign: 'left' as const, cursor: 'pointer', transition: 'background 0.1s', boxSizing: 'border-box' as const },
  partNo:     { fontSize: 12, fontWeight: 700, color: '#111827', fontFamily: 'monospace', marginBottom: 2 },
  typeBadge:  { display: 'inline-block', fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 10, letterSpacing: '0.04em' },
  emptyList:  { padding: 32, textAlign: 'center' as const, fontSize: 12, color: '#9ca3af', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  rightPanel:     { flex: 1, background: '#f9fafb', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  emptyRight:     { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyRightText: { fontSize: 13, color: '#9ca3af' },
  infoStrip:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#fff', borderBottom: '1px solid #e5e7eb', flexShrink: 0, gap: 12 },
  stripLeft:      { display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 },
  stripPartNo:    { fontSize: 14, fontWeight: 700, color: '#111827', fontFamily: 'monospace' },
  stripDesc:      { fontSize: 12, color: '#6b7280' },
  typePill:       { padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, flexShrink: 0 },
  stripRight:     { display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 },
  stripStat:      { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 },
  stripStatLabel: { fontSize: 9, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' as const },
  stripStatVal:   { fontSize: 14, fontWeight: 700, color: '#111827' },
  stripDivider:   { width: 1, height: 28, background: '#e5e7eb' },
  fitmentWrap:      { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  fitmentHead:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '2px solid #e5e7eb', background: '#fff', flexShrink: 0 },
  fitmentHeadLabel: { fontSize: 11, fontWeight: 700, color: '#374151', letterSpacing: '0.04em', textTransform: 'uppercase' as const },
  fitmentCount:     { fontSize: 11, color: '#9ca3af' },
  fitmentThead:     { background: '#fafafa' },
  fth:              { padding: '9px 14px', fontSize: 11, fontWeight: 700, color: '#374151', textAlign: 'left' as const, borderBottom: '1px solid #e5e7eb' },
  ftr:              { borderBottom: '1px solid #f0f0f0', transition: 'background 0.1s' },
  ftd:              { padding: '9px 14px', fontSize: 13, color: '#111827' },
  tableScroll: { flex: 1, overflowY: 'auto' as const },
  table:       { width: '100%', borderCollapse: 'collapse' as const },
  noFitment: { padding: 32, fontSize: 12, color: '#9ca3af', textAlign: 'center' as const, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
};

export default NAGSByPartNumber;
