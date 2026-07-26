import React, { useState } from 'react';
import { Send, X, Trash2, FileDown, Wifi, AlertCircle } from 'lucide-react';

/* ── Types ─────────────────────────────────────────────────── */
interface SafeliteRow {
  id: number;
  vin: string;
  invoiceNum: string;
  invoiceDate: string;
  custSign: string;
  referralNum: string;
  lossDate: string;
  installDate: string;
  deductible: string;
}

interface LynxRow {
  id: number;
  invoiceNum: string;
  invoiceDate: string;
  dispatch: string;
  soldToName: string;
  vin: string;
}

/* ── Seed data (empty by default — populated from invoice flow) ── */
const SEED_SAFELITE: SafeliteRow[] = [];
const SEED_LYNX: LynxRow[] = [];

interface Props { onClose: () => void; }

const SendEDIClaims: React.FC<Props> = ({ onClose }) => {
  const [safelite,     setSafelite]     = useState<SafeliteRow[]>(SEED_SAFELITE);
  const [lynx,         setLynx]         = useState<LynxRow[]>(SEED_LYNX);
  const [selSafelite,  setSelSafelite]  = useState<number | null>(null);
  const [selLynx,      setSelLynx]      = useState<number | null>(null);
  const [sending,      setSending]      = useState(false);
  const [toast,        setToast]        = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveEDI = () => {
    if (safelite.length === 0 && lynx.length === 0) {
      showToast('No EDI records to save.');
      return;
    }
    showToast('EDI file saved successfully.');
  };

  const handleSendEDI = () => {
    if (safelite.length === 0 && lynx.length === 0) {
      showToast('No EDI records to send.');
      return;
    }
    setSending(true);
    setTimeout(() => { setSending(false); showToast('EDI file sent successfully.'); }, 1500);
  };

  const handleDeleteSafelite = () => {
    if (safelite.length === 0) { showToast('No Safelite EDI records to delete.'); return; }
    setSafelite([]);
    setSelSafelite(null);
    showToast('Safelite EDI records deleted.');
  };

  const handleDeleteAll = () => {
    if (safelite.length === 0 && lynx.length === 0) { showToast('No EDI records to delete.'); return; }
    setSafelite([]);
    setLynx([]);
    setSelSafelite(null);
    setSelLynx(null);
    showToast('All EDI transactions deleted.');
  };

  const totalRecords = safelite.length + lynx.length;

  return (
    <div style={st.card}>

      {/* ── Header ── */}
      <div style={st.header}>
        <div style={st.headerLeft}>
          <div style={st.headerIcon}><Send size={20} color="#fff" /></div>
          <div>
            <div style={st.headerTitle}>EDI Processing</div>
            <div style={st.headerSub}>Send Safelite and Lynx Network EDI claims · {totalRecords} record{totalRecords !== 1 ? 's' : ''} queued</div>
          </div>
        </div>
        <button style={st.closeBtn} onClick={onClose}><X size={18} color="#fff" /></button>
      </div>

      {/* ── Body ── */}
      <div style={st.body}>

        {/* ── Safelite Network ── */}
        <div style={st.networkCard}>
          <div style={st.networkHeader}>
            <div style={st.networkBadge}>
              <Wifi size={14} color="#2563eb" />
              <span style={st.networkName}>Safelite Network</span>
            </div>
            <span style={st.networkCount}>{safelite.length} invoice{safelite.length !== 1 ? 's' : ''}</span>
          </div>

          <div style={st.tableWrap}>
            <table style={st.table}>
              <thead>
                <tr style={st.thead}>
                  <th style={st.th}>VIN</th>
                  <th style={st.th}>Invoice #</th>
                  <th style={st.th}>Invoice Date</th>
                  <th style={st.th}>Cust Sign</th>
                  <th style={st.th}>Referral #</th>
                  <th style={st.th}>Loss Date</th>
                  <th style={st.th}>Install Date</th>
                  <th style={{ ...st.th, textAlign: 'right' as const }}>Deductible</th>
                </tr>
              </thead>
              <tbody>
                {safelite.map(r => (
                  <tr
                    key={r.id}
                    style={{ ...st.tr, background: selSafelite === r.id ? '#f0fdf4' : '#fff', outline: selSafelite === r.id ? '1px solid #bbf7d0' : 'none' }}
                    onClick={() => setSelSafelite(selSafelite === r.id ? null : r.id)}
                  >
                    <td style={{ ...st.td, fontFamily: 'monospace', fontSize: 12 }}>{r.vin || '—'}</td>
                    <td style={st.td}>{r.invoiceNum}</td>
                    <td style={st.td}>{r.invoiceDate}</td>
                    <td style={st.td}>{r.custSign || '—'}</td>
                    <td style={st.td}>{r.referralNum || '—'}</td>
                    <td style={st.td}>{r.lossDate || '—'}</td>
                    <td style={st.td}>{r.installDate || '—'}</td>
                    <td style={{ ...st.td, textAlign: 'right' as const }}>{r.deductible ? `$${r.deductible}` : '—'}</td>
                  </tr>
                ))}
                {safelite.length === 0 && (
                  <tr>
                    <td colSpan={8} style={st.empty}>
                      <AlertCircle size={16} color="#d1d5db" style={{ marginBottom: 6 }} />
                      <div>No Safelite invoices queued for EDI processing</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Lynx Network ── */}
        <div style={st.networkCard}>
          <div style={st.networkHeader}>
            <div style={st.networkBadge}>
              <Wifi size={14} color="#7c3aed" />
              <span style={{ ...st.networkName, color: '#7c3aed' }}>Lynx Network</span>
            </div>
            <span style={st.networkCount}>{lynx.length} invoice{lynx.length !== 1 ? 's' : ''}</span>
          </div>

          <div style={st.tableWrap}>
            <table style={st.table}>
              <thead>
                <tr style={st.thead}>
                  <th style={st.th}>Invoice #</th>
                  <th style={st.th}>Invoice Date</th>
                  <th style={st.th}>Dispatch</th>
                  <th style={st.th}>Sold To Name</th>
                  <th style={st.th}>VIN</th>
                </tr>
              </thead>
              <tbody>
                {lynx.map(r => (
                  <tr
                    key={r.id}
                    style={{ ...st.tr, background: selLynx === r.id ? '#f5f3ff' : '#fff', outline: selLynx === r.id ? '1px solid #ddd6fe' : 'none' }}
                    onClick={() => setSelLynx(selLynx === r.id ? null : r.id)}
                  >
                    <td style={st.td}>{r.invoiceNum}</td>
                    <td style={st.td}>{r.invoiceDate}</td>
                    <td style={st.td}>{r.dispatch || '—'}</td>
                    <td style={st.td}>{r.soldToName || '—'}</td>
                    <td style={{ ...st.td, fontFamily: 'monospace', fontSize: 12 }}>{r.vin || '—'}</td>
                  </tr>
                ))}
                {lynx.length === 0 && (
                  <tr>
                    <td colSpan={5} style={st.empty}>
                      <AlertCircle size={16} color="#d1d5db" style={{ marginBottom: 6 }} />
                      <div>No Lynx invoices queued for EDI processing</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── Footer ── */}
      <div style={st.footer}>
        <div style={st.footerLeft}>
          <button style={st.btnOutline} onClick={handleSaveEDI}>
            <FileDown size={14} /> Save EDI File
          </button>
          <button style={{ ...st.btnPrimary, opacity: sending ? 0.75 : 1 }} onClick={handleSendEDI} disabled={sending}>
            <Send size={14} /> {sending ? 'Sending…' : 'Send EDI File'}
          </button>
        </div>
        <div style={st.footerRight}>
          <button style={st.btnDanger} onClick={handleDeleteSafelite}>
            <Trash2 size={14} /> Delete Safelite EDI
          </button>
          <button style={st.btnDanger} onClick={handleDeleteAll}>
            <Trash2 size={14} /> Delete All EDI Transactions
          </button>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div style={st.toast}>{toast}</div>
      )}

    </div>
  );
};

