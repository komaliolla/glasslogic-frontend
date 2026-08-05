import React, { useState } from 'react';
import { DollarSign, X, CheckSquare, Square, Check, Trash2 } from 'lucide-react';
import type { InvoiceRecord } from '../types';

interface Props {
  invoices: InvoiceRecord[];
  onUpdateInvoice: (record: InvoiceRecord) => void;
  onDeleteInvoice: (id: number) => void;
  onClose: () => void;
}

interface DepoRowForm { paidDate: string; checkNumber: string; checkAmount: string; adjustment: string; }

const PaidInvoices: React.FC<Props> = ({ invoices, onUpdateInvoice, onDeleteInvoice, onClose }) => {
  const paid = invoices.filter(i => i.status === 'Paid');

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showDepo, setShowDepo] = useState(false);
  const [modalSelected, setModalSelected] = useState<Set<number>>(new Set());
  const [rowEdits, setRowEdits] = useState<Record<number, DepoRowForm>>({});

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

  const toggleModalRow = (id: number) =>
    setModalSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // Opens with no precondition — any rows already checked on the main table
  // carry over as a starting point, but you can pick invoices here regardless.
  const openDepo = () => {
    const init: Record<number, DepoRowForm> = {};
    for (const inv of paid) {
      init[inv.id] = {
        paidDate:    inv.paidDate ?? '',
        checkNumber: inv.checkNumber ?? '',
        checkAmount: inv.checkAmount ? String(inv.checkAmount) : '',
        adjustment:  inv.adjustment ? String(inv.adjustment) : '',
      };
    }
    setRowEdits(init);
    setModalSelected(new Set(selected));
    setShowDepo(true);
  };

  const updateRowEdit = (id: number, field: keyof DepoRowForm, value: string) =>
    setRowEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const applyDepo = () => {
    for (const inv of paid) {
      if (!modalSelected.has(inv.id)) continue;
      const edit = rowEdits[inv.id];
      if (!edit) continue;
      onUpdateInvoice({
        ...inv,
        paidDate:    edit.paidDate,
        checkNumber: edit.checkNumber.trim(),
        checkAmount: parseFloat(edit.checkAmount) || 0,
        adjustment:  parseFloat(edit.adjustment) || 0,
      });
    }
    setShowDepo(false);
    setSelected(new Set());
    setModalSelected(new Set());
  };

  const setAdjustment = (inv: InvoiceRecord, value: string) => {
    onUpdateInvoice({ ...inv, adjustment: parseFloat(value) || 0 });
  };

  const totalDue        = paid.reduce((s, i) => s + (i.amount || 0), 0);
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
            <button
              style={{ ...st.btnPrimary, opacity: paid.length === 0 ? 0.45 : 1 }}
              onClick={openDepo}
              disabled={paid.length === 0}
            >
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
            <strong>Note:</strong> Click Add Depo. any time — checking rows here first just pre-selects them; you can
            also pick which invoices the deposit covers directly inside the dialog.
          </div>

        </div>
      </div>

      {/* ── Add Deposit modal ── */}
      {showDepo && (
        <div style={dlg.overlay} onClick={e => e.target === e.currentTarget && setShowDepo(false)}>
          <div style={dlg.box}>
            <div style={dlg.header}>
              <div>
                <div style={dlg.title}>Add Deposit</div>
                <div style={dlg.sub}>{modalSelected.size} of {paid.length} invoice{paid.length !== 1 ? 's' : ''} selected</div>
              </div>
              <button style={dlg.closeBtn} onClick={() => setShowDepo(false)}><X size={16} color="#fff" /></button>
            </div>
            <div style={dlg.body}>
              <div style={dlg.selectedTableWrapper}>
                <table style={dlg.selectedTable}>
                  <thead>
                    <tr>
                      <th style={{ ...dlg.selTh, width: 32 }}></th>
                      <th style={dlg.selTh}>Invoice #</th>
                      <th style={dlg.selTh}>Date</th>
                      <th style={dlg.selTh}>Name</th>
                      <th style={{ ...dlg.selTh, textAlign: 'right' as const }}>Total Due</th>
                      <th style={dlg.selTh}>Paid Date</th>
                      <th style={dlg.selTh}>Check #</th>
                      <th style={{ ...dlg.selTh, textAlign: 'right' as const }}>Check Amount</th>
                      <th style={{ ...dlg.selTh, textAlign: 'right' as const }}>Adjustment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paid.map(inv => {
                      const edit = rowEdits[inv.id] ?? { paidDate: '', checkNumber: '', checkAmount: '', adjustment: '' };
                      const isModalSel = modalSelected.has(inv.id);
                      return (
                        <tr key={inv.id} style={{ background: isModalSel ? '#f0fdf4' : '#fff' }}>
                          <td style={{ ...dlg.selTd, textAlign: 'center' as const }}>
                            <button style={st.checkBtn} onClick={() => toggleModalRow(inv.id)}>
                              {isModalSel ? <CheckSquare size={15} color="#16a34a" /> : <Square size={15} color="#d1d5db" />}
                            </button>
                          </td>
                          <td style={{ ...dlg.selTd, fontWeight: 700, color: '#16a34a' }}>{inv.id}</td>
                          <td style={dlg.selTd}>{inv.date}</td>
                          <td style={dlg.selTd}>{inv.soldTo || ''}</td>
                          <td style={{ ...dlg.selTd, textAlign: 'right' as const }}>${(inv.amount || 0).toFixed(2)}</td>
                          <td style={dlg.selTd}>
                            <input
                              type="date"
                              value={edit.paidDate}
                              onChange={e => updateRowEdit(inv.id, 'paidDate', e.target.value)}
                              style={dlg.rowInput}
                            />
                          </td>
                          <td style={dlg.selTd}>
                            <input
                              type="text"
                              value={edit.checkNumber}
                              onChange={e => updateRowEdit(inv.id, 'checkNumber', e.target.value)}
                              placeholder="e.g. 1234"
                              style={dlg.rowInput}
                            />
                          </td>
                          <td style={dlg.selTd}>
                            <input
                              type="text" inputMode="decimal"
                              value={edit.checkAmount}
                              onChange={e => updateRowEdit(inv.id, 'checkAmount', e.target.value)}
                              placeholder="0.00"
                              style={{ ...dlg.rowInput, textAlign: 'right' as const }}
                            />
                          </td>
                          <td style={dlg.selTd}>
                            <input
                              type="text" inputMode="decimal"
                              value={edit.adjustment}
                              onChange={e => updateRowEdit(inv.id, 'adjustment', e.target.value)}
                              placeholder="0.00"
                              style={{ ...dlg.rowInput, textAlign: 'right' as const }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={dlg.footer}>
              <button style={dlg.btnSave} onClick={applyDepo}><Check size={14} /> Apply to Selected</button>
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
  box:      { background: '#fff', borderRadius: 12, width: 920, maxWidth: '96vw', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' },
  header:   { background: '#16a34a', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
  title:    { fontSize: 16, fontWeight: 700, color: '#fff' },
  sub:      { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  closeBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6, cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center' },
  body:     { padding: '18px 20px', display: 'flex', flexDirection: 'column' as const, gap: 14, maxHeight: '70vh', overflowY: 'auto' as const },
  selectedTableWrapper: { border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'auto' as const },
  selectedTable: { width: '100%', borderCollapse: 'collapse' as const, minWidth: 860 },
  selTh:    { padding: '8px 10px', fontSize: 11, fontWeight: 700, color: '#6b7280', textAlign: 'left' as const, background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase' as const, letterSpacing: 0.4, whiteSpace: 'nowrap' as const },
  selTd:    { padding: '6px 8px', fontSize: 12, color: '#111827', borderBottom: '1px solid #f3f4f6' },
  rowInput: { width: '100%', minWidth: 90, padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12, color: '#111827', outline: 'none', boxSizing: 'border-box' as const },
  footer:   { padding: '14px 20px 18px', display: 'flex', gap: 10, borderTop: '1px solid #f0f0f0' },
  btnSave:  { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#16a34a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' },
  btnCancel:{ marginLeft: 'auto', padding: '9px 16px', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' },
};

export default PaidInvoices;
