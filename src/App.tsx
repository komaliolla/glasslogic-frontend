import React, { useState, useEffect } from 'react';
import { api } from './api/client';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import PrintSetupModal from './components/PrintSetupModal';
import CustomerList from './components/CustomerList';
import Discounts      from './components/Discounts';
import BusinessTypes  from './components/BusinessTypes';
import NAGSByVehicle    from './components/NAGSByVehicle';
import NAGSByPartNumber from './components/NAGSByPartNumber';
import Invoice, { MOCK_INVOICES } from './components/Invoice';
import PaidInvoices     from './components/PaidInvoices';
import Schedule         from './components/Schedule';
import SendEDIClaims    from './components/SendEDIClaims';
import PendingEDIClaims from './components/PendingEDIClaims';
import Employees        from './components/Employees';
import { InvoiceRecord, InvoicePrefill } from './types';

type ActivePage  = 'customer-list' | 'discounts' | 'business-types' | 'nags-vehicle' | 'nags-part' | 'invoice' | 'invoice-list' | 'receivables-list' | 'schedule' | 'send-edi' | 'pending-edi' | 'employees' | null;
type ActiveModal = 'print-setup' | null;

const pageBreadcrumbs: Record<string, { section: string; item: string }> = {
  'customer-list':  { section: 'Customer',     item: 'Customer List'    },
  'discounts':      { section: 'Customer',     item: 'Discounts'        },
  'business-types': { section: 'Customer',     item: 'Business Types'   },
  'nags-vehicle':   { section: 'Quotes (A/R)', item: 'NAGS by Vehicle'  },
  'nags-part':      { section: 'Quotes (A/R)', item: 'NAGS by Part #'   },
  'invoice':        { section: 'Invoice',      item: 'Invoice Editor'   },
  'invoice-list':   { section: 'Invoice',      item: 'List of Invoices' },
  'receivables-list': { section: 'Receivables (A/R)', item: 'Paid Invoices' },
  'send-edi':       { section: 'Invoice',      item: 'Send EDI Claims'    },
  'pending-edi':    { section: 'Invoice',      item: 'Pending EDI Claims' },
  'schedule':       { section: 'File',         item: 'Schedule'         },
  'employees':      { section: 'User',         item: 'Employees'        },
};

const modalBreadcrumbs: Record<string, { section: string; item: string }> = {
  'print-setup': { section: 'File', item: 'Print Setup' },
};

