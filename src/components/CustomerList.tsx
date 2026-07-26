import React, { useState, useEffect } from 'react';
import { Users, X, Search, Trash2, Plus, Check } from 'lucide-react';
import { api, type Customer } from '../api/client';

const ROUTES = ['Route A', 'Route B', 'Route C', 'Route D', 'Route E'];

interface Props {
  onClose: () => void;
}

interface InsertForm {
  name: string; company: string; route: string; phone: string; address: string;
}
const emptyForm = (): InsertForm => ({ name: '', company: '', route: '', phone: '', address: '' });

const CustomerList: React.FC<Props> = ({ onClose }) => {
  const [query, setQuery]           = useState('');
  const [customers, setCustomers]   = useState<Customer[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showInsert, setShowInsert] = useState(false);
  const [form, setForm]             = useState<InsertForm>(emptyForm());
  const [errors, setErrors]         = useState<Partial<InsertForm>>({});

  useEffect(() => {
    api.getCustomers().then(setCustomers).catch(() => {});
  }, []);

  const search = (q: string) => {
    api.getCustomers(q.trim() || undefined).then(setCustomers).catch(() => {});
  };

  const handleDelete = () => {
    if (selectedId === null) return;
    api.deleteCustomer(selectedId).then(() => {
      setCustomers(prev => prev.filter(c => c.id !== selectedId));
      setSelectedId(null);
    }).catch(() => {});
  };

  const openInsert = () => { setForm(emptyForm()); setErrors({}); setShowInsert(true); };
  const closeInsert = () => setShowInsert(false);

  const handleInsertSave = () => {
    const e: Partial<InsertForm> = {};
    if (!form.name.trim())    e.name    = 'Required';
    if (!form.company.trim()) e.company = 'Required';
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    api.createCustomer({
      name:    form.name.trim().toUpperCase(),
      company: form.company.trim().toUpperCase(),
      route:   form.route || ROUTES[0],
      phone:   form.phone.trim(),
      address: form.address.trim(),
    }).then(newCustomer => {
      setCustomers(prev => [...prev, newCustomer]);
      setShowInsert(false);
    }).catch(() => {});
  };

  const set = (field: keyof InsertForm) => (v: string) => {
    setForm(f => ({ ...f, [field]: v }));
    setErrors(e => ({ ...e, [field]: undefined }));
  };

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>
            <Users size={20} color="#fff" />
          </div>
          <div>
            <div style={styles.headerTitle}>Customer Selection</div>
            <div style={styles.headerSub}>Search and manage customers</div>
          </div>
        </div>
        <button style={styles.closeBtn} onClick={onClose}>
          <X size={18} color="#fff" />
        </button>
      </div>

      {/* Body */}
      <div style={styles.body}>
        {/* Search row */}
        <div style={styles.searchSection}>
          <label style={styles.searchLabel}>Search:</label>
          <input
            style={styles.searchInput}
            placeholder="Enter customer name, company, or route..."
            value={query}
            onChange={e => { setQuery(e.target.value); search(e.target.value); }}
            onKeyDown={e => e.key === 'Enter' && search(query)}
          />
        </div>

        {/* Action buttons */}
        <div style={styles.actions}>
          <div style={styles.actionsLeft}>
            <button style={styles.btnPrimary} onClick={() => search(query)}>
              <Search size={14} color="#fff" />
              <span>Search</span>
            </button>
            <button style={styles.btnOutline}>Search By Search Name</button>
            <button style={styles.btnOutline} onClick={() => { setQuery(''); search(''); }}>
              Show All
            </button>
            <button
              style={{ ...styles.btnOutline, ...styles.btnDelete, opacity: selectedId === null ? 0.45 : 1 }}
              onClick={handleDelete}
              disabled={selectedId === null}
            >
              <Trash2 size={14} color="#ef4444" />
              <span style={{ color: '#ef4444' }}>Delete</span>
            </button>
          </div>
          <button style={styles.btnInsert} onClick={openInsert}>
            <Plus size={14} color="#fff" />
            <span>Insert</span>
          </button>
        </div>

        {/* Table */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Company</th>
                <th style={styles.th}>Route</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr
                  key={c.id}
                  style={{
                    ...styles.tr,
                    background: selectedId === c.id ? '#f0fdf4' : '#fff',
                    outline: selectedId === c.id ? '1px solid #bbf7d0' : 'none',
                  }}
                  onClick={() => setSelectedId(c.id)}
                >
                  <td style={styles.td}>{c.name}</td>
                  <td style={styles.td}>{c.company}</td>
                  <td style={styles.td}>{c.route}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={3} style={styles.emptyRow}>No customers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button style={styles.btnOutline}>Sort By Route/Name</button>
        </div>
      </div>

      {/* ── Insert dialog ── */}
      {showInsert && (
        <div style={dlg.overlay} onClick={e => e.target === e.currentTarget && closeInsert()}>
          <div style={dlg.box}>

            {/* Header */}
            <div style={dlg.header}>
              <div>
                <div style={dlg.title}>Add New Customer</div>
                <div style={dlg.sub}>Fill in the details below to create a new customer record</div>
              </div>
              <button style={dlg.closeBtn} onClick={closeInsert}><X size={16} /></button>
            </div>

            {/* Fields */}
            <div style={dlg.body}>
              <DlgField label="Customer Name" required error={errors.name}
                placeholder="e.g. APEX GLASS WORKS"
                value={form.name} onChange={set('name')} />

              <DlgField label="Company" required error={errors.company}
                placeholder="e.g. GEICO INSURANCE"
                value={form.company} onChange={set('company')} />

              <div style={dlg.row}>
                <DlgField label="Route" value={form.route} onChange={set('route')}
                  placeholder="" type="select" options={ROUTES} />
                <DlgField label="Phone" value={form.phone} onChange={set('phone')}
                  placeholder="e.g. (708) 555-0100" />
              </div>

              <DlgField label="Address" value={form.address} onChange={set('address')}
                placeholder="e.g. 123 Main St, Springfield, IL 60601" />
            </div>

            {/* Footer */}
            <div style={dlg.footer}>
              <button style={dlg.btnSave} onClick={handleInsertSave}>
                <Check size={14} /> Save Customer
              </button>
              <button style={dlg.btnCancel} onClick={closeInsert}>Cancel</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

/* ── Dialog field helper ── */
const DlgField: React.FC<{
  label: string; value: string; error?: string; required?: boolean;
  placeholder?: string; type?: 'text' | 'select'; options?: string[];
  onChange: (v: string) => void;
}> = ({ label, value, error, required, placeholder, type = 'text', options = [], onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: error ? '#ef4444' : '#374151' }}>
      {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
    {type === 'select' ? (
      <select
        style={{ ...dlg.input, background: '#fff' }}
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    ) : (
      <input
        style={{ ...dlg.input, borderColor: error ? '#fca5a5' : '#d1d5db', background: error ? '#fff5f5' : '#fff' }}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
    )}
    {error && <span style={{ fontSize: 11, color: '#ef4444' }}>{error}</span>}
  </div>
);

/* ── Dialog styles ── */
const dlg: Record<string, React.CSSProperties> = {
  overlay:   { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  box:       { background: '#fff', borderRadius: 12, width: 480, maxWidth: '94vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' },

  header:    { background: '#16a34a', padding: '20px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
  title:     { fontSize: 17, fontWeight: 700, color: '#fff' },
  sub:       { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 3 },
  closeBtn:  { background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6, cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', color: '#fff' },

  body:      { padding: '22px 24px 16px', display: 'flex', flexDirection: 'column', gap: 14 },
  row:       { display: 'flex', gap: 14 },
  input:     { width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: 7, fontSize: 13, color: '#111827', outline: 'none', boxSizing: 'border-box' as const },

  footer:    { padding: '14px 24px 20px', display: 'flex', gap: 10 },
  btnSave:   { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', background: '#16a34a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' },
  btnCancel: { padding: '10px 18px', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' },
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    margin: 24,
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
    background: '#fff',
  },
  header: {
    background: '#16a34a',
    padding: '18px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  headerIcon: {
    width: 40,
    height: 40,
    background: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#fff',
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
  },
  body: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    flex: 1,
    overflow: 'hidden',
    minHeight: 0,
  },
  searchSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flexShrink: 0,
  },
  searchLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
  },
  searchInput: {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #16a34a',
    borderRadius: 8,
    fontSize: 14,
    color: '#111827',
    outline: 'none',
    boxSizing: 'border-box',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexShrink: 0,
  },
  actionsLeft: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap' as const,
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '9px 18px',
    background: '#16a34a',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    color: '#fff',
    cursor: 'pointer',
  },
  btnOutline: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '9px 18px',
    background: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    color: '#374151',
    cursor: 'pointer',
  },
  btnDelete: {
    borderColor: '#fecaca',
  },
  btnInsert: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '9px 20px',
    background: '#16a34a',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    color: '#fff',
    cursor: 'pointer',
  },
  tableWrapper: {
    flex: 1,
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    overflowY: 'auto' as const,
    minHeight: 0,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  tableHead: {
    background: '#16a34a',
    position: 'sticky' as const,
    top: 0,
    zIndex: 1,
  },
  th: {
    padding: '12px 18px',
    fontSize: 13,
    fontWeight: 600,
    color: '#fff',
    textAlign: 'left' as const,
  },
  tr: {
    borderBottom: '1px solid #f3f4f6',
    cursor: 'pointer',
    transition: 'background 0.1s',
  },
  td: {
    padding: '13px 18px',
    fontSize: 13,
    color: '#111827',
  },
  emptyRow: {
    padding: '24px',
    textAlign: 'center' as const,
    fontSize: 13,
    color: '#9ca3af',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: 4,
    flexShrink: 0,
  },
};

export default CustomerList;
