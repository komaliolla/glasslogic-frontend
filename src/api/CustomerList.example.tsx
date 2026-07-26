
import React, { useState, useEffect } from 'react';
import { Users, X, Search, Trash2, Plus } from 'lucide-react';
import { api, type Customer } from './client';   // ← replaces db.ts import

interface Props { onClose: () => void; }

const CustomerList: React.FC<Props> = ({ onClose }) => {
  const [customers,  setCustomers]  = useState<Customer[]>([]);
  const [query,      setQuery]      = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  // Load customers from the API on mount
  useEffect(() => {
    api.getCustomers()
      .then(setCustomers)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const rows = await api.getCustomers(query.trim() || undefined);
      setCustomers(rows);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (selectedId === null) return;
    await api.deleteCustomer(selectedId);
    setCustomers(prev => prev.filter(c => c.id !== selectedId));
    setSelectedId(null);
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading…</div>;
  if (error)   return <div style={{ padding: 40, color: 'red' }}>Error: {error}</div>;

  // The rest of the JSX is identical to the current CustomerList.tsx
  return (
    <div>
      {/* … same UI as before … */}
    </div>
  );
};

export default CustomerList;






