import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import PrintSetupModal from './components/PrintSetupModal';
import CustomerList from './components/CustomerList';

type ActivePage  = 'customer-list' | null;
type ActiveModal = 'print-setup'   | null;

const pageBreadcrumbs: Record<string, { section: string; item: string }> = {
  'customer-list': { section: 'Customer', item: 'Customer List' },
};

const modalBreadcrumbs: Record<string, { section: string; item: string }> = {
  'print-setup': { section: 'File', item: 'Print Setup' },
};

const App: React.FC = () => {
  const [activePage,  setActivePage]  = useState<ActivePage>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const handleItemClick = (itemId: string) => {
    if (itemId === 'print-setup')   { setActiveModal('print-setup');   return; }
    if (itemId === 'customer-list') { setActivePage('customer-list'); setActiveModal(null); }
  };

  const breadcrumb =
    activePage  ? pageBreadcrumbs[activePage]   :
    activeModal ? modalBreadcrumbs[activeModal]  :
    undefined;

  return (
    <div style={styles.root}>
      <Navbar breadcrumb={breadcrumb} />
      <div style={styles.body}>
        <Sidebar onItemClick={handleItemClick} />
        <main style={styles.main}>
          {activePage === 'customer-list' ? (
            <CustomerList onClose={() => setActivePage(null)} />
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
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  body: {
    display: 'flex',
    flex: 1,
    marginTop: 52,
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    background: '#f9fafb',
    display: 'flex',
    overflow: 'hidden',
  },
  placeholder: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#9ca3af',
    letterSpacing: 1.5,
  },
  placeholderSub: {
    fontSize: 13,
    color: '#9ca3af',
  },
};

export default App;