const App: React.FC = () => {
  const [activePage,   setActivePage]   = useState<ActivePage>(null);
  const [activeModal,  setActiveModal]  = useState<ActiveModal>(null);
  const [userInvoices, setUserInvoices] = useState<InvoiceRecord[]>([]);
  const [deletedInvoiceIds, setDeletedInvoiceIds] = useState<Set<number>>(new Set());
  const [nextInvoiceId, setNextInvoiceId] = useState(19);
  const [invoicePrefill, setInvoicePrefill] = useState<InvoicePrefill | undefined>(undefined);

  // Load persisted invoices from the backend once on mount — this is what makes
  // saved invoices/deposits survive a page reload instead of living only in memory.
  useEffect(() => {
    api.getInvoices().then(records => {
      setUserInvoices(records);
      const maxId = records.reduce((m, r) => Math.max(m, r.id), 0);
      if (maxId >= nextInvoiceId) setNextInvoiceId(maxId + 1);
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Real (saved) invoices shadow the demo rows once touched, and deletions apply
  // regardless of whether the row started as a demo or a real one.
  const visibleInvoices = [...userInvoices, ...MOCK_INVOICES.filter(m => !userInvoices.some(i => i.id === m.id))]
    .filter(i => !deletedInvoiceIds.has(i.id));

  const handleTurnIntoInvoice = (prefill: InvoicePrefill) => {
    setInvoicePrefill(prefill);
    setActivePage('invoice');
  };

  const handleSaveInvoice = (record: InvoiceRecord) => {
    setUserInvoices(prev => {
      const exists = prev.findIndex(r => r.id === record.id);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = record;
        return updated;
      }
      return [record, ...prev];
    });
    if (record.id >= nextInvoiceId) setNextInvoiceId(record.id + 1);
    api.saveInvoiceRecord(record).catch(() => {});
  };

  const handleDeleteInvoice = (id: number) => {
    setUserInvoices(prev => prev.filter(r => r.id !== id));
    setDeletedInvoiceIds(prev => new Set(prev).add(id));
    api.deleteInvoiceRecord(id).catch(() => {});
  };

  const handleItemClick = (itemId: string) => {
    if (itemId === 'print-setup')    { setActiveModal('print-setup');  return; }
    if (itemId === 'customer-list')  { setActivePage('customer-list'); setActiveModal(null); }
    if (itemId === 'discounts')      { setActivePage('discounts');     setActiveModal(null); }
    if (itemId === 'business-types') { setActivePage('business-types');setActiveModal(null); }
    if (itemId === 'nags-vehicle')   { setActivePage('nags-vehicle');  setActiveModal(null); }
    if (itemId === 'nags-part')      { setActivePage('nags-part');     setActiveModal(null); }
    if (itemId === 'schedule')       { setActivePage('schedule');      setActiveModal(null); }
    if (itemId === 'list-invoices')  { setActivePage('invoice-list');  setActiveModal(null); }
    if (itemId === 'receivables-list') { setActivePage('receivables-list'); setActiveModal(null); }
    if (itemId === 'send-edi')       { setActivePage('send-edi');      setActiveModal(null); }
    if (itemId === 'pending-edi')    { setActivePage('pending-edi');   setActiveModal(null); }
    if (itemId === 'employees')      { setActivePage('employees');     setActiveModal(null); }
  };

  const breadcrumb =
    activePage  ? pageBreadcrumbs[activePage]  :
    activeModal ? modalBreadcrumbs[activeModal] :
    undefined;

  return (
    <div style={styles.root}>
      <Navbar breadcrumb={breadcrumb} onItemClick={handleItemClick} />
      <div style={styles.body}>
        <Sidebar onItemClick={handleItemClick} />
        <main style={styles.main}>
          {activePage === 'customer-list' ? (
            <CustomerList onClose={() => setActivePage(null)} />
          ) : activePage === 'discounts' ? (
            <Discounts onClose={() => setActivePage(null)} />
          ) : activePage === 'business-types' ? (
            <BusinessTypes onClose={() => setActivePage(null)} />
          ) : activePage === 'nags-vehicle' ? (
            <NAGSByVehicle
              onClose={() => setActivePage(null)}
              onTurnIntoInvoice={handleTurnIntoInvoice}
            />
          ) : activePage === 'nags-part' ? (
            <NAGSByPartNumber
              onClose={() => setActivePage(null)}
              onTurnIntoInvoice={() => setActivePage('invoice')}
            />
          ) : activePage === 'invoice-list' ? (
            <Invoice
              onClose={() => setActivePage(null)}
              startView="list"
              invoices={visibleInvoices}
              onSaveInvoice={handleSaveInvoice}
              onDeleteInvoice={handleDeleteInvoice}
              nextInvoiceId={nextInvoiceId}
            />
          ) : activePage === 'invoice' ? (
            <Invoice
              onClose={() => setActivePage(null)}
              startView="editor"
              invoices={visibleInvoices}
              onSaveInvoice={handleSaveInvoice}
              onDeleteInvoice={handleDeleteInvoice}
              nextInvoiceId={nextInvoiceId}
              prefill={invoicePrefill}
            />
          ) : activePage === 'receivables-list' ? (
            <PaidInvoices
              onClose={() => setActivePage(null)}
              invoices={visibleInvoices}
              onUpdateInvoice={handleSaveInvoice}
              onDeleteInvoice={handleDeleteInvoice}
            />
          ) : activePage === 'send-edi' ? (
            <SendEDIClaims onClose={() => setActivePage(null)} />
          ) : activePage === 'pending-edi' ? (
            <PendingEDIClaims onClose={() => setActivePage(null)} />
          ) : activePage === 'schedule' ? (
            <Schedule onClose={() => setActivePage(null)} />
          ) : activePage === 'employees' ? (
            <Employees onClose={() => setActivePage(null)} />
          ) : (
            <div style={styles.placeholder}>
              <span style={styles.placeholderTitle}>ADMIN</span>
              <span style={styles.placeholderSub}>Select an option from the sidebar</span>
            </div>
          )}
        </main>
      </div>

      {activeModal === 'print-setup' && (
        <PrintSetupModal onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  root:             { display: 'flex', flexDirection: 'column', height: '100vh' },
  body:             { display: 'flex', flex: 1, marginTop: 52, overflow: 'hidden' },
  main:             { flex: 1, background: '#f9fafb', display: 'flex', overflow: 'hidden' },
  placeholder:      { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 },
  placeholderTitle: { fontSize: 13, fontWeight: 600, color: '#9ca3af', letterSpacing: 1.5 },
  placeholderSub:   { fontSize: 13, color: '#9ca3af' },
};

export default App;
