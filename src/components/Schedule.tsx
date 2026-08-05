import React, { useState, useRef, useEffect } from 'react';
import { CalendarDays, X, ChevronLeft, ChevronRight, Check, Trash2 } from 'lucide-react';
import { api } from '../api/client';

interface Appointment {
  customerName: string;
  phone: string;
  vin: string;
  notes: string;
}

// Each time slot has exactly 2 fixed positions; null = free
type SlotPair = [Appointment | null, Appointment | null];
type DayMap   = Record<string, SlotPair>;

const generateSlots = (): string[] => {
  const slots: string[] = [];
  for (let h = 8; h <= 17; h++) {
    const mins = h === 17 ? [0] : [0, 15, 30, 45];
    for (const m of mins) {
      const h12  = h > 12 ? h - 12 : h;
      const ampm = h >= 12 ? 'PM' : 'AM';
      slots.push(`${h12}:${m.toString().padStart(2, '0')} ${ampm}`);
    }
  }
  return slots;
};

const TIME_SLOTS = generateSlots();

// Local calendar date → 'YYYY-MM-DD', without the UTC shift toISOString() would introduce.
const toIsoDate = (d: Date) => {
  const y   = d.getFullYear();
  const mo  = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
};

interface FormState { customerName: string; phone: string; vin: string; notes: string; }
const emptyForm = (): FormState => ({ customerName: '', phone: '', vin: '', notes: '' });

interface ModalState { slot: string; index: 0 | 1; }

interface Props { onClose: () => void; }

/* ──────────────────────────────────────────── Calendar picker ── */
const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];

const CalendarPicker: React.FC<{
  selected: Date;
  onSelect: (d: Date) => void;
  onClose: () => void;
}> = ({ selected, onSelect, onClose }) => {
  const [view, setView] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const year        = view.getFullYear();
  const month       = view.getMonth();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today       = new Date();

  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div ref={ref} style={cal.panel}>
      <div style={cal.header}>
        <button style={cal.navBtn} onClick={() => setView(new Date(year, month - 1, 1))}>
          <ChevronLeft size={13} />
        </button>
        <span style={cal.monthLabel}>{MONTH_NAMES[month]} {year}</span>
        <button style={cal.navBtn} onClick={() => setView(new Date(year, month + 1, 1))}>
          <ChevronRight size={13} />
        </button>
      </div>
      <div style={cal.grid}>
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} style={cal.dayName}>{d}</div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />;
          const isSel = selected.getDate() === d && selected.getMonth() === month && selected.getFullYear() === year;
          const isTdy = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
          return (
            <button
              key={d}
              style={{ ...cal.dayBtn, ...(isSel ? cal.selDay : isTdy ? cal.todayDay : {}) }}
              onClick={() => { onSelect(new Date(year, month, d)); onClose(); }}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────── Dialog field helpers ── */
const DialogField: React.FC<{
  label: string; value: string; error?: string; required?: boolean;
  onChange: (v: string) => void; placeholder?: string;
}> = ({ label, value, error, required, onChange, placeholder }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: error ? '#ef4444' : '#374151' }}>
      {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
    <input
      style={{
        padding: '9px 12px',
        border: `1.5px solid ${error ? '#fca5a5' : '#d1d5db'}`,
        borderRadius: 7,
        fontSize: 13,
        color: '#111827',
        outline: 'none',
        background: error ? '#fff5f5' : '#fff',
        width: '100%',
        boxSizing: 'border-box' as const,
      }}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
    {error && <span style={{ fontSize: 11, color: '#ef4444' }}>{error}</span>}
  </div>
);

