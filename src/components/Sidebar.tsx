import React, { useState } from 'react';
import {
  ChevronDown,
  Printer, Wrench, LogOut,
  List, TrendingUp, Tag, Building2,
  FileText, Send, Clock,
  DollarSign, BarChart2, Calendar, CheckSquare,
  Car, Hash, Search, BookOpen, Package, ReceiptText,
} from 'lucide-react';

interface SubItem {
  label: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  subItems?: SubItem[];
}

interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    id: 'file',
    title: 'FILE',
    items: [
      { id: 'print-setup', label: 'Print Setup', icon: <Printer size={15} /> },
      { id: 'toolbars', label: 'Toolbars', icon: <Wrench size={15} /> },
      { id: 'exit', label: 'Exit', icon: <LogOut size={15} /> },
    ],
  },
  {
    id: 'customer',
    title: 'CUSTOMER',
    items: [
      { id: 'customer-list', label: 'Customer List', icon: <List size={15} /> },
      {
        id: 'sales-activity',
        label: 'Sales Activity',
        icon: <TrendingUp size={15} />,
        subItems: [
          { label: 'Report' },
          { label: 'Maintain' },
          { label: 'All Inclusive Report' },
          { label: 'Total Jobs Per Customer' },
          { label: 'Update Latest Call Date' },
          { label: 'Customer Total Sales($)' },
        ],
      },
      { id: 'discounts', label: 'Discounts', icon: <Tag size={15} /> },
      { id: 'business-types', label: 'Business Types', icon: <Building2 size={15} /> },
    ],
  },
  {
    id: 'invoice',
    title: 'INVOICE',
    items: [
      { id: 'list-invoices', label: 'List of Invoices', icon: <FileText size={15} /> },
      { id: 'send-edi', label: 'Send EDI Claims', icon: <Send size={15} /> },
      { id: 'pending-edi', label: 'Pending EDI Claims', icon: <Clock size={15} /> },
    ],
  },
  {
    id: 'reports',
    title: 'REPORTS',
    items: [
      { id: 'expense-report', label: 'Expense Report', icon: <DollarSign size={15} /> },
      { id: 'daily-sales', label: 'Daily Sales', icon: <BarChart2 size={15} /> },
      { id: 'sales-by-range', label: 'Sales by Range', icon: <Calendar size={15} /> },
      { id: 'completed', label: 'Completed', icon: <CheckSquare size={15} /> },
    ],
  },
  {
    id: 'quotes',
    title: 'QUOTES (A/R)',
    items: [
      { id: 'nags-vehicle', label: 'NAGS by Vehicle', icon: <Car size={15} /> },
      { id: 'nags-part', label: 'NAGS by Part #', icon: <Hash size={15} /> },
      { id: 'nags-vin', label: 'NAGS by VIN', icon: <Search size={15} /> },
      { id: 'saved-quotes', label: 'Saved Quotes', icon: <BookOpen size={15} /> },
    ],
  },
  {
    id: 'receivables',
    title: 'RECEIVABLES (A/R)',
    items: [
      { id: 'receivables-list', label: 'Receivables List', icon: <ReceiptText size={15} /> },
    ],
  },
  {
    id: 'inventory',
    title: 'INVENTORY',
    items: [
      { id: 'inventory-list', label: 'Inventory List', icon: <Package size={15} /> },
    ],
  },
];

const Sidebar: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['customer', 'invoice', 'reports'])
  );
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(['sales-activity'])
  );

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <aside style={styles.sidebar}>
      <nav style={styles.nav}>
        {menuSections.map((section) => {
          const isSectionExpanded = expandedSections.has(section.id);
          return (
            <div key={section.id}>
              <button style={styles.sectionHeader} onClick={() => toggleSection(section.id)}>
                <span style={styles.sectionTitle}>{section.title}</span>
                <ChevronDown
                  size={14}
                  color="#64748b"
                  style={{
                    transform: isSectionExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform 0.2s',
                  }}
                />
              </button>

              {isSectionExpanded && section.items.length > 0 && (
                <div style={styles.itemsContainer}>
                  {section.items.map((item) => {
                    const hasSubItems = !!item.subItems?.length;
                    const isItemExpanded = expandedItems.has(item.id);
                    return (
                      <div key={item.id}>
                        <button
                          style={styles.menuItem}
                          onClick={() => hasSubItems && toggleItem(item.id)}
                        >
                          <span style={styles.itemIcon}>{item.icon}</span>
                          <span style={styles.itemLabel}>{item.label}</span>
                          {hasSubItems && (
                            <ChevronDown
                              size={13}
                              color="#64748b"
                              style={{
                                marginLeft: 'auto',
                                transform: isItemExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                                transition: 'transform 0.2s',
                              }}
                            />
                          )}
                        </button>

                        {hasSubItems && isItemExpanded && (
                          <div style={styles.subItemsContainer}>
                            {item.subItems!.map((sub) => (
                              <button key={sub.label} style={styles.subItem}>
                                <span style={styles.subItemLabel}>{sub.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div style={styles.footer}>
        <span style={styles.version}>GLASSLOGIC V2.0</span>
      </div>
    </aside>
  );
};

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 225,
    background: '#1e293b',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingTop: 8,
    overflowY: 'auto',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
  },
  sectionHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: '#64748b',
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  itemsContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 20px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
  },
  itemIcon: {
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  itemLabel: {
    fontSize: 13,
    color: '#e2e8f0',
    fontWeight: 400,
  },
  subItemsContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  subItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 20px 6px 44px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
  },
  subItemLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: 400,
  },
  footer: {
    padding: '16px',
    borderTop: '1px solid #334155',
  },
  version: {
    fontSize: 10,
    color: '#64748b',
    letterSpacing: 0.5,
  },
};

export default Sidebar;
