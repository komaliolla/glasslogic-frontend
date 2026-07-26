import React, { useState, useEffect } from 'react';
import { FileText, X, Plus, Trash2, Calendar, Search, ArrowLeft, ReceiptText, ChevronDown } from 'lucide-react';
import { api, type Customer, type BusinessType, type VehicleMake, type Discount } from '../api/client';
import { InvoiceRecord } from '../types';

const STATUS_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  Paid:    { bg: '#f0fdf4', color: '#16a34a', dot: '#16a34a' },
  Saved:   { bg: '#eff6ff', color: '#2563eb', dot: '#3b82f6' },
  Overdue: { bg: '#fff1f2', color: '#e11d48', dot: '#f43f5e' },
  Draft:   { bg: '#f8fafc', color: '#64748b', dot: '#94a3b8' },
};

const MOCK_INVOICES: InvoiceRecord[] = [
  { id: 18, date: '05/29/26', billTo: 'TEST SHOP',  soldTo: '',            installDate: '',        status: 'Saved',   amount: 438.29 },
  { id: 17, date: '05/27/26', billTo: '',            soldTo: '',            installDate: '',        status: 'Draft',   amount: 0      },
  { id: 16, date: '05/27/26', billTo: '',            soldTo: '',            installDate: '',        status: 'Draft',   amount: 0      },
  { id: 15, date: '04/22/26', billTo: 'TEST SHOP',  soldTo: 'KOMALI OLLA', installDate: '',        status: 'Paid',    amount: 310.48 },
  { id: 14, date: '04/21/26', billTo: 'TEST SHOP',  soldTo: 'DEJFKS',      installDate: '',        status: 'Paid',    amount: 524.75 },
  { id: 13, date: '04/17/26', billTo: 'TEST SHOP',  soldTo: 'VDSZG',       installDate: '04/17/26', status: 'Paid',  amount: 189.00 },
  { id: 12, date: '04/17/26', billTo: '',            soldTo: '',            installDate: '',        status: 'Draft',   amount: 0      },
  { id: 11, date: '03/30/26', billTo: 'TEST SHOP',  soldTo: 'DKWFNKSE',   installDate: '',        status: 'Overdue', amount: 876.50 },
  { id: 10, date: '03/26/26', billTo: 'TEST SHOP',  soldTo: 'KOMALI OLLA', installDate: '',        status: 'Paid',    amount: 250.00 },
  { id:  9, date: '03/26/26', billTo: '',            soldTo: '',            installDate: '',        status: 'Draft',   amount: 0      },
  { id:  8, date: '03/26/26', billTo: '',            soldTo: '',            installDate: '',        status: 'Draft',   amount: 0      },
  { id:  7, date: '03/16/26', billTo: '',            soldTo: '',            installDate: '',        status: 'Draft',   amount: 0      },
  { id:  6, date: '03/16/26', billTo: '',            soldTo: '',            installDate: '',        status: 'Draft',   amount: 0      },
  { id:  5, date: '03/16/26', billTo: '',            soldTo: '',            installDate: '',        status: 'Draft',   amount: 0      },
  { id:  4, date: '03/16/26', billTo: 'TEST SHOP',  soldTo: '',            installDate: '03/16/26', status: 'Paid',   amount: 370.81 },
  { id:  3, date: '03/14/26', billTo: '',            soldTo: '',            installDate: '',        status: 'Draft',   amount: 0      },
  { id:  2, date: '03/11/26', billTo: '',            soldTo: '',            installDate: '',        status: 'Draft',   amount: 0      },
];