/* ── Styles ─────────────────────────────────────────────────── */
const st: Record<string, React.CSSProperties> = {
  card:       { flex: 1, display: 'flex', flexDirection: 'column', margin: 24, borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', background: '#fff', position: 'relative' },

  header:     { background: '#16a34a', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  headerIcon: { width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle:{ fontSize: 18, fontWeight: 700, color: '#fff' },
  headerSub:  { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  closeBtn:   { background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' },

  body:        { flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, overflow: 'hidden', minHeight: 0 },

  networkCard:  { display: 'flex', flexDirection: 'column', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', flex: 1, minHeight: 0 },
  networkHeader:{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', flexShrink: 0 },
  networkBadge: { display: 'flex', alignItems: 'center', gap: 7 },
  networkName:  { fontSize: 13, fontWeight: 700, color: '#2563eb' },
  networkCount: { fontSize: 12, color: '#9ca3af', fontWeight: 500 },

  tableWrap: { flex: 1, overflowY: 'auto' as const },
  table:     { width: '100%', borderCollapse: 'collapse' as const },
  thead:     { background: '#16a34a', position: 'sticky' as const, top: 0, zIndex: 1 },
  th:        { padding: '10px 14px', fontSize: 12, fontWeight: 600, color: '#fff', textAlign: 'left' as const },
  tr:        { borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background 0.1s' },
  td:        { padding: '11px 14px', fontSize: 13, color: '#111827' },
  empty:     { padding: '28px 0', textAlign: 'center' as const, fontSize: 13, color: '#9ca3af', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 4 },

  footer:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderTop: '1px solid #e5e7eb', flexShrink: 0, flexWrap: 'wrap' as const, gap: 10 },
  footerLeft:  { display: 'flex', gap: 10 },
  footerRight: { display: 'flex', gap: 10 },

  btnPrimary: { display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', background: '#16a34a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' },
  btnOutline: { display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' },
  btnDanger:  { display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: '#fff', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#ef4444', cursor: 'pointer' },

  toast: { position: 'absolute', bottom: 72, left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500, boxShadow: '0 4px 16px rgba(0,0,0,0.18)', whiteSpace: 'nowrap' as const, zIndex: 100 },
};

export default SendEDIClaims;
