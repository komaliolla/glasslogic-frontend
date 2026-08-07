import React, { useState } from 'react';
import { DollarSign, X, CheckSquare, Square, Check, Trash2 } from 'lucide-react';
import type { InvoiceRecord } from '../types';

interface Props {
  invoices: InvoiceRecord[];
  onUpdateInvoice: (record: InvoiceRecord) => void;
  onDeleteInvoice: (id: number) => void;
  onClose: () => void;
}

interface DepoForm {
  date: string; name: string; totalDue: string;
  paidDate: string; checkNumber: string; checkAmount: string; adjustment: string;
}
const emptyDepoForm = (): DepoForm => ({ date: '', name: '', totalDue: '', paidDate: '', checkNumber: '', checkAmount: '', adjustment: '' });

// The rest of the app stores/displays dates as "MM/DD/YY" (see Invoice.tsx), but a
// native <input type="date"> only understands ISO "YYYY-MM-DD" — convert both ways
// so the calendar picker works while the stored/displayed format stays consistent.
const mdyToIso = (mdy: string): string => {
  const m = mdy.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
  if (!m) return '';
  const [, mm, dd, yy] = m;
  return `20${yy}-${mm}-${dd}`;
};
const isoToMdy = (iso: string): string => {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return '';
  const [, yyyy, mm, dd] = m;
  return `${mm}/${dd}/${yyyy.slice(2)}`;
};

