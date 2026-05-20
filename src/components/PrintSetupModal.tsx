import React, { useState } from 'react';
import { Printer, X, ChevronDown } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const PrintSetupModal: React.FC<Props> = ({ onClose }) => {
  const [printer, setPrinter] = useState('Default Printer');
  const [paperSize, setPaperSize] = useState('Letter (8.5" × 11")');
  const [orientation, setOrientation] = useState('Portrait');

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}>
              <Printer size={18} color="#fff" />
            </div>
            <span style={styles.headerTitle}>Print Setup</span>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={18} color="#fff" />
          </button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          <Field label="Printer">
            <Select value={printer} onChange={setPrinter} options={[
              'Default Printer',
              'Microsoft Print to PDF',
              'Microsoft XPS Document Writer',
            ]} />
          </Field>
          <div style={styles.divider} />

          <Field label="Paper Size">
            <Select value={paperSize} onChange={setPaperSize} options={[
              'Letter (8.5" × 11")',
              'Legal (8.5" × 14")',
              'A4 (8.27" × 11.69")',
            ]} />
          </Field>
          <div style={styles.divider} />

          <Field label="Orientation">
            <Select value={orientation} onChange={setOrientation} options={[
              'Portrait',
              'Landscape',
            ]} />
          </Field>

          {/* Actions */}
          <div style={styles.actions}>
            <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button style={styles.saveBtn} onClick={onClose}>Save Settings</button>
          </div>

          {/* Note */}
          <div style={styles.note}>
            <span style={styles.noteText}>
              <strong>Note:</strong> These settings will be saved for all print operations
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={fieldStyles.wrapper}>
    <label style={fieldStyles.label}>{label}</label>
    {children}
  </div>
);

const Select: React.FC<{ value: string; onChange: (v: string) => void; options: string[] }> = ({ value, onChange, options }) => (
  <div style={selectStyles.wrapper}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={selectStyles.select}
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
    <ChevronDown size={16} color="#6b7280" style={selectStyles.chevron} />
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 300,
  },
  modal: {
    background: '#fff',
    borderRadius: 10,
    width: 610,
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    overflow: 'hidden',
  },
  header: {
    background: '#16a34a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 36,
    height: 36,
    background: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: '#fff',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 4,
    borderRadius: 4,
  },
  body: {
    padding: '28px 28px 20px',
  },
  divider: {
    height: 1,
    background: '#f3f4f6',
    margin: '4px 0',
  },
  actions: {
    display: 'flex',
    gap: 12,
    marginTop: 28,
    marginBottom: 16,
  },
  cancelBtn: {
    flex: 1,
    padding: '12px 0',
    background: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    color: '#111827',
    cursor: 'pointer',
  },
  saveBtn: {
    flex: 1,
    padding: '12px 0',
    background: '#16a34a',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    color: '#fff',
    cursor: 'pointer',
  },
  note: {
    background: '#f0fdf4',
    borderRadius: 6,
    padding: '10px 14px',
  },
  noteText: {
    fontSize: 12,
    color: '#374151',
  },
};

const fieldStyles: Record<string, React.CSSProperties> = {
  wrapper: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    fontSize: 14,
    fontWeight: 600,
    color: '#111827',
    marginBottom: 8,
  },
};

const selectStyles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'relative',
  },
  select: {
    width: '100%',
    padding: '10px 36px 10px 12px',
    border: '1px solid #16a34a',
    borderRadius: 6,
    fontSize: 14,
    color: '#111827',
    background: '#fff',
    appearance: 'none',
    cursor: 'pointer',
    outline: 'none',
  },
  chevron: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
  },
};

export default PrintSetupModal;
