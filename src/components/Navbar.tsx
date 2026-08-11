import React, { useState, useRef, useEffect } from 'react';
import { User, ChevronDown, ChevronRight, Users, FileText, Wrench, UserCog, LogOut } from 'lucide-react';

interface NavbarProps {
  breadcrumb?: { section: string; item: string };
  onItemClick?: (itemId: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ breadcrumb, onItemClick }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={styles.navbar}>
      <div style={styles.brand}>
        <div style={styles.logo}>
          <span style={styles.logoText}>GL</span>
        </div>
        <span style={styles.brandName}>GlassLogic</span>
      </div>

      {breadcrumb && (
        <div style={styles.breadcrumb}>
          <span style={styles.breadcrumbItem}>{breadcrumb.section}</span>
          <ChevronRight size={12} color="#d1d5db" />
          <span style={styles.breadcrumbActive}>{breadcrumb.item}</span>
        </div>
      )}

      <div style={styles.right} ref={dropdownRef}>
        <button style={styles.userButton} onClick={() => setDropdownOpen((o) => !o)}>
          <User size={16} color="#555" />
          <span style={styles.userText}>User</span>
          <ChevronDown
            size={14}
            color="#555"
            style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          />
        </button>

        {dropdownOpen && (
          <div style={styles.dropdown}>
            {[
              { id: 'employees', icon: <Users size={15} />, label: 'Employees' },
              { id: 'sales-tax-settings', icon: <FileText size={15} />, label: 'Sales Tax Settings' },
              { id: 'shop-info', icon: <Wrench size={15} />, label: 'Glass Shop Information' },
              { id: 'user-ids', icon: <UserCog size={15} />, label: "Glass Logic User ID's" },
            ].map(({ id, icon, label }) => (
              <button
                key={id}
                style={styles.dropdownItem}
                onClick={() => { onItemClick?.(id); setDropdownOpen(false); }}
              >
                <span style={styles.dropdownIcon}>{icon}</span>
                <span style={styles.dropdownLabel}>{label}</span>
              </button>
            ))}
            <div style={styles.dropdownDivider} />
            <button style={{ ...styles.dropdownItem, ...styles.logoutItem }}>
              <span style={styles.dropdownIcon}><LogOut size={15} /></span>
              <span style={styles.logoutLabel}>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  navbar: {
    height: 52,
    background: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 16,
    paddingRight: 24,
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 32,
    height: 32,
    background: '#16a34a',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  brandName: {
    fontWeight: 700,
    fontSize: 16,
    color: '#111827',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: 20,
    padding: '4px 12px',
  },
  breadcrumbItem: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: 500,
  },
  breadcrumbActive: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: 600,
  },
  right: {
    position: 'relative',
  },
  userButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '6px 8px',
    borderRadius: 6,
  },
  userText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: 500,
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
    minWidth: 220,
    zIndex: 200,
    paddingTop: 4,
    paddingBottom: 4,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '9px 16px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
  },
  dropdownIcon: {
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
  },
  dropdownLabel: {
    fontSize: 13,
    color: '#374151',
  },
  dropdownDivider: {
    height: 1,
    background: '#f3f4f6',
    margin: '4px 0',
  },
  logoutItem: {},
  logoutLabel: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: 500,
  },
};

export default Navbar;