const DialogTextarea: React.FC<{
  label: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
      {label} <span style={{ fontSize: 11, fontWeight: 400, color: '#9ca3af' }}>(optional)</span>
    </label>
    <textarea
      rows={3}
      style={{
        padding: '9px 12px',
        border: '1.5px solid #d1d5db',
        borderRadius: 7,
        fontSize: 13,
        color: '#111827',
        outline: 'none',
        background: '#fff',
        width: '100%',
        boxSizing: 'border-box' as const,
        resize: 'vertical' as const,
        fontFamily: 'inherit',
        lineHeight: 1.5,
      }}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

/* ──────────────────────────────────────────── Booking dialog ── */
const BookingDialog: React.FC<{
  modal: ModalState;
  existing: Appointment | null;
  dateLabel: string;
  onSave: (form: FormState) => void;
  onDelete: () => void;
  onClose: () => void;
}> = ({ modal, existing, dateLabel, onSave, onDelete, onClose }) => {
  const [form,   setForm]   = useState<FormState>(
    existing
      ? { customerName: existing.customerName, phone: existing.phone, vin: existing.vin, notes: existing.notes }
      : emptyForm()
  );
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const isEdit = !!existing;

  const validate = () => {
    const e: Partial<FormState> = {};
    if (!form.customerName.trim()) e.customerName = 'Required';
    if (!form.phone.trim())        e.phone        = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => { if (validate()) onSave(form); };

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div style={dlg.overlay} onClick={handleBackdrop}>
      <div style={dlg.box}>

        {/* Header */}
        <div style={dlg.header}>
          <div style={dlg.headerLeft}>
            <div style={dlg.headerSlot}>
              {isEdit ? 'Edit' : 'Book'} Slot {modal.index + 1}
            </div>
            <div style={dlg.headerSub}>{modal.slot} &nbsp;·&nbsp; {dateLabel}</div>
          </div>
          <button style={dlg.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>

        {/* Fields */}
        <div style={dlg.body}>
          <DialogField
            label="Customer Name"
            required
            value={form.customerName}
            error={errors.customerName}
            placeholder="e.g. APEX GLASS WORKS"
            onChange={v => { setForm(f => ({ ...f, customerName: v })); setErrors(e => ({ ...e, customerName: undefined })); }}
          />
          <DialogField
            label="Phone Number"
            required
            value={form.phone}
            error={errors.phone}
            placeholder="e.g. 555-0101"
            onChange={v => { setForm(f => ({ ...f, phone: v })); setErrors(e => ({ ...e, phone: undefined })); }}
          />
          <DialogField
            label="VIN"
            value={form.vin}
            placeholder="Optional"
            onChange={v => setForm(f => ({ ...f, vin: v }))}
          />
          <DialogTextarea
            label="Note / Issue"
            value={form.notes}
            placeholder="e.g. Rear windshield crack, customer requested OEM only…"
            onChange={v => setForm(f => ({ ...f, notes: v }))}
          />
        </div>

        {/* Footer */}
        <div style={dlg.footer}>
          <button style={dlg.btnSave} onClick={handleSave}>
            <Check size={14} /> {isEdit ? 'Update' : 'Book Slot'}
          </button>
          {isEdit && (
            <button style={dlg.btnDelete} onClick={onDelete}>
              <Trash2 size={14} /> Remove
            </button>
          )}
          <button style={dlg.btnCancel} onClick={onClose}>Cancel</button>
        </div>

      </div>
    </div>
  );
};

/* ──────────────────────────────────────────── Main component ── */
const Schedule: React.FC<Props> = ({ onClose }) => {
  const [date,      setDate]      = useState(new Date());
  const [showCal,   setShowCal]   = useState(false);
  const [daySlots,  setDaySlots]  = useState<DayMap>({});
  const [modal,     setModal]     = useState<ModalState | null>(null);

  const dk = toIsoDate(date);

  // Load this day's bookings from the backend whenever the selected date changes.
  useEffect(() => {
    let cancelled = false;
    api.getSchedule(dk)
      .then(rows => {
        if (cancelled) return;
        const map: DayMap = {};
        for (const r of rows) {
          const pair: SlotPair = map[r.slot_time] ?? [null, null];
          pair[r.slot_index] = { customerName: r.customer_name, phone: r.phone, vin: r.vin, notes: r.notes };
          map[r.slot_time] = pair;
        }
        setDaySlots(map);
      })
      .catch(() => { if (!cancelled) setDaySlots({}); });
    return () => { cancelled = true; };
  }, [dk]);

  const prevDay = () => { const d = new Date(date); d.setDate(d.getDate() - 1); setDate(d); };
  const nextDay = () => { const d = new Date(date); d.setDate(d.getDate() + 1); setDate(d); };

  const openModal  = (slot: string, index: 0 | 1) => setModal({ slot, index });
  const closeModal = () => setModal(null);

  const saveBooking = (form: FormState) => {
    if (!modal) return;
    const { slot, index } = modal;
    const appt: Appointment = {
      customerName: form.customerName.trim().toUpperCase(),
      phone: form.phone.trim(),
      vin:   form.vin.trim(),
      notes: form.notes.trim(),
    };
    setDaySlots(prev => {
      const pair: SlotPair = [...(prev[slot] ?? [null, null])] as SlotPair;
      pair[index] = appt;
      return { ...prev, [slot]: pair };
    });
    api.saveScheduleBooking({
      date: dk, slot, slotIndex: index,
      customerName: appt.customerName, phone: appt.phone, vin: appt.vin, notes: appt.notes,
    }).catch(() => {});
    closeModal();
  };

  const deleteBooking = () => {
    if (!modal) return;
    const { slot, index } = modal;
    setDaySlots(prev => {
      const pair: SlotPair = [...(prev[slot] ?? [null, null])] as SlotPair;
      pair[index] = null;
      const next = { ...prev };
      if (!pair[0] && !pair[1]) delete next[slot];
      else next[slot] = pair;
      return next;
    });
    api.deleteScheduleBooking({ date: dk, slot, slotIndex: index }).catch(() => {});
    closeModal();
  };

  const dateLabel = date.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: '2-digit',
  });
  const isToday = date.toDateString() === new Date().toDateString();

  const totalBooked = Object.values(daySlots).reduce((s, p) => s + (p[0] ? 1 : 0) + (p[1] ? 1 : 0), 0);
  const totalFull   = Object.values(daySlots).filter(p => p[0] && p[1]).length;

  const modalExisting = modal
    ? (daySlots[modal.slot]?.[modal.index] ?? null)
    : null;

  return (
    <>
      <div style={st.card}>

        {/* ── Header ── */}
        <div style={st.header}>
          <div style={st.headerLeft}>
            <div style={st.headerIcon}><CalendarDays size={18} color="#fff" /></div>
            <div>
              <div style={st.headerTitle}>Schedule</div>
              <div style={st.headerSub}>15-min slots &nbsp;·&nbsp; 2 bookings per slot</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={st.datePicker}>
              <button style={st.navBtn} onClick={prevDay}><ChevronLeft size={15} /></button>
              <div style={{ position: 'relative' }}>
                <button style={st.dateLabel} onClick={() => setShowCal(v => !v)}>
                  {isToday && <span style={st.todayDot} />}
                  {dateLabel}
                  <CalendarDays size={12} color="rgba(255,255,255,0.75)" />
                </button>
                {showCal && (
                  <CalendarPicker
                    selected={date}
                    onSelect={d => { setDate(d); setShowCal(false); }}
                    onClose={() => setShowCal(false)}
                  />
                )}
              </div>
              <button style={st.navBtn} onClick={nextDay}><ChevronRight size={15} /></button>
            </div>
            <button style={st.closeBtn} onClick={onClose}><X size={16} color="#fff" /></button>
          </div>
        </div>

        {/* ── Slot rows ── */}
        <div style={st.body}>
          {TIME_SLOTS.map((slot, slotIdx) => {
            const pair   = daySlots[slot] ?? [null, null];
            const isHour = slot.includes(':00 ');
            const count  = (pair[0] ? 1 : 0) + (pair[1] ? 1 : 0);

            return (
              <div
                key={slot}
                style={{
                  ...st.slotRow,
                  borderTop: isHour && slotIdx > 0 ? '2px solid #e5e7eb' : undefined,
                  background: count === 2 ? '#f7fef9' : '#fff',
                }}
              >
                {/* Time label */}
                <div style={st.timeCol}>
                  {isHour ? (
                    <span style={st.timeLabelHour}>{slot}</span>
                  ) : (
                    <span style={st.timeLabelSub}>{slot}</span>
                  )}
                </div>

                {/* Two slot chips */}
                <div style={st.chipsRow}>
                  {([0, 1] as const).map(idx => {
                    const appt   = pair[idx];
                    const isFree = appt === null;
                    const name   = appt
                      ? (appt.customerName.length > 22 ? appt.customerName.slice(0, 22) + '…' : appt.customerName)
                      : '';

                    return (
                      <button
                        key={idx}
                        style={isFree ? st.chipFree : st.chipBooked}
                        onClick={() => openModal(slot, idx)}
                      >
                        <span style={isFree ? st.chipSlotTag : st.chipSlotTagBooked}>
                          Slot {idx + 1}
                        </span>
                        {isFree ? (
                          <span style={st.chipAvail}>Available</span>
                        ) : (
                          <div style={st.chipInfo}>
                            <span style={st.chipName}>{name}</span>
                            <span style={st.chipPhone}>{appt!.phone}</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div style={st.footer}>
          <span style={st.footerStat}><span style={{ ...st.dot, background: '#16a34a' }} />{totalBooked} booked</span>
          <span style={st.footerStat}><span style={{ ...st.dot, background: '#f59e0b' }} />{totalFull} full slots</span>
          <span style={st.footerStat}><span style={{ ...st.dot, background: '#d1d5db' }} />{TIME_SLOTS.length * 2 - totalBooked} open</span>
        </div>

      </div>

      {/* ── Booking dialog ── */}
      {modal && (
        <BookingDialog
          modal={modal}
          existing={modalExisting}
          dateLabel={dateLabel}
          onSave={saveBooking}
          onDelete={deleteBooking}
          onClose={closeModal}
        />
      )}
    </>
  );
};

/* ──────────────────────────────────────────── Styles ── */
const st: Record<string, React.CSSProperties> = {
  card:        { flex: 1, display: 'flex', flexDirection: 'column', margin: 20, borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', background: '#fff' },

  header:      { background: '#16a34a', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  headerLeft:  { display: 'flex', alignItems: 'center', gap: 12 },
  headerIcon:  { width: 34, height: 34, background: 'rgba(255,255,255,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 700, color: '#fff' },
  headerSub:   { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  closeBtn:    { background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' },

  datePicker:  { display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '4px 6px' },
  navBtn:      { background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 3, borderRadius: 4 },
  dateLabel:   { fontSize: 13, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 5, minWidth: 155, justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: 6 },
  todayDot:    { width: 6, height: 6, borderRadius: '50%', background: '#bbf7d0', display: 'inline-block' },

  body:        { flex: 1, overflowY: 'auto' as const },

  /* Row — hour marks get a stronger top divider */
  slotRow:     { display: 'flex', alignItems: 'center', padding: '7px 18px', gap: 12, borderBottom: '1px solid #f1f5f9' },

  /* Time column */
  timeCol:       { width: 82, flexShrink: 0 },
  timeLabelHour: { fontSize: 13, fontWeight: 700, color: '#1e293b' },
  timeLabelSub:  { fontSize: 11, fontWeight: 400, color: '#94a3b8' },

  /* Chips row */
  chipsRow: { flex: 1, display: 'flex', gap: 10 },

  /* Free chip */
  chipFree: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 14px',
    background: '#fff',
    border: '1.5px dashed #cbd5e1',
    borderRadius: 8,
    cursor: 'pointer',
    textAlign: 'left' as const,
    minHeight: 44,
  },
  chipSlotTag:       { fontSize: 10, fontWeight: 700, color: '#94a3b8', background: '#f1f5f9', padding: '2px 7px', borderRadius: 4, flexShrink: 0, letterSpacing: '0.03em' },
  chipAvail:         { fontSize: 12, color: '#cbd5e1' },

  /* Booked chip */
  chipBooked: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 14px',
    background: '#f0fdf4',
    border: '1.5px solid #bbf7d0',
    borderLeft: '4px solid #16a34a',
    borderRadius: 8,
    cursor: 'pointer',
    textAlign: 'left' as const,
    minHeight: 44,
  },
  chipSlotTagBooked: { fontSize: 10, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 7px', borderRadius: 4, flexShrink: 0, letterSpacing: '0.03em' },
  chipInfo:  { display: 'flex', flexDirection: 'column' as const, gap: 2, overflow: 'hidden' },
  chipName:  { fontSize: 12, fontWeight: 700, color: '#166534', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' },
  chipPhone: { fontSize: 11, color: '#4b7c5a' },

  footer:     { display: 'flex', gap: 20, padding: '9px 18px', borderTop: '1px solid #e5e7eb', flexShrink: 0 },
  footerStat: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#6b7280' },
  dot:        { width: 8, height: 8, borderRadius: '50%' },
};

/* ──────────────────────────────────────────── Dialog styles ── */
const dlg: Record<string, React.CSSProperties> = {
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  box:        { background: '#fff', borderRadius: 12, width: 420, maxWidth: '92vw', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' },

  header:     { background: '#16a34a', padding: '18px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerLeft: { display: 'flex', flexDirection: 'column', gap: 3 },
  headerSlot: { fontSize: 17, fontWeight: 700, color: '#fff' },
  headerSub:  { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  closeBtn:   { background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6, cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', color: '#fff' },

  body:       { padding: '20px 20px 16px', display: 'flex', flexDirection: 'column', gap: 14 },

  footer:     { padding: '14px 20px 18px', display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid #f0f0f0' },
  btnSave:    { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: '#16a34a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' },
  btnDelete:  { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#fff', border: '1.5px solid #fca5a5', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#ef4444', cursor: 'pointer' },
  btnCancel:  { marginLeft: 'auto', padding: '9px 16px', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' },
};

/* ──────────────────────────────────────────── Calendar styles ── */
const cal: Record<string, React.CSSProperties> = {
  panel:      { position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', zIndex: 3000, background: '#fff', borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.18)', padding: 12, width: 240, border: '1px solid #e5e7eb' },
  header:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  navBtn:     { background: 'transparent', border: 'none', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 4 },
  monthLabel: { fontSize: 13, fontWeight: 700, color: '#111827' },
  grid:       { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 },
  dayName:    { fontSize: 10, fontWeight: 600, color: '#9ca3af', textAlign: 'center' as const, padding: '4px 0' },
  dayBtn:     { fontSize: 12, color: '#374151', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 6, padding: '5px 0', textAlign: 'center' as const, width: '100%' },
  selDay:     { background: '#16a34a', color: '#fff', fontWeight: 700 },
  todayDay:   { background: '#dcfce7', color: '#166534', fontWeight: 700 },
};

export default Schedule;
