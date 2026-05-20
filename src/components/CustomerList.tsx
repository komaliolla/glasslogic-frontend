import React, { useState } from 'react';
import { Users, X, Search, Trash2, Plus } from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  company: string;
  route: string;
}

const initialCustomers: Customer[] = [
  { id: 1, name: 'ABC GLASS CO',      company: 'PROGRESSIVE',          route: 'Route B' },
  { id: 2, name: 'GOOGLE',            company: 'FARMERS INSURANCE',    route: 'Route A' },
  { id: 3, name: 'JONES COLLISION',   company: 'ALLSTATE',             route: 'Route C' },
  { id: 4, name: 'SMITH AUTO GLASS',  company: 'STATE FARM INSURANCE', route: 'Route A' },
  { id: 5, name: 'TEST SHOP',         company: '',                     route: 'Route B' },
];

interface Props {
  onClose: () => void;
}

const CustomerList: React.FC<Props> = ({ onClose }) => {
  const [query, setQuery]           = useState('');
  const [customers, setCustomers]   = useState<Customer[]>(initialCustomers);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const search = (q: string) => {
    const lower = q.toLowerCase();
    setCustomers(
      q.trim()
        ? initialCustomers.filter(
            c =>
              c.name.toLowerCase().includes(lower) ||
              c.company.toLowerCase().includes(lower) ||
              c.route.toLowerCase().includes(lower)
          )
        : initialCustomers
    );
  };

  const handleDelete = () => {
    if (selectedId === null) return;
    setCustomers(prev => prev.filter(c => c.id !== selectedId));
    setSelectedId(null);
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
          <button style={styles.btnInsert}>
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
    </div>
  );
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
    overflowY: 'auto',
  },
  searchSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
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
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  tableHead: {
    background: '#16a34a',
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
  },
};

export default CustomerList;