/* ── List-view styles (matches CustomerList design) ────────── */
const lst: Record<string, React.CSSProperties> = {
  card:        { flex: 1, display: 'flex', flexDirection: 'column', margin: 24, borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', background: '#fff' },

  header:      { background: '#16a34a', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  headerLeft:  { display: 'flex', alignItems: 'center', gap: 14 },
  headerIcon:  { width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 700, color: '#fff' },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  closeBtn:    { background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' },

  /* body: flex column, overflow hidden — table scrolls independently */
  body:          { padding: 24, display: 'flex', flexDirection: 'column', gap: 16, flex: 1, overflow: 'hidden', minHeight: 0 },
  searchSection: { display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 },
  searchLabel:   { fontSize: 13, fontWeight: 600, color: '#374151' },
  searchInput:   { width: '100%', padding: '10px 14px', border: '1.5px solid #16a34a', borderRadius: 8, fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box' as const },

  actions:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexShrink: 0 },
  actionsLeft: { display: 'flex', gap: 10, flexWrap: 'wrap' as const },
  btnPrimary:  { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#16a34a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' },
  btnOutline:  { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' },
  btnOutlineActive: { background: '#f0fdf4', border: '1px solid #86efac', color: '#16a34a' },
  btnDelete:   { borderColor: '#fecaca' },
  btnInsert:   { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: '#16a34a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' },

  /* table takes remaining space and scrolls */
  tableWrapper: { flex: 1, border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 },
  tableScroll:  { flex: 1, overflowY: 'auto' as const },
  table:        { width: '100%', borderCollapse: 'collapse' as const },
  tableHead:    { background: '#16a34a', position: 'sticky' as const, top: 0, zIndex: 2 },
  th:           { padding: '12px 18px', fontSize: 13, fontWeight: 600, color: '#fff', textAlign: 'left' as const },
  tr:           { borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background 0.1s' },
  td:           { padding: '13px 18px', fontSize: 13, color: '#111827' },
  emptyRow:     { padding: 32, textAlign: 'center' as const, fontSize: 13, color: '#9ca3af' },

  badge:        { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
  badgeDot:     { width: 6, height: 6, borderRadius: '50%' },
  badgeBtn:     { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' as const, flexShrink: 0 },

  footer:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  footerOpenBtn:{ background: 'none', border: 'none', color: '#16a34a', fontWeight: 600, fontSize: 12, cursor: 'pointer', padding: 0 },
};

/* ── Invoice List View ──────────────────────────────────────── */
const STATUSES: InvoiceRecord['status'][] = ['Draft', 'Saved', 'Paid', 'Overdue'];

const InvoiceListView: React.FC<{
  invoices: InvoiceRecord[];
  onNew: () => void;
  onOpen: (id: number) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}> = ({ invoices, onNew, onOpen, onDelete, onClose }) => {
  const [liveSearch,    setLiveSearch]    = useState('');
  const [search,        setSearch]        = useState('');
  const [sortByInstall, setSortByInstall] = useState(false);
  const [selected,      setSelected]      = useState<number | null>(null);
  const [statusMap,     setStatusMap]     = useState<Record<number, InvoiceRecord['status']>>({});
  const [statusDrop,    setStatusDrop]    = useState<{ id: number; top: number; left: number } | null>(null);

  const getStatus = (inv: InvoiceRecord) => statusMap[inv.id] ?? inv.status;

  const openStatusDrop = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setStatusDrop({ id, top: rect.bottom + 4, left: rect.left });
  };

  const pickStatus = (id: number, s: InvoiceRecord['status']) => {
    setStatusMap(prev => ({ ...prev, [id]: s }));
    setStatusDrop(null);
  };

  const doSearch  = () => setSearch(liveSearch);
  const doShowAll = () => { setLiveSearch(''); setSearch(''); setSelected(null); setSortByInstall(false); };

  const filtered = invoices
    .filter(inv => {
      const q = search.toLowerCase();
      return !q ||
        String(inv.id).includes(q) ||
        inv.billTo.toLowerCase().includes(q) ||
        inv.soldTo.toLowerCase().includes(q) ||
        inv.date.includes(q);
    })
    .sort((a, b) => {
      if (!sortByInstall) return 0;
      if (!a.installDate && !b.installDate) return 0;
      if (!a.installDate) return 1;
      if (!b.installDate) return -1;
      return a.installDate.localeCompare(b.installDate);
    });

  const goFirst = () => { if (filtered.length) setSelected(filtered[0].id); };
  const goLast  = () => { if (filtered.length) setSelected(filtered[filtered.length - 1].id); };

  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const selectedInv  = selected !== null ? invoices.find(i => i.id === selected) ?? null : null;

  const handleDelete = () => {
    if (selected !== null) { onDelete(selected); setSelected(null); }
  };

  return (
    <>
      <div style={lst.card}>

        {/* ── Header ── */}
        <div style={lst.header}>
          <div style={lst.headerLeft}>
            <div style={lst.headerIcon}><ReceiptText size={20} color="#fff" /></div>
            <div>
              <div style={lst.headerTitle}>List of Invoices</div>
              <div style={lst.headerSub}>{invoices.length} records · ${totalRevenue.toFixed(2)} collected</div>
            </div>
          </div>
          <button style={lst.closeBtn} onClick={onClose}><X size={18} color="#fff" /></button>
        </div>

        {/* ── Body ── */}
        <div style={lst.body}>

          {/* Search */}
          <div style={lst.searchSection}>
            <label style={lst.searchLabel}>Search:</label>
            <input
              style={lst.searchInput}
              placeholder="Enter invoice #, bill to, sold to, or date..."
              value={liveSearch}
              onChange={e => setLiveSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
            />
          </div>

          {/* Actions */}
          <div style={lst.actions}>
            <div style={lst.actionsLeft}>
              <button style={lst.btnPrimary} onClick={doSearch}>
                <Search size={14} color="#fff" /> Invoice Search
              </button>
              <button style={lst.btnOutline} onClick={goFirst}>First</button>
              <button style={lst.btnOutline} onClick={goLast}>Last</button>
              <button style={lst.btnOutline} onClick={doShowAll}>Show All</button>
              <button
                style={{ ...lst.btnOutline, ...(sortByInstall ? lst.btnOutlineActive : {}) }}
                onClick={() => setSortByInstall(v => !v)}
              >
                Install Date Sort {sortByInstall ? '↑' : '↓'}
              </button>
              <button
                style={{ ...lst.btnOutline, ...lst.btnDelete, opacity: selected === null ? 0.45 : 1 }}
                onClick={handleDelete}
                disabled={selected === null}
              >
                <Trash2 size={14} color="#ef4444" />
                <span style={{ color: '#ef4444' }}>Delete</span>
              </button>
            </div>
            <button style={lst.btnInsert} onClick={onNew}>
              <Plus size={14} color="#fff" /> Insert
            </button>
          </div>

          {/* Table — scrollable wrapper */}
          <div style={lst.tableWrapper}>
            <div style={lst.tableScroll}>
              <table style={lst.table}>
                <thead>
                  <tr style={lst.tableHead}>
                    <th style={{ ...lst.th, width: 80 }}>Number</th>
                    <th style={{ ...lst.th, width: 100 }}>Date</th>
                    <th style={lst.th}>Bill To</th>
                    <th style={lst.th}>Sold To</th>
                    <th style={{ ...lst.th, width: 120 }}>Install Date</th>
                    <th style={{ ...lst.th, width: 110, textAlign: 'right' as const }}>Amount</th>
                    <th style={{ ...lst.th, width: 130 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(inv => {
                    const isSel   = selected === inv.id;
                    const status  = getStatus(inv);
                    const sStyle  = STATUS_STYLE[status];
                    return (
                      <tr
                        key={inv.id}
                        style={{ ...lst.tr, background: isSel ? '#f0fdf4' : '#fff', outline: isSel ? '1px solid #bbf7d0' : 'none' }}
                        onClick={() => setSelected(isSel ? null : inv.id)}
                        onDoubleClick={() => onOpen(inv.id)}
                      >
                        <td style={{ ...lst.td, fontWeight: 700, color: '#16a34a' }}>{inv.id}</td>
                        <td style={lst.td}>{inv.date}</td>
                        <td style={{ ...lst.td, color: inv.billTo ? '#111827' : '#9ca3af' }}>{inv.billTo || ''}</td>
                        <td style={{ ...lst.td, color: inv.soldTo ? '#111827' : '#9ca3af' }}>{inv.soldTo || ''}</td>
                        <td style={{ ...lst.td, color: inv.installDate ? '#111827' : '#9ca3af' }}>{inv.installDate || ''}</td>
                        <td style={{ ...lst.td, textAlign: 'right' as const, fontWeight: 600 }}>
                          {inv.amount > 0 ? `$${inv.amount.toFixed(2)}` : ''}
                        </td>
                        <td style={lst.td}>
                          <button
                            style={{ ...lst.badgeBtn, background: sStyle.bg, color: sStyle.color }}
                            onClick={e => openStatusDrop(e, inv.id)}
                            title="Click to change status"
                          >
                            <span style={{ ...lst.badgeDot, background: sStyle.dot }} />
                            {status} <ChevronDown size={10} strokeWidth={2.5} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} style={lst.emptyRow}>
                        {invoices.length === 0
                          ? 'No invoices yet — fill in the invoice form and click Save.'
                          : 'No invoices match your search.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div style={lst.footer}>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>
              {filtered.length} of {invoices.length} records{search ? ` matching "${search}"` : ''}
            </span>
            {selectedInv && (
              <span style={{ fontSize: 12, color: '#374151', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ ...lst.badge, background: STATUS_STYLE[getStatus(selectedInv)].bg, color: STATUS_STYLE[getStatus(selectedInv)].color }}>
                  <span style={{ ...lst.badgeDot, background: STATUS_STYLE[getStatus(selectedInv)].dot }} />
                  {getStatus(selectedInv)}
                </span>
                Invoice #{selectedInv.id} · {selectedInv.billTo || 'No bill-to'}
                <span style={{ color: '#d1d5db' }}>|</span>
                <button style={lst.footerOpenBtn} onClick={() => onOpen(selectedInv.id)}>Open to edit →</button>
              </span>
            )}
          </div>

        </div>
      </div>

      {/* ── Status dropdown (fixed, outside card so it's never clipped) ── */}
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
            overflow: 'hidden', minWidth: 140,
          }}>
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => pickStatus(statusDrop.id, s)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '9px 14px', background: 'none',
                  border: 'none', cursor: 'pointer', fontSize: 13,
                  borderBottom: s !== 'Overdue' ? '1px solid #f3f4f6' : 'none',
                  color: STATUS_STYLE[s].color, fontWeight: 600,
                }}
              >
                <span style={{ ...lst.badgeDot, background: STATUS_STYLE[s].dot }} />
                {s}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
};

const COMPANY = {
  name:  'COMPLETE AUTOGLASS',
  addr1: '974 MAIN ST.',
  addr2: 'CRETE, IL. 60417',
  phone: '(708)672-3322',
  fax:   '(708)672-3525',
  taxId: '36-3878288',
};

interface LineItem {
  id: number;
  partNumber: string;
  description: string;
  type: string;
  qty: string;
  list: string;
  sell: string;
}

const PART_TYPES = ['WINDSHIELD', 'TEMPERED', 'LAMINATED', 'MISC', 'LABOR', 'KIT'];
const BLANK_ROWS = 5;

function mkLine(id: number): LineItem {
  return { id, partNumber: '', description: '', type: '', qty: '', list: '', sell: '' };
}

interface Props {
  onClose: () => void;
  startView?: 'list' | 'editor';
  invoices?: InvoiceRecord[];
  onSaveInvoice?: (record: InvoiceRecord) => void;
  onDeleteInvoice?: (id: number) => void;
  nextInvoiceId?: number;
}

const Invoice: React.FC<Props> = ({ onClose, startView = 'list', invoices = [], onSaveInvoice, onDeleteInvoice, nextInvoiceId = 19 }) => {
  /* ── Reference data from MySQL ── */
  const [customers,    setCustomers]    = useState<Customer[]>([]);
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [vehicleMakes, setVehicleMakes] = useState<VehicleMake[]>([]);
  const [discounts,    setDiscounts]    = useState<Discount[]>([]);

  useEffect(() => {
    api.getCustomers().then(setCustomers).catch(() => {});
    api.getBusinessTypes().then(setBusinessTypes).catch(() => {});
    api.getMakes().then(setVehicleMakes).catch(() => {});
    api.getDiscounts().then(setDiscounts).catch(() => {});
  }, []);

  /* ── Bill To ── */
  const [billName,    setBillName]    = useState('TEST SHOP');
  const [billAddr1,   setBillAddr1]   = useState('');
  const [billAddr2,   setBillAddr2]   = useState('');
  const [billCity,    setBillCity]    = useState('');
  const [billSt,      setBillSt]      = useState('IL');
  const [billZip,     setBillZip]     = useState('');
  const [billPhone1,  setBillPhone1]  = useState('');
  const [billExt1,    setBillExt1]    = useState('');
  const [billPhone2,  setBillPhone2]  = useState('');
  const [billExt2,    setBillExt2]    = useState('');
  const [bizType,     setBizType]     = useState('');
  const [ediCode,     setEdiCode]     = useState('');

  /* ── Sold To ── */
  const [soldName,    setSoldName]    = useState('');
  const [soldAddr1,   setSoldAddr1]   = useState('');
  const [soldAddr2,   setSoldAddr2]   = useState('');
  const [soldCity,    setSoldCity]    = useState('');
  const [soldSt,      setSoldSt]      = useState('');
  const [soldZip,     setSoldZip]     = useState('');
  const [soldPhone1,  setSoldPhone1]  = useState('');
  const [soldExt1,    setSoldExt1]    = useState('');
  const [soldPhone2,  setSoldPhone2]  = useState('');
  const [soldExt2,    setSoldExt2]    = useState('');
  const [claimNum,    setClaimNum]    = useState('');
  const [policyPo,    setPolicyPo]    = useState('');

  /* ── Claim ── */
  const [year,        setYear]        = useState('2018');
  const [make,        setMake]        = useState('HYUNDAI');
  const [model,       setModel]       = useState('ELANTRA 4DSD');
  const [color,       setColor]       = useState('');
  const [licenseNum,  setLicenseNum]  = useState('');
  const [vin,         setVin]         = useState('');
  const [agency,      setAgency]      = useState('TEST SHOP');
  const [lossDate,    setLossDate]    = useState('');

  /* ── Line Items ── */
  const [lines, setLines] = useState<LineItem[]>([
    { id: 1, partNumber: 'FW04353GTY', description: 'WINDSHIELD', type: 'WINDSHIELD', qty: '1.00', list: '620.95', sell: '310.48' },
    { id: 2, partNumber: 'GGG FW4352', description: 'MOULDING',   type: 'MISC',       qty: '1.00', list: '60.34',  sell: '60.34'  },
    ...Array.from({ length: BLANK_ROWS - 2 }, (_, i) => mkLine(i + 3)),
  ]);

  /* ── Totals / Payment ── */
  const [labor,      setLabor]      = useState('100.00');
  const [tax,        setTax]        = useState('27.81');
  const [deductible, setDeductible] = useState('0.00');
  const [notes,      setNotes]      = useState('');
  const [payCash,    setPayCash]    = useState(false);
  const [payCheck,   setPayCheck]   = useState(false);
  const [payCredit,  setPayCredit]  = useState(false);
  const [complaint,  setComplaint]  = useState('');
  const [showPrint,  setShowPrint]  = useState(false);
  const [invoiceNum] = useState(18);
  const [view, setView] = useState<'list' | 'editor'>(startView);
  const [activeInvoice, setActiveInvoice] = useState<InvoiceRecord | null>(null);

  /* Pre-fill Bill To / Sold To when opening an existing invoice */
  useEffect(() => {
    if (view === 'editor' && activeInvoice) {
      setBillName(activeInvoice.billTo || '');
      setSoldName(activeInvoice.soldTo || '');
    }
  }, [activeInvoice]);

  const updateLine = (id: number, field: keyof LineItem, val: string) =>
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: val } : l));

  const addLine = () =>
    setLines(prev => [...prev, mkLine(Date.now())]);

  const deleteLine = (id: number) =>
    setLines(prev => prev.filter(l => l.id !== id));

  const selectBillCustomer = (name: string) => {
    const c = customers.find(x => x.name === name);
    if (!c) { setBillName(name); return; }
    // address format: "101 Main St, Springfield, IL"
    const parts = c.address.split(',').map(p => p.trim());
    setBillName(c.name);
    setBillAddr1(parts[0] ?? '');
    setBillCity(parts[1] ?? '');
    const stZip = (parts[2] ?? '').trim().split(' ');
    setBillSt(stZip[0] ?? '');
    setBillZip(stZip[1] ?? '');
    setBillPhone1(c.phone);
  };

  const copyToSoldTo = () => {
    setSoldName(billName); setSoldAddr1(billAddr1); setSoldAddr2(billAddr2);
    setSoldCity(billCity); setSoldSt(billSt); setSoldZip(billZip);
    setSoldPhone1(billPhone1); setSoldExt1(billExt1);
    setSoldPhone2(billPhone2); setSoldExt2(billExt2);
  };

  const [selectedDiscountCode, setSelectedDiscountCode] = useState('');

  /* ── Derived totals ── */
  const sellTotal = lines.reduce((s, l) => s + (parseFloat(l.sell) || 0), 0);
  const subTotal  = sellTotal;
  const taxAmt    = parseFloat(tax) || 0;
  const dedAmt    = parseFloat(deductible) || 0;
  const laborAmt  = parseFloat(labor) || 0;

  const selectedDiscount = discounts.find(d => d.discount_code === selectedDiscountCode) ?? null;
  const discountAmt = selectedDiscount
    ? lines.reduce((sum, line) => {
        const listPrice = parseFloat(line.list) || 0;
        if (!listPrice || !line.type) return sum;
        const partType = line.type === 'WINDSHIELD' ? 'Windshield'
                       : line.type === 'TEMPERED'   ? 'Tempered'
                       : line.type === 'LAMINATED'  ? 'Flat'
                       : null;
        if (!partType) return sum;
        const detail = selectedDiscount.details.find(d => d.part_type === partType);
        return sum + (detail ? listPrice * (detail.discount_amount / 100) : 0);
      }, 0)
    : 0;

  const totalDue = subTotal + laborAmt + taxAmt - dedAmt - discountAmt;

  const handleSave = () => {
    const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
    const record: InvoiceRecord = {
      id:          activeInvoice?.id ?? nextInvoiceId,
      date:        today,
      billTo:      billName,
      soldTo:      soldName,
      installDate: lossDate || '',
      status:      'Saved',
      amount:      totalDue,
    };
    onSaveInvoice?.(record);
    setView('list');
  };

  const allInvoices = [...invoices, ...MOCK_INVOICES];

  if (view === 'list') {
    return (
      <InvoiceListView
        invoices={allInvoices}
        onNew={() => { setActiveInvoice(null); setView('editor'); }}
        onOpen={(id) => { setActiveInvoice(allInvoices.find(r => r.id === id) ?? null); setView('editor'); }}
        onDelete={(id) => { onDeleteInvoice?.(id); }}
        onClose={onClose}
      />
    );
  }

  return (
    <div style={s.page}>
      {/* ── Header ── */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          {startView === 'list' && (
            <button style={s.backBtn} onClick={() => setView('list')}>
              <ArrowLeft size={15} color="#fff" />
            </button>
          )}
          <div style={s.headerIcon}><FileText size={18} color="#fff" /></div>
          <div>
            <div style={s.headerTitle}>Invoice #{invoiceNum}</div>
            <div style={s.headerSub}>Create and manage invoice details</div>
          </div>
        </div>
        <button style={s.closeBtn} onClick={onClose}><X size={16} color="#fff" /></button>
      </div>

      {/* ── Scrollable body ── */}
      <div style={s.body}>

        {/* ── Bill To + Sold To side by side ── */}
        <div style={s.twoCol}>

          {/* Bill To */}
          <div style={s.section}>
            <div style={s.sectionHead}>
              <span style={s.sectionTitle}>Bill To</span>
              <button style={s.copyBtn} onClick={copyToSoldTo}>Copy to Sold To</button>
            </div>
            <div style={s.fieldGrid}>
              <FormRow label="Name">
                <select style={s.select} value={billName} onChange={e => selectBillCustomer(e.target.value)}>
                  {customers.map(c => <option key={c.id}>{c.name}</option>)}
                </select>
              </FormRow>
              <FormRow label="Addr 1"><input style={s.input} value={billAddr1} onChange={e => setBillAddr1(e.target.value)} /></FormRow>
              <FormRow label="Addr 2"><input style={s.input} value={billAddr2} onChange={e => setBillAddr2(e.target.value)} /></FormRow>
              <div style={s.inlineRow}>
                <FormRow label="City" flex={3}><input style={s.input} value={billCity} onChange={e => setBillCity(e.target.value)} /></FormRow>
                <FormRow label="St" flex={1}><input style={{ ...s.input, textAlign: 'center' }} value={billSt} onChange={e => setBillSt(e.target.value)} maxLength={2} /></FormRow>
                <FormRow label="Zip" flex={1.5}><input style={s.input} value={billZip} onChange={e => setBillZip(e.target.value)} /></FormRow>
              </div>
              <div style={s.inlineRow}>
                <FormRow label="Phone 1" flex={2}><input style={s.input} placeholder="(   ) -" value={billPhone1} onChange={e => setBillPhone1(e.target.value)} /></FormRow>
                <FormRow label="ext" flex={1}><input style={s.input} value={billExt1} onChange={e => setBillExt1(e.target.value)} /></FormRow>
                <FormRow label="Phone 2" flex={2}><input style={s.input} placeholder="(   ) -" value={billPhone2} onChange={e => setBillPhone2(e.target.value)} /></FormRow>
                <FormRow label="ext" flex={1}><input style={s.input} value={billExt2} onChange={e => setBillExt2(e.target.value)} /></FormRow>
              </div>
              <div style={s.inlineRow}>
                <FormRow label="Business Type" flex={2}>
                  <select style={s.select} value={bizType} onChange={e => setBizType(e.target.value)}>
                    <option value=""></option>
                    {businessTypes.map(b => <option key={b.id}>{b.name}</option>)}
                  </select>
                </FormRow>
                <FormRow label="EDI Discount Code" flex={2}>
                  <input style={s.input} value={ediCode} onChange={e => setEdiCode(e.target.value)} />
                </FormRow>
              </div>
            </div>
          </div>

          {/* Sold To */}
          <div style={s.section}>
            <div style={s.sectionHead}>
              <span style={s.sectionTitle}>Sold To</span>
            </div>
            <div style={s.fieldGrid}>
              <FormRow label="Name"><input style={s.input} value={soldName} onChange={e => setSoldName(e.target.value)} /></FormRow>
              <FormRow label="Addr 1"><input style={s.input} value={soldAddr1} onChange={e => setSoldAddr1(e.target.value)} /></FormRow>
              <FormRow label="Addr 2"><input style={s.input} value={soldAddr2} onChange={e => setSoldAddr2(e.target.value)} /></FormRow>
              <div style={s.inlineRow}>
                <FormRow label="City" flex={3}><input style={s.input} value={soldCity} onChange={e => setSoldCity(e.target.value)} /></FormRow>
                <FormRow label="St" flex={1}><input style={{ ...s.input, textAlign: 'center' }} value={soldSt} onChange={e => setSoldSt(e.target.value)} maxLength={2} /></FormRow>
                <FormRow label="Zip" flex={1.5}><input style={s.input} value={soldZip} onChange={e => setSoldZip(e.target.value)} /></FormRow>
              </div>
              <div style={s.inlineRow}>
                <FormRow label="Phone 1" flex={2}><input style={s.input} placeholder="(   ) -" value={soldPhone1} onChange={e => setSoldPhone1(e.target.value)} /></FormRow>
                <FormRow label="ext" flex={1}><input style={s.input} value={soldExt1} onChange={e => setSoldExt1(e.target.value)} /></FormRow>
                <FormRow label="Phone 2" flex={2}><input style={s.input} placeholder="(   ) -" value={soldPhone2} onChange={e => setSoldPhone2(e.target.value)} /></FormRow>
                <FormRow label="ext" flex={1}><input style={s.input} value={soldExt2} onChange={e => setSoldExt2(e.target.value)} /></FormRow>
              </div>
              <div style={s.inlineRow}>
                <FormRow label="Claim # / EDI Dispatch #" flex={2}><input style={s.input} value={claimNum} onChange={e => setClaimNum(e.target.value)} /></FormRow>
                <FormRow label="Policy / PO" flex={2}><input style={s.input} value={policyPo} onChange={e => setPolicyPo(e.target.value)} /></FormRow>
              </div>
            </div>
          </div>
        </div>

        {/* ── Claim ── */}
        <div style={s.section}>
          <div style={s.sectionHead}>
            <span style={s.sectionTitle}>Claim</span>
          </div>
          <div style={{ ...s.inlineRow, flexWrap: 'wrap' }}>
            <FormRow label="Year" flex={1}><input style={s.input} value={year} onChange={e => setYear(e.target.value)} /></FormRow>
            <FormRow label="Make" flex={2}>
              <select style={s.select} value={make} onChange={e => setMake(e.target.value)}>
                {vehicleMakes.map(m => <option key={m.id}>{m.name.toUpperCase()}</option>)}
              </select>
            </FormRow>
            <FormRow label="Model" flex={3}><input style={s.input} value={model} onChange={e => setModel(e.target.value)} /></FormRow>
            <FormRow label="Color" flex={2}><input style={s.input} value={color} onChange={e => setColor(e.target.value)} /></FormRow>
            <FormRow label="License #" flex={2}><input style={s.input} value={licenseNum} onChange={e => setLicenseNum(e.target.value)} /></FormRow>
          </div>
          <div style={{ ...s.inlineRow, marginTop: 8 }}>
            <FormRow label="VIN #" flex={3}><input style={s.input} value={vin} onChange={e => setVin(e.target.value)} /></FormRow>
            <FormRow label="Agency" flex={3}>
              <select style={s.select} value={agency} onChange={e => setAgency(e.target.value)}>
                {customers.map(c => <option key={c.id}>{c.name}</option>)}
              </select>
            </FormRow>
            <FormRow label="Loss Date" flex={2}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="date"
                  style={{ ...s.input, paddingRight: 32 }}
                  value={lossDate}
                  onChange={e => setLossDate(e.target.value)}
                />
              </div>
            </FormRow>
          </div>
        </div>

        {/* ── Line Items ── */}
        <div style={s.section}>
          <div style={s.sectionHead}>
            <span style={s.sectionTitle}>Line Items</span>
          </div>
          <div style={s.tableWrapper}>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={{ ...s.th, width: 32 }}></th>
                  <th style={{ ...s.th, width: '18%' }}>Part Number</th>
                  <th style={s.th}>Description</th>
                  <th style={{ ...s.th, width: '14%' }}>Type</th>
                  <th style={{ ...s.th, width: '8%', textAlign: 'right' }}>Qty</th>
                  <th style={{ ...s.th, width: '11%', textAlign: 'right' }}>List</th>
                  <th style={{ ...s.th, width: '11%', textAlign: 'right' }}>Sell</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l, i) => (
                  <tr key={l.id} style={{ ...s.tr, background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                    <td style={s.td}>
                      {(l.partNumber || l.description) && (
                        <button style={s.delLineBtn} onClick={() => deleteLine(l.id)}>
                          <Trash2 size={12} color="#ef4444" />
                        </button>
                      )}
                    </td>
                    <td style={s.td}><input style={s.cellInput} value={l.partNumber} onChange={e => updateLine(l.id, 'partNumber', e.target.value)} /></td>
                    <td style={s.td}><input style={s.cellInput} value={l.description} onChange={e => updateLine(l.id, 'description', e.target.value)} /></td>
                    <td style={s.td}>
                      <select style={s.cellSelect} value={l.type} onChange={e => updateLine(l.id, 'type', e.target.value)}>
                        <option value=""></option>
                        {PART_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </td>
                    <td style={s.td}><input style={{ ...s.cellInput, textAlign: 'right' }} value={l.qty} onChange={e => updateLine(l.id, 'qty', e.target.value)} /></td>
                    <td style={s.td}><input style={{ ...s.cellInput, textAlign: 'right' }} value={l.list} onChange={e => updateLine(l.id, 'list', e.target.value)} placeholder="$0.00" /></td>
                    <td style={s.td}><input style={{ ...s.cellInput, textAlign: 'right' }} value={l.sell} onChange={e => updateLine(l.id, 'sell', e.target.value)} placeholder="$0.00" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={s.lineActions}>
            <button style={s.btnOutline} onClick={addLine}><Plus size={13} /> Add Flat Glass</button>
            <button style={s.btnOutline} onClick={addLine}><Plus size={13} /> Add Misc. Item</button>
          </div>
        </div>

        {/* ── Notes + Totals ── */}
        <div style={s.twoCol}>

          {/* Notes */}
          <div style={s.section}>
            <div style={s.sectionHead}><span style={s.sectionTitle}>Directions / Notes</span></div>
            <textarea
              style={s.textarea}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Enter directions or notes..."
            />
            <div style={s.paymentRow}>
              <label style={s.checkLabel}><input type="checkbox" checked={payCash}   onChange={e => setPayCash(e.target.checked)}   style={s.checkbox} /> Cash</label>
              <label style={s.checkLabel}><input type="checkbox" checked={payCheck}  onChange={e => setPayCheck(e.target.checked)}  style={s.checkbox} /> Check</label>
              <label style={s.checkLabel}><input type="checkbox" checked={payCredit} onChange={e => setPayCredit(e.target.checked)} style={s.checkbox} /> Credit</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
                <span style={s.fieldLabel}>Complaint?</span>
                <select style={{ ...s.select, width: 140 }} value={complaint} onChange={e => setComplaint(e.target.value)}>
                  <option value=""></option>
                  <option>Chip</option>
                  <option>Crack</option>
                  <option>Scratch</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Totals */}
          <div style={s.section}>
            <div style={s.sectionHead}><span style={s.sectionTitle}>Totals</span></div>
            <div style={s.totalsGrid}>
              <TotalRow label="Labor">
                <input style={{ ...s.input, textAlign: 'right', width: 110 }} value={labor} onChange={e => setLabor(e.target.value)} />
              </TotalRow>
              <TotalRow label="Sub-Total">
                <span style={s.totalValue}>${subTotal.toFixed(2)}</span>
              </TotalRow>
              <TotalRow label="Tax">
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button style={s.taxBtn} onClick={() => {}}>Change Tax</button>
                  <button style={s.taxBtn} onClick={() => setTax('0.00')}>Zero Tax</button>
                  <input style={{ ...s.input, textAlign: 'right', width: 80 }} value={tax} onChange={e => setTax(e.target.value)} />
                </div>
              </TotalRow>
              <TotalRow label="Deductible">
                <input style={{ ...s.input, textAlign: 'right', width: 110 }} value={deductible} onChange={e => setDeductible(e.target.value)} />
              </TotalRow>
              <TotalRow label="Discount">
                <select
                  style={{ ...s.select, width: 160 }}
                  value={selectedDiscountCode}
                  onChange={e => setSelectedDiscountCode(e.target.value)}
                >
                  <option value="">— None —</option>
                  {discounts.map(d => (
                    <option key={d.discount_code} value={d.discount_code}>{d.discount_code} – {d.discount_name}</option>
                  ))}
                </select>
              </TotalRow>
              {discountAmt > 0 && (
                <TotalRow label="">
                  <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
                    −${discountAmt.toFixed(2)} applied
                  </span>
                </TotalRow>
              )}
              <div style={s.totalDueRow}>
                <span style={s.totalDueLabel}>Total Due</span>
                <span style={s.totalDueValue}>${totalDue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={s.footer}>
        <div style={s.footerLeft}>
          <button style={s.footerBtn} onClick={addLine}>Increase Line Items</button>
          <button style={s.footerBtn}>Add Customer</button>
          <button style={s.footerBtn} onClick={() => setShowPrint(true)}><Calendar size={13} /> Print</button>
        </div>
        <div style={s.footerRight}>
          <button style={s.btnCancel} onClick={onClose}>Cancel</button>
          <button style={s.btnSecondary} onClick={handleSave}>Save</button>
          <button style={s.btnPrimary}  onClick={handleSave}>Apply Changes</button>
        </div>
      </div>

      {showPrint && (
        <PrintView
          invoiceNum={invoiceNum}
          billName={billName} billAddr1={billAddr1} billAddr2={billAddr2}
          billCity={billCity} billSt={billSt} billZip={billZip}
          billPhone1={billPhone1} billPhone2={billPhone2}
          bizType={bizType} agency={agency}
          soldName={soldName} soldAddr1={soldAddr1} soldAddr2={soldAddr2}
          soldCity={soldCity} soldSt={soldSt} soldZip={soldZip}
          soldPhone1={soldPhone1} soldPhone2={soldPhone2}
          claimNum={claimNum} policyPo={policyPo} lossDate={lossDate}
          year={year} make={make} model={model}
          color={color} licenseNum={licenseNum} vin={vin}
          lines={lines}
          labor={labor} laborAmt={laborAmt}
          taxAmt={taxAmt} dedAmt={dedAmt}
          subTotal={subTotal} totalDue={totalDue}
          notes={notes}
          payCash={payCash} payCheck={payCheck} payCredit={payCredit}
          complaint={complaint}
          onClose={() => setShowPrint(false)}
        />
      )}
    </div>
  );
};

/* ── Tiny helpers ── */
const FormRow: React.FC<{ label: string; flex?: number; children: React.ReactNode }> =
  ({ label, flex = 1, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex }}>
      <span style={s.fieldLabel}>{label}</span>
      {children}
    </div>
  );

const TotalRow: React.FC<{ label: string; children: React.ReactNode }> =
  ({ label, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, minWidth: 80 }}>{label}</span>
      {children}
    </div>
  );

/* ── Styles ── */
const s: Record<string, React.CSSProperties> = {
  page:        { flex: 1, display: 'flex', flexDirection: 'column', margin: 20, borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', background: '#fff' },

  header:      { background: '#16a34a', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  headerLeft:  { display: 'flex', alignItems: 'center', gap: 12 },
  headerIcon:  { width: 34, height: 34, background: 'rgba(255,255,255,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 700, color: '#fff' },
  headerSub:   { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  closeBtn:    { background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' },
  backBtn:     { background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: 6, display: 'flex', alignItems: 'center', marginRight: 4 },

  body:        { flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 },

  twoCol:      { display: 'flex', gap: 12 },
  section:     { flex: 1, border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 },
  sectionHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: 8 },
  sectionTitle:{ fontSize: 12, fontWeight: 700, color: '#111827', letterSpacing: '0.04em', textTransform: 'uppercase' as const },
  fieldGrid:   { display: 'flex', flexDirection: 'column', gap: 8 },
  inlineRow:   { display: 'flex', gap: 10, alignItems: 'flex-end' },

  fieldLabel:  { fontSize: 11, color: '#6b7280', fontWeight: 500 },
  input:       { width: '100%', padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 5, fontSize: 12, color: '#111827', background: '#fff', outline: 'none', boxSizing: 'border-box' as const },
  select:      { width: '100%', padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 5, fontSize: 12, color: '#111827', background: '#fff', outline: 'none', boxSizing: 'border-box' as const },

  copyBtn:     { fontSize: 11, fontWeight: 600, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 5, padding: '3px 10px', cursor: 'pointer' },

  tableWrapper:{ border: '1px solid #e5e7eb', borderRadius: 7, overflow: 'hidden' },
  table:       { width: '100%', borderCollapse: 'collapse' as const },
  thead:       { background: '#f9fafb', borderBottom: '2px solid #e5e7eb' },
  th:          { padding: '8px 10px', fontSize: 11, fontWeight: 700, color: '#374151', textAlign: 'left' as const },
  tr:          { borderBottom: '1px solid #f0f0f0' },
  td:          { padding: '4px 6px' },
  cellInput:   { width: '100%', padding: '4px 6px', border: '1px solid transparent', borderRadius: 4, fontSize: 12, color: '#111827', background: 'transparent', outline: 'none', boxSizing: 'border-box' as const },
  cellSelect:  { width: '100%', padding: '4px 6px', border: '1px solid transparent', borderRadius: 4, fontSize: 12, color: '#111827', background: 'transparent', outline: 'none', boxSizing: 'border-box' as const },
  delLineBtn:  { background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', opacity: 0.6 },

  lineActions: { display: 'flex', gap: 8, paddingTop: 4 },
  btnOutline:  { display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' },

  textarea:    { width: '100%', minHeight: 80, padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12, color: '#111827', resize: 'vertical' as const, outline: 'none', boxSizing: 'border-box' as const },
  paymentRow:  { display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' as const },
  checkLabel:  { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#374151', cursor: 'pointer' },
  checkbox:    { accentColor: '#16a34a', width: 14, height: 14 },

  totalsGrid:  { display: 'flex', flexDirection: 'column', gap: 10 },
  totalValue:  { fontSize: 13, fontWeight: 600, color: '#111827' },
  taxBtn:      { padding: '4px 10px', background: '#f9fafb', border: '1px solid #d1d5db', borderRadius: 5, fontSize: 11, fontWeight: 600, color: '#374151', cursor: 'pointer' },
  totalDueRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '2px solid #e5e7eb', paddingTop: 10, marginTop: 4 },
  totalDueLabel:{ fontSize: 13, fontWeight: 700, color: '#111827' },
  totalDueValue:{ fontSize: 16, fontWeight: 700, color: '#16a34a' },

  footer:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid #e5e7eb', flexShrink: 0 },
  footerLeft:  { display: 'flex', gap: 8 },
  footerRight: { display: 'flex', gap: 8 },
  footerBtn:   { display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, fontWeight: 500, color: '#374151', cursor: 'pointer' },
  btnCancel:   { padding: '7px 20px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' },
  btnSecondary:{ padding: '7px 20px', background: '#fff', border: '1px solid #16a34a', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#16a34a', cursor: 'pointer' },
  btnPrimary:  { padding: '7px 24px', background: '#16a34a', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#fff', cursor: 'pointer' },
};

/* ── Print View ── */
const PrintView: React.FC<{
  invoiceNum: number;
  billName: string; billAddr1: string; billAddr2: string;
  billCity: string; billSt: string; billZip: string;
  billPhone1: string; billPhone2: string;
  bizType: string; agency: string;
  soldName: string; soldAddr1: string; soldAddr2: string;
  soldCity: string; soldSt: string; soldZip: string;
  soldPhone1: string; soldPhone2: string;
  claimNum: string; policyPo: string; lossDate: string;
  year: string; make: string; model: string;
  color: string; licenseNum: string; vin: string;
  lines: LineItem[];
  labor: string; laborAmt: number;
  taxAmt: number; dedAmt: number;
  subTotal: number; totalDue: number;
  notes: string;
  payCash: boolean; payCheck: boolean; payCredit: boolean;
  complaint: string;
  onClose: () => void;
}> = (p) => {
  const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
  const filledLines = p.lines.filter(l => l.partNumber || l.description);

  useEffect(() => {
    const el = document.createElement('style');
    el.id = 'gl-print-css';
    el.textContent = [
      '@media print {',
      '  body * { visibility: hidden !important; }',
      '  #gl-print-view, #gl-print-view * { visibility: visible !important; }',
      '  #gl-print-view { position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; overflow: visible !important; background: white !important; padding: 0 !important; }',
      '  #gl-print-doc { box-shadow: none !important; max-width: 100% !important; border: none !important; margin: 0 !important; }',
      '  .no-print { display: none !important; }',
      '}',
    ].join('\n');
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  const billCityLine = [p.billCity, p.billSt, p.billZip].filter(Boolean).join(', ');
  const soldCityLine = [p.soldCity, p.soldSt, p.soldZip].filter(Boolean).join(', ');

  return (
    <div id="gl-print-view" style={ps.overlay}>

      {/* Controls — hidden on actual print */}
      <div className="no-print" style={ps.controls}>
        <button onClick={() => window.print()} style={ps.printBtn}>Print</button>
        <button onClick={p.onClose} style={ps.closePreviewBtn}>Close Preview</button>
      </div>

      {/* Invoice document */}
      <div id="gl-print-doc" style={ps.doc}>

        {/* Letterhead */}
        <div style={ps.letterhead}>
          <div>
            <div style={ps.companyName}>{COMPANY.name}</div>
            <div style={ps.companyDetail}>{COMPANY.addr1}</div>
            <div style={ps.companyDetail}>{COMPANY.addr2}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={ps.invoiceNum}>INVOICE #{p.invoiceNum}</div>
            <div style={ps.companyDetail}>Phone: {COMPANY.phone}</div>
            <div style={ps.companyDetail}>Fax: {COMPANY.fax}</div>
            <div style={ps.companyDetail}>{COMPANY.taxId}</div>
          </div>
        </div>

        {/* Meta row */}
        <div style={ps.metaRow}>
          <div style={ps.metaItem}>
            <span style={ps.metaLabel}>SCHEDULED</span>
            <span style={ps.metaVal}>{today}</span>
          </div>
          <div style={ps.metaItem}>
            <span style={ps.metaLabel}>TYPE OF BUSINESS</span>
            <span style={ps.metaVal}>{p.bizType || '—'}</span>
          </div>
          <div style={ps.metaItem}>
            <span style={ps.metaLabel}>COMPLETED</span>
            <span style={ps.metaVal}>—</span>
          </div>
        </div>

        {/* Parties */}
        <div style={ps.partiesRow}>
          <div style={{ flex: 2 }}>
            <div style={ps.partyLabel}>BILL TO</div>
            <div style={ps.partyName}>{p.billName}</div>
            {p.billAddr1 && <div style={ps.partyLine}>{p.billAddr1}</div>}
            {p.billAddr2 && <div style={ps.partyLine}>{p.billAddr2}</div>}
            {billCityLine && <div style={ps.partyLine}>{billCityLine}</div>}
          </div>
          <div style={ps.partySep} />
          <div style={{ flex: 1.5 }}>
            <CL label="Main Ph#" val={p.billPhone1} />
            <CL label="Alt Ph#"  val={p.billPhone2} />
            <CL label="Agency"   val={p.agency} />
          </div>
          <div style={ps.partyDivider} />
          <div style={{ flex: 2 }}>
            <div style={ps.partyLabel}>SOLD TO</div>
            <div style={ps.partyName}>{p.soldName}</div>
            {p.soldAddr1 && <div style={ps.partyLine}>{p.soldAddr1}</div>}
            {p.soldAddr2 && <div style={ps.partyLine}>{p.soldAddr2}</div>}
            {soldCityLine && <div style={ps.partyLine}>{soldCityLine}</div>}
          </div>
          <div style={ps.partySep} />
          <div style={{ flex: 1.5 }}>
            <CL label="Main Ph#"  val={p.soldPhone1} />
            <CL label="Alt Ph#"   val={p.soldPhone2} />
            <CL label="Policy#"   val={p.policyPo} />
            <CL label="Claim#"    val={p.claimNum} />
            <CL label="Loss Date" val={p.lossDate} />
          </div>
        </div>

        {/* Vehicle */}
        <div style={ps.vehicleRow}>
          <VF label="YEAR"  val={p.year} />
          <VF label="MAKE"  val={p.make} />
          <VF label="MODEL" val={p.model} />
          <VF label="VIN #" val={p.vin} />
          <VF label="COLOR" val={p.color} />
          <VF label="LIC #" val={p.licenseNum} />
        </div>

        {/* Line items */}
        <table style={ps.table}>
          <thead>
            <tr>
              <th style={ps.th}>Part Number</th>
              <th style={ps.th}>Description</th>
              <th style={ps.th}>Type</th>
              <th style={{ ...ps.th, textAlign: 'right' as const }}>Quant</th>
              <th style={{ ...ps.th, textAlign: 'right' as const }}>List</th>
              <th style={{ ...ps.th, textAlign: 'right' as const }}>Sell</th>
            </tr>
          </thead>
          <tbody>
            {filledLines.map(l => (
              <tr key={l.id} style={ps.tr}>
                <td style={ps.td}>{l.partNumber}</td>
                <td style={ps.td}>{l.description}</td>
                <td style={ps.td}>{l.type}</td>
                <td style={{ ...ps.td, textAlign: 'right' as const }}>{l.qty}</td>
                <td style={{ ...ps.td, textAlign: 'right' as const }}>{l.list ? `$${parseFloat(l.list).toFixed(2)}` : ''}</td>
                <td style={{ ...ps.td, textAlign: 'right' as const }}>{l.sell ? `$${parseFloat(l.sell).toFixed(2)}` : ''}</td>
              </tr>
            ))}
            {Array.from({ length: Math.max(0, 5 - filledLines.length) }).map((_, i) => (
              <tr key={`b${i}`} style={ps.tr}>
                {[0,1,2,3,4,5].map(j => <td key={j} style={ps.td}>&nbsp;</td>)}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Notes + Totals */}
        <div style={ps.bottomRow}>
          <div style={{ flex: 1, paddingRight: 20, borderRight: '1px solid #000' }}>
            <div style={ps.sectionLabel}>DIRECTIONS / NOTES</div>
            <div style={{ minHeight: 64, fontSize: 11, whiteSpace: 'pre-wrap' }}>{p.notes}</div>
            <div style={{ marginTop: 12, display: 'flex', gap: 18, fontSize: 11 }}>
              <span>Cash {p.payCash ? '☑' : '☐'}</span>
              <span>Check {p.payCheck ? '☑' : '☐'}</span>
              <span>Credit {p.payCredit ? '☑' : '☐'}</span>
              {p.complaint && <span style={{ marginLeft: 8 }}>Complaint: {p.complaint}</span>}
            </div>
          </div>
          <div style={{ width: 210, paddingLeft: 20 }}>
            <div style={ps.sectionLabel}>TOTALS</div>
            <TL label="Labor"      val={`$${parseFloat(p.labor || '0').toFixed(2)}`} />
            <TL label="Sub-Total"  val={`$${p.subTotal.toFixed(2)}`} />
            <TL label="Tax"        val={`$${p.taxAmt.toFixed(2)}`} />
            <TL label="Deductible" val={`$${p.dedAmt.toFixed(2)}`} />
            <div style={{ borderTop: '2px solid #000', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>TOTAL DUE</span>
              <span style={{ fontSize: 14, fontWeight: 700 }}>${p.totalDue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: 9, color: '#999', marginTop: 20, paddingTop: 10, borderTop: '1px solid #ddd' }}>
          Generated with Glass Logic
        </div>
      </div>
    </div>
  );
};

/* ── Print micro-components ── */
const CL: React.FC<{ label: string; val: string }> = ({ label, val }) => (
  <div style={{ fontSize: 10, marginBottom: 3 }}>
    <span style={{ fontWeight: 700 }}>{label}:</span> {val || '—'}
  </div>
);
const VF: React.FC<{ label: string; val: string }> = ({ label, val }) => (
  <div style={{ flex: 1 }}>
    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 11, borderBottom: '1px solid #000', paddingBottom: 2, minWidth: 50 }}>{val || ' '}</div>
  </div>
);
const TL: React.FC<{ label: string; val: string }> = ({ label, val }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5 }}>
    <span>{label}</span><span style={{ fontWeight: 500 }}>{val}</span>
  </div>
);

/* ── Print styles ── */
const ps: Record<string, React.CSSProperties> = {
  overlay:        { position: 'fixed', inset: 0, background: '#e8e8e8', zIndex: 9999, overflowY: 'auto', padding: '24px 0' },
  controls:       { display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 },
  printBtn:       { padding: '8px 28px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  closePreviewBtn:{ padding: '8px 28px', background: '#fff', border: '1px solid #999', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 },

  doc:            { maxWidth: 780, margin: '0 auto', background: '#fff', boxShadow: '0 2px 20px rgba(0,0,0,0.15)', padding: '36px 40px', fontFamily: "'Libertinus Math', Arial, sans-serif", color: '#000', fontSize: 11, lineHeight: 1.5 as const },

  letterhead:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 16, marginBottom: 16, borderBottom: '2.5px solid #000' },
  companyName:    { fontSize: 20, fontWeight: 700, letterSpacing: '0.01em', marginBottom: 4 },
  companyDetail:  { fontSize: 11, lineHeight: 1.7 as const },
  invoiceNum:     { fontSize: 15, fontWeight: 700, marginBottom: 6, textAlign: 'right' as const },

  metaRow:        { display: 'flex', paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid #000' },
  metaItem:       { flex: 1, display: 'flex', flexDirection: 'column', gap: 3 },
  metaLabel:      { fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textDecoration: 'underline' },
  metaVal:        { fontSize: 12 },

  partiesRow:     { display: 'flex', gap: 10, paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid #000', alignItems: 'flex-start' },
  partySep:       { width: 1, background: '#ccc', alignSelf: 'stretch', margin: '0 4px' },
  partyDivider:   { width: 2, background: '#000', alignSelf: 'stretch', margin: '0 10px' },
  partyLabel:     { fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textDecoration: 'underline', marginBottom: 5 },
  partyName:      { fontSize: 12, fontWeight: 600, marginBottom: 2 },
  partyLine:      { fontSize: 11, lineHeight: 1.6 as const },

  vehicleRow:     { display: 'flex', gap: 20, paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid #000' },

  table:          { width: '100%', borderCollapse: 'collapse' as const, marginBottom: 16 },
  th:             { padding: '7px 8px', fontSize: 10, fontWeight: 700, textAlign: 'left' as const, borderTop: '1px solid #000', borderBottom: '2px solid #000', letterSpacing: '0.04em' },
  tr:             { borderBottom: '1px solid #e0e0e0' },
  td:             { padding: '5px 8px', fontSize: 11 },

  bottomRow:      { display: 'flex', paddingTop: 14, borderTop: '1px solid #000' },
  sectionLabel:   { fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textDecoration: 'underline', marginBottom: 8 },
};

export default Invoice;