const PaidInvoices: React.FC<Props> = ({ invoices, onUpdateInvoice, onDeleteInvoice, onClose }) => {
  const paid = invoices.filter(i => i.status === 'Paid');

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showDepo, setShowDepo] = useState(false);
  const [depoInvoiceId, setDepoInvoiceId] = useState('');
  const [depoForm, setDepoForm] = useState<DepoForm>(emptyDepoForm());
  const [depoError, setDepoError] = useState('');

  const toggleRow = (id: number) =>
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allSelected = paid.length > 0 && selected.size === paid.length;
  const toggleAll   = () => setSelected(allSelected ? new Set() : new Set(paid.map(i => i.id)));

  const handleDelete = () => {
    selected.forEach(id => onDeleteInvoice(id));
    setSelected(new Set());
  };

  const findByTypedId = (idStr: string) => {
    const trimmed = idStr.trim();
    if (!trimmed) return null;
    return invoices.find(i => String(i.id) === trimmed) ?? null;
  };

  const formFromInvoice = (inv: InvoiceRecord | null): DepoForm => inv
    ? {
        date:        inv.date ? mdyToIso(inv.date) : '',
        name:        inv.soldTo ?? '',
        totalDue:    inv.amount ? String(inv.amount) : '',
        paidDate:    inv.paidDate ?? '',
        checkNumber: inv.checkNumber ?? '',
        checkAmount: inv.checkAmount ? String(inv.checkAmount) : '',
        adjustment:  inv.adjustment ? String(inv.adjustment) : '',
      }
    : emptyDepoForm();

  // Pre-fills the invoice number if exactly one row was already checked on the main table.
  const openDepo = () => {
    const preId = selected.size === 1 ? String([...selected][0]) : '';
    setDepoInvoiceId(preId);
    setDepoForm(formFromInvoice(preId === '' ? null : findByTypedId(preId)));
    setDepoError('');
    setShowDepo(true);
  };

  // Looks up any existing invoice (paid or not) by the typed number so editing
  // an existing record's date/name/total due doesn't clobber unrelated fields —
  // if nothing matches, the fields just stay whatever the user typed.
  const handleInvoiceIdChange = (idStr: string) => {
    setDepoInvoiceId(idStr);
    setDepoError('');
    const inv = findByTypedId(idStr);
    if (inv) setDepoForm(formFromInvoice(inv));
  };

  const saveDepo = () => {
    const trimmedId = depoInvoiceId.trim();
    if (!trimmedId) { setDepoError('Enter an invoice number.'); return; }
    const id = Number(trimmedId);
    if (!Number.isFinite(id)) { setDepoError('Invoice # must be a number.'); return; }

    const existing = findByTypedId(trimmedId);
    onUpdateInvoice({
      id,
      date:        isoToMdy(depoForm.date) || depoForm.date,
      billTo:      existing?.billTo ?? '',
      soldTo:      depoForm.name,
      installDate: existing?.installDate ?? '',
      status:      'Paid',
      amount:      parseFloat(depoForm.totalDue) || 0,
      paidDate:    depoForm.paidDate,
      checkNumber: depoForm.checkNumber.trim(),
      checkAmount: parseFloat(depoForm.checkAmount) || 0,
      adjustment:  parseFloat(depoForm.adjustment) || 0,
    });
    setShowDepo(false);
    setSelected(new Set());
  };

  const setAdjustment = (inv: InvoiceRecord, value: string) => {
    onUpdateInvoice({ ...inv, adjustment: parseFloat(value) || 0 });
  };

  const totalDue         = paid.reduce((s, i) => s + (i.amount || 0), 0);
  const totalCheckAmount = paid.reduce((s, i) => s + (i.checkAmount || 0), 0);
  const totalAdjustment  = paid.reduce((s, i) => s + (i.adjustment || 0), 0);

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  return (
    <>
      <div style={st.card}>

        {/* ── Header ── */}
        <div style={st.header}>
          <div style={st.headerLeft}>
            <div style={st.headerIcon}><DollarSign size={20} color="#fff" /></div>
            <div>
              <div style={st.headerTitle}>Paid Invoices</div>
              <div style={st.headerSub}>Review payments and record deposits</div>
            </div>
          </div>
          <button style={st.closeBtn} onClick={onClose}><X size={18} color="#fff" /></button>
        </div>

        {/* ── Body ── */}
        <div style={st.body}>

          {/* Actions */}
          <div style={st.actions}>
            <button style={st.btnPrimary} onClick={openDepo}>
              <DollarSign size={14} color="#fff" /> Add Depo.
            </button>
            <button style={st.btnOutline} onClick={toggleAll}>
              {allSelected ? 'Deselect All' : 'Select All'}
            </button>
            <button
              style={{ ...st.btnOutline, ...st.btnDelete, opacity: selected.size === 0 ? 0.45 : 1 }}
              onClick={handleDelete}
              disabled={selected.size === 0}
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
                  <th style={{ ...st.th, width: 40 }}></th>
                  <th style={{ ...st.th, width: 80 }}>Invoice #</th>
                  <th style={{ ...st.th, width: 100 }}>Date</th>
                  <th style={st.th}>Name</th>
                  <th style={{ ...st.th, width: 110, textAlign: 'right' as const }}>Total Due</th>
                  <th style={{ ...st.th, width: 130 }}>Paid Date</th>
                  <th style={{ ...st.th, width: 100 }}>Check #</th>
                  <th style={{ ...st.th, width: 120, textAlign: 'right' as const }}>Check Amount</th>
                  <th style={{ ...st.th, width: 110, textAlign: 'right' as const }}>Adjustment</th>
                </tr>
              </thead>
              <tbody>
                {paid.map(inv => {
                  const isSel = selected.has(inv.id);
                  return (
                    <tr key={inv.id} style={{ ...st.tr, background: isSel ? '#f0fdf4' : '#fff' }}>
                      <td style={{ ...st.td, textAlign: 'center' as const }}>
                        <button style={st.checkBtn} onClick={() => toggleRow(inv.id)}>
                          {isSel ? <CheckSquare size={16} color="#16a34a" /> : <Square size={16} color="#d1d5db" />}
                        </button>
                      </td>
                      <td style={{ ...st.td, fontWeight: 700, color: '#16a34a' }}>{inv.id}</td>
                      <td style={st.td}>{inv.date}</td>
                      <td style={{ ...st.td, color: inv.soldTo ? '#111827' : '#9ca3af' }}>{inv.soldTo || ''}</td>
                      <td style={{ ...st.td, textAlign: 'right' as const, fontWeight: 600 }}>{fmt(inv.amount || 0)}</td>
                      <td style={{ ...st.td, color: inv.paidDate ? '#111827' : '#9ca3af' }}>{inv.paidDate || ''}</td>
                      <td style={{ ...st.td, color: inv.checkNumber ? '#111827' : '#9ca3af' }}>{inv.checkNumber || ''}</td>
                      <td style={{ ...st.td, textAlign: 'right' as const }}>{fmt(inv.checkAmount || 0)}</td>
                      <td style={{ ...st.td, textAlign: 'right' as const }}>
                        <input
                          type="text" inputMode="decimal"
                          value={inv.adjustment ? String(inv.adjustment) : ''}
                          placeholder="0.00"
                          onChange={e => setAdjustment(inv, e.target.value)}
                          style={st.adjInput}
                        />
                      </td>
                    </tr>
                  );
                })}
                {paid.length === 0 && (
                  <tr>
                    <td colSpan={9} style={st.emptyRow}>
                      No paid invoices yet — mark an invoice "Paid" from List of Invoices to see it here.
                    </td>
                  </tr>
                )}
              </tbody>
              {paid.length > 0 && (
                <tfoot>
                  <tr style={st.totalsRow}>
                    <td style={st.td}></td>
                    <td style={{ ...st.td, fontWeight: 700 }} colSpan={3}>Totals:</td>
                    <td style={{ ...st.td, textAlign: 'right' as const, fontWeight: 700 }}>{fmt(totalDue)}</td>
                    <td style={st.td}></td>
                    <td style={st.td}></td>
                    <td style={{ ...st.td, textAlign: 'right' as const, fontWeight: 700 }}>{fmt(totalCheckAmount)}</td>
                    <td style={{ ...st.td, textAlign: 'right' as const, fontWeight: 700 }}>{fmt(totalAdjustment)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          <div style={st.note}>
            <strong>Note:</strong> Type an existing invoice number to auto-fill its Date/Name/Total Due (still
            editable), or type a new number to record a deposit from scratch.
          </div>

        </div>
      </div>

      {/* ── Add Deposit modal (single invoice, Add-New-Customer style form) ── */}
      {showDepo && (
        <div style={dlg.overlay} onClick={e => e.target === e.currentTarget && setShowDepo(false)}>
          <div style={dlg.box}>
            <div style={dlg.header}>
              <div>
                <div style={dlg.title}>Add Deposit</div>
                <div style={dlg.sub}>Enter the invoice and check details</div>
              </div>
              <button style={dlg.closeBtn} onClick={() => setShowDepo(false)}><X size={16} color="#fff" /></button>
            </div>

            <div style={dlg.body}>
              {depoError && <div style={dlg.errorNote}>{depoError}</div>}

              <div style={dlg.field}>
                <label style={dlg.label}>Invoice # <span style={dlg.req}>*</span></label>
                <input
                  style={dlg.input}
                  type="text" inputMode="numeric"
                  value={depoInvoiceId}
                  onChange={e => handleInvoiceIdChange(e.target.value)}
                  placeholder="e.g. 15"
                />
              </div>

              <div style={dlg.row}>
                <div style={dlg.field}>
                  <label style={dlg.label}>Date</label>
                  <input
                    style={dlg.input}
                    type="date"
                    value={depoForm.date}
                    onChange={e => setDepoForm(f => ({ ...f, date: e.target.value }))}
                  />
                </div>
                <div style={dlg.field}>
                  <label style={dlg.label}>Name</label>
                  <input
                    style={dlg.input}
                    value={depoForm.name}
                    onChange={e => setDepoForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. APEX GLASS"
                  />
                </div>
                <div style={dlg.field}>
                  <label style={dlg.label}>Total Due</label>
                  <input
                    style={dlg.input}
                    type="text" inputMode="decimal"
                    value={depoForm.totalDue}
                    onChange={e => setDepoForm(f => ({ ...f, totalDue: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div style={dlg.row}>
                <div style={dlg.field}>
                  <label style={dlg.label}>Paid Date</label>
                  <input
                    style={dlg.input}
                    type="date"
                    value={depoForm.paidDate}
                    onChange={e => setDepoForm(f => ({ ...f, paidDate: e.target.value }))}
                  />
                </div>
                <div style={dlg.field}>
                  <label style={dlg.label}>Cheque #</label>
                  <input
                    style={dlg.input}
                    value={depoForm.checkNumber}
                    onChange={e => setDepoForm(f => ({ ...f, checkNumber: e.target.value }))}
                    placeholder="e.g. 1234"
                  />
                </div>
              </div>

              <div style={dlg.row}>
                <div style={dlg.field}>
                  <label style={dlg.label}>Check Amount</label>
                  <input
                    style={dlg.input}
                    type="text" inputMode="decimal"
                    value={depoForm.checkAmount}
                    onChange={e => setDepoForm(f => ({ ...f, checkAmount: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div style={dlg.field}>
                  <label style={dlg.label}>Adjustment</label>
                  <input
                    style={dlg.input}
                    type="text" inputMode="decimal"
                    value={depoForm.adjustment}
                    onChange={e => setDepoForm(f => ({ ...f, adjustment: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div style={dlg.footer}>
              <button style={dlg.btnSave} onClick={saveDepo}><Check size={14} /> Save Deposit</button>
              <button style={dlg.btnCancel} onClick={() => setShowDepo(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
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

  body:       { padding: 24, display: 'flex', flexDirection: 'column', gap: 16, flex: 1, overflowY: 'auto' as const },

  actions:    { display: 'flex', gap: 10, flexWrap: 'wrap' as const },
  btnPrimary: { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#16a34a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' },
  btnOutline: { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' },
  btnDelete:  { borderColor: '#fecaca' },

  tableWrapper: { border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'auto' as const },
  table:        { width: '100%', borderCollapse: 'collapse' as const, minWidth: 860 },
  tableHead:    { background: '#16a34a' },
  th:           { padding: '12px 14px', fontSize: 12, fontWeight: 600, color: '#fff', textAlign: 'left' as const, whiteSpace: 'nowrap' as const },
  tr:           { borderBottom: '1px solid #f3f4f6' },
  td:           { padding: '11px 14px', fontSize: 13, color: '#111827' },
  emptyRow:     { padding: 28, textAlign: 'center' as const, fontSize: 13, color: '#9ca3af' },
  checkBtn:     { background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  adjInput:     { width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, textAlign: 'right' as const, outline: 'none', boxSizing: 'border-box' as const },
  totalsRow:    { background: '#f0fdf4', borderTop: '2px solid #bbf7d0' },

  note:       { background: '#f0fdf4', border: '1px solid #d1fae5', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#374151' },
};

const dlg: Record<string, React.CSSProperties> = {
  overlay:  { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  box:      { background: '#fff', borderRadius: 12, width: 480, maxWidth: '94vw', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' },
  header:   { background: '#16a34a', padding: '18px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
  title:    { fontSize: 17, fontWeight: 700, color: '#fff' },
  sub:      { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 3 },
  closeBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6, cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center' },
  body:     { padding: '20px', display: 'flex', flexDirection: 'column' as const, gap: 14, maxHeight: '70vh', overflowY: 'auto' as const },
  errorNote:{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 7, padding: '9px 12px', fontSize: 12, color: '#dc2626' },
  row:      { display: 'flex', gap: 12 },
  field:    { display: 'flex', flexDirection: 'column' as const, gap: 5, flex: 1 },
  label:    { fontSize: 12, fontWeight: 600, color: '#374151' },
  req:      { color: '#ef4444' },
  input:    { padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: 7, fontSize: 13, color: '#111827', outline: 'none', boxSizing: 'border-box' as const, width: '100%' },
  footer:   { padding: '14px 20px 18px', display: 'flex', gap: 10, borderTop: '1px solid #f0f0f0' },
  btnSave:  { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#16a34a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' },
  btnCancel:{ marginLeft: 'auto', padding: '9px 16px', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' },
};

export default PaidInvoices;
