import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import PrintSetupModal from './components/PrintSetupModal';
import CustomerList from './components/CustomerList';
import Discounts      from './components/Discounts';
import BusinessTypes  from './components/BusinessTypes';
import NAGSByVehicle    from './components/NAGSByVehicle';
import NAGSByPartNumber from './components/NAGSByPartNumber';
import SavedQuotes      from './components/SavedQuotes';
import Invoice          from './components/Invoice';
import Schedule         from './components/Schedule';
import SendEDIClaims    from './components/SendEDIClaims';
import PendingEDIClaims from './components/PendingEDIClaims';
import { InvoiceRecord } from './types';

type ActivePage  = 'customer-list' | 'discounts' | 'business-types' | 'nags-vehicle' | 'nags-part' | 'saved-quotes' | 'invoice' | 'invoice-list' | 'schedule' | 'send-edi' | 'pending-edi' | null;
type ActiveModal = 'print-setup' | null;

const pageBreadcrumbs: Record<string, { section: string; item: string }> = {
  'customer-list':  { section: 'Customer',     item: 'Customer List'    },
  'discounts':      { section: 'Customer',     item: 'Discounts'        },
  'business-types': { section: 'Customer',     item: 'Business Types'   },
  'nags-vehicle':   { section: 'Quotes (A/R)', item: 'NAGS by Vehicle'  },
  'nags-part':      { section: 'Quotes (A/R)', item: 'NAGS by Part #'   },
  'saved-quotes':   { section: 'Quotes (A/R)', item: 'Saved Quotes'     },
  'invoice':        { section: 'Invoice',      item: 'Invoice Editor'   },
  'invoice-list':   { section: 'Invoice',      item: 'List of Invoices' },
  'send-edi':       { section: 'Invoice',      item: 'Send EDI Claims'    },
  'pending-edi':    { section: 'Invoice',      item: 'Pending EDI Claims' },
  'schedule':       { section: 'File',         item: 'Schedule'         },
};

const modalBreadcrumbs: Record<string, { section: string; item: string }> = {
  'print-setup': { section: 'File', item: 'Print Setup' },
};

const App: React.FC = () => {
  const [activePage,   setActivePage]   = useState<ActivePage>(null);
  const [activeModal,  setActiveModal]  = useState<ActiveModal>(null);
  const [userInvoices, setUserInvoices] = useState<InvoiceRecord[]>([]);
  const [nextInvoiceId, setNextInvoiceId] = useState(19);

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
  };

  const handleDeleteInvoice = (id: number) =>
    setUserInvoices(prev => prev.filter(r => r.id !== id));

  const handleItemClick = (itemId: string) => {
    if (itemId === 'print-setup')    { setActiveModal('print-setup');  return; }
    if (itemId === 'customer-list')  { setActivePage('customer-list'); setActiveModal(null); }
    if (itemId === 'discounts')      { setActivePage('discounts');     setActiveModal(null); }
    if (itemId === 'business-types') { setActivePage('business-types');setActiveModal(null); }
    if (itemId === 'nags-vehicle')   { setActivePage('nags-vehicle');  setActiveModal(null); }
    if (itemId === 'nags-part')      { setActivePage('nags-part');     setActiveModal(null); }
    if (itemId === 'saved-quotes')   { setActivePage('saved-quotes');  setActiveModal(null); }
    if (itemId === 'schedule')       { setActivePage('schedule');      setActiveModal(null); }
    if (itemId === 'list-invoices')  { setActivePage('invoice-list');  setActiveModal(null); }
    if (itemId === 'send-edi')       { setActivePage('send-edi');      setActiveModal(null); }
    if (itemId === 'pending-edi')    { setActivePage('pending-edi');   setActiveModal(null); }
  };

  const breadcrumb =
    activePage  ? pageBreadcrumbs[activePage]  :
    activeModal ? modalBreadcrumbs[activeModal] :
    undefined;

  return (
    <div style={styles.root}>
      <Navbar breadcrumb={breadcrumb} />
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
              onTurnIntoInvoice={() => setActivePage('invoice')}
            />
          ) : activePage === 'nags-part' ? (
            <NAGSByPartNumber
              onClose={() => setActivePage(null)}
              onTurnIntoInvoice={() => setActivePage('invoice')}
            />
          ) : activePage === 'saved-quotes' ? (
            <SavedQuotes onClose={() => setActivePage(null)} />
          ) : activePage === 'invoice-list' ? (
            <Invoice
              onClose={() => setActivePage(null)}
              startView="list"
              invoices={userInvoices}
              onSaveInvoice={handleSaveInvoice}
              onDeleteInvoice={handleDeleteInvoice}
              nextInvoiceId={nextInvoiceId}
            />
          ) : activePage === 'invoice' ? (
            <Invoice
              onClose={() => setActivePage(null)}
              startView="editor"
              invoices={userInvoices}
              onSaveInvoice={handleSaveInvoice}
              onDeleteInvoice={handleDeleteInvoice}
              nextInvoiceId={nextInvoiceId}
            />
          ) : activePage === 'send-edi' ? (
            <SendEDIClaims onClose={() => setActivePage(null)} />
          ) : activePage === 'pending-edi' ? (
            <PendingEDIClaims onClose={() => setActivePage(null)} />
          ) : activePage === 'schedule' ? (
            <Schedule onClose={() => setActivePage(null)} />
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
