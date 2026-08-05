import React, { useState, useEffect, useRef } from 'react';
import { Tag, X, Trash2, Layers, Plus, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { api, type Discount, type NagsPrefixPart } from '../api/client';

/* ── Types ── */
interface DetailRow {
  id: number; nagsPrefix: string; partType: string; flatHourly: string;
  discount: string; labor: string; minHours: string; maxHours: string;
}
interface GlassDetail {
  partsDiscount: string; flatHourly: 'Flat' | 'Hourly'; laborRate: string;
}
interface Props { onClose: () => void; }

const emptyGlass = (): GlassDetail => ({ partsDiscount: '0.00', flatHourly: 'Flat', laborRate: '0.00' });

/* ══════════════════════════════════════════════════════════════
   Discount Detail Modal
══════════════════════════════════════════════════════════════ */
/* ── GlassSection must live outside DiscountDetailModal so React doesn't
      treat it as a new component type on every re-render (which would
      unmount the input and drop focus after each keystroke). ── */
const GlassSection: React.FC<{
  title: string; data: GlassDetail; onChange: (d: GlassDetail) => void;
}> = ({ title, data, onChange }) => (
  <div style={ms.section}>
    <div style={ms.sectionHeader}>
      <span style={ms.sectionTitle}>{title}</span>
      <div style={ms.sectionLine} />
    </div>
    <div style={ms.sectionBody}>
      <div style={ms.fieldGroup}>
        <label style={ms.fieldLabel}>Parts Discount</label>
        <input
          type="text" inputMode="decimal"
          value={data.partsDiscount}
          onChange={e => onChange({ ...data, partsDiscount: e.target.value })}
          style={ms.numInput}
        />
      </div>
      <div style={ms.radioGroup}>
        {(['Flat', 'Hourly'] as const).map(opt => (
          <label key={opt} style={ms.radioLabel}>
            <input
              type="radio" name={title}
              checked={data.flatHourly === opt}
              onChange={() => onChange({ ...data, flatHourly: opt })}
              style={{ accentColor: '#16a34a' }}
            />
            <span style={ms.radioText}>{opt}</span>
          </label>
        ))}
      </div>
      <div style={ms.fieldGroup}>
        <label style={ms.fieldLabel}>Labor Rate</label>
        <div style={ms.moneyWrap}>
          <span style={ms.moneySym}>$</span>
          <input
            type="text" inputMode="decimal"
            value={data.laborRate}
            onChange={e => onChange({ ...data, laborRate: e.target.value })}
            style={ms.moneyIn}
          />
        </div>
      </div>
    </div>
  </div>
);

interface DetailModalProps {
  initial?: { windshield: GlassDetail; tempered: GlassDetail; flat: GlassDetail };
  onOk: (windshield: GlassDetail, tempered: GlassDetail, flat: GlassDetail) => void;
  onClose: () => void;
}
const DiscountDetailModal: React.FC<DetailModalProps> = ({ initial, onOk, onClose }) => {
  const [windshield, setWindshield] = useState<GlassDetail>(initial?.windshield ?? emptyGlass());
  const [tempered,   setTempered]   = useState<GlassDetail>(initial?.tempered   ?? emptyGlass());
  const [flat,       setFlat]       = useState<GlassDetail>(initial?.flat       ?? emptyGlass());

  return (
    <div style={ms.overlay}>
      <div style={ms.modal}>
        {/* Header */}
        <div style={ms.header}>
          <div style={ms.headerLeft}>
            <div style={ms.headerIcon}><Layers size={18} color="#fff" /></div>
            <div>
              <div style={ms.headerTitle}>Discount Detail</div>
              <div style={ms.headerSub}>Set rates per glass type</div>
            </div>
          </div>
          <button style={ms.closeBtn} onClick={onClose}><X size={17} color="#fff" /></button>
        </div>

        {/* Body */}
        <div style={ms.body}>
          <GlassSection title="Windshield" data={windshield} onChange={setWindshield} />
          <GlassSection title="Tempered"   data={tempered}   onChange={setTempered}   />
          <GlassSection title="Flat"       data={flat}       onChange={setFlat}       />
        </div>

        {/* Footer */}
        <div style={ms.footer}>
          <button style={ms.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={ms.okBtn} onClick={() => onOk(windshield, tempered, flat)}>Ok</button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   Main Discounts Page
══════════════════════════════════════════════════════════════ */
const Discounts: React.FC<Props> = ({ onClose }) => {
  const bodyRef = useRef<HTMLDivElement>(null);
  const discountListRef = useRef<HTMLDivElement>(null);

  // Discount identity
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // EDI
  const [ediEnabled, setEdiEnabled] = useState(false);
  const [ediFormat,  setEdiFormat]  = useState('');

  // KIT
  const [kitCharge,    setKitCharge]    = useState('Yes');
  const [highModAmt,   setHighModAmt]   = useState('0.00');
  const [kitAmount,    setKitAmount]    = useState('0.00');
  const [highModNC15,  setHighModNC15]  = useState('0.00');
  const [twoKitAmount, setTwoKitAmount] = useState('0.00');
  const [highModNC20,  setHighModNC20]  = useState('0.00');

  // MATERIAL
  const [materialCharge, setMaterialCharge] = useState('No');
  const [materialAmount, setMaterialAmount] = useState('0.00');

  // LABOR
  const [laborCharge,     setLaborCharge]     = useState('Yes');
  const [repairCharge,    setRepairCharge]    = useState('Yes');
  const [initRepairAmt,   setInitRepairAmt]   = useState('25.00');
  const [addtnlRepairAmt, setAddtnlRepairAmt] = useState('10.00');
  const [baseLaborAmt,    setBaseLaborAmt]    = useState('20.00');

  // Detail table
  const [detailRows,      setDetailRows]      = useState<DetailRow[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalInitial,    setModalInitial]    = useState<{ windshield: GlassDetail; tempered: GlassDetail; flat: GlassDetail } | undefined>(undefined);

  const getDetailInitials = (rows: DetailRow[]) => {
    const find = (pt: string): GlassDetail => {
      const row = rows.find(r => r.partType === pt);
      return row
        ? { partsDiscount: row.discount, flatHourly: row.flatHourly as 'Flat' | 'Hourly', laborRate: row.labor }
        : emptyGlass();
    };
    return { windshield: find('Windshield'), tempered: find('Tempered'), flat: find('Flat') };
  };

  const handleDetailOk = (w: GlassDetail, t: GlassDetail, f: GlassDetail) => {
    const updates: Record<string, GlassDetail> = { Windshield: w, Tempered: t, Flat: f };
    setDetailRows(prev => {
      if (prev.length === 0) {
        const now = Date.now();
        return [
          { id: now,     nagsPrefix: '', partType: 'Windshield', flatHourly: w.flatHourly, discount: w.partsDiscount, labor: w.laborRate, minHours: '0.00', maxHours: '0.00' },
          { id: now + 1, nagsPrefix: '', partType: 'Tempered',   flatHourly: t.flatHourly, discount: t.partsDiscount, labor: t.laborRate, minHours: '0.00', maxHours: '0.00' },
          { id: now + 2, nagsPrefix: '', partType: 'Flat',       flatHourly: f.flatHourly, discount: f.partsDiscount, labor: f.laborRate, minHours: '0.00', maxHours: '0.00' },
        ];
      }
      return prev.map(row => {
        const upd = updates[row.partType];
        return upd ? { ...row, flatHourly: upd.flatHourly, discount: upd.partsDiscount, labor: upd.laborRate } : row;
      });
    });
    setShowDetailModal(false);
  };

  const [saveError, setSaveError] = useState('');

  // discount_detail.nags_prefix is CHAR(2) in gl2015m1 — only real NAGS prefixes
  // (from the parts table) fit. Expand each category's rate into one row per
  // real prefix instead of sending a blank/fallback prefix, which would
  // overflow the column and fail the insert under STRICT_TRANS_TABLES.
  const expandToNagsPrefixRows = (rows: DetailRow[]) => {
    const byType: Record<string, DetailRow | undefined> = {};
    for (const r of rows) byType[r.partType] = r;
    return nagsParts.map(p => {
      const r = byType[p.part_type];
      return {
        nags_prefix:      p.nags_prefix,
        part_type:        p.part_type,
        flat_or_hourly:   (r?.flatHourly ?? 'Flat') as 'Flat' | 'Hourly',
        discount_amount:  parseFloat(r?.discount ?? '0') || 0,
        labor_rate:       parseFloat(r?.labor ?? '0') || 0,
        min_hours:        parseFloat(r?.minHours ?? '0') || 0,
        max_hours:        parseFloat(r?.maxHours ?? '0') || 0,
        discount_amount2: parseFloat(r?.discount ?? '0') || 0,
        labor_rate2:      parseFloat(r?.labor ?? '0') || 0,
        min_hours2:       parseFloat(r?.minHours ?? '0') || 0,
        max_hours2:       parseFloat(r?.maxHours ?? '0') || 0,
      };
    });
  };

  const buildPayload = () => ({
    discount_name:        name.trim(),
    kit_charge:           kitCharge === 'Yes' ? 'Y' : 'N',
    kit_amount:           parseFloat(kitAmount) || 0,
    ukit_amount:          0,
    udam_amount:          parseFloat(highModAmt) || 0,
    two_part_amount:      parseFloat(highModNC20) || 0,
    udam_1_5_amount:      parseFloat(highModNC15) || 0,
    two_kit_amount:       parseFloat(twoKitAmount) || 0,
    material_charge:      materialCharge === 'Yes' ? 'Y' : 'N',
    material_amount:      parseFloat(materialAmount) || 0,
    labor_charge:         laborCharge === 'Yes' ? 'Y' : 'N',
    repair_charge:        repairCharge === 'Yes' ? 'Y' : 'N',
    init_repair_amount:   parseFloat(initRepairAmt) || 0,
    addtnl_repair_amount: parseFloat(addtnlRepairAmt) || 0,
    edi_flag:             ediEnabled ? 'Y' : 'N',
    edi_format:           ediFormat,
    details: expandToNagsPrefixRows(detailRows),
  });

  const applyLocalUpdate = (savedCode: string) => {
    const payload = buildPayload();
    const saved: Discount = {
      discount_code: savedCode,
      ...payload,
      details: expandToNagsPrefixRows(detailRows).map(row => ({ discount_code: savedCode, ...row })),
    };
    setDiscounts(prev =>
      prev.some(d => d.discount_code === savedCode)
        ? prev.map(d => d.discount_code === savedCode ? saved : d)
        : [...prev, saved]
    );
    setCode(''); setName(''); setEdiEnabled(false); setEdiFormat('');
    setKitCharge('Yes'); setHighModAmt('0.00'); setKitAmount('0.00');
    setHighModNC15('0.00'); setTwoKitAmount('0.00'); setHighModNC20('0.00');
    setMaterialCharge('No'); setMaterialAmount('0.00');
    setLaborCharge('Yes'); setRepairCharge('Yes');
    setInitRepairAmt('0.00'); setAddtnlRepairAmt('0.00'); setBaseLaborAmt('0.00');
    setSubmitted(false); setSaveError('');
    setDetailRows([]);
    setSelectedCode(null);
    setTimeout(() => discountListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleSave = () => {
    setSubmitted(true);
    setSaveError('');
    if (!code.trim() || !name.trim()) {
      setSaveError('Discount Code and Name are required.');
      bodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const trimmedCode = code.trim().toUpperCase();
    // Use PUT only if the code currently in the form still matches an existing discount —
    // if the user changed the code away from a loaded discount, this is a new entry to create.
    const codeToUpdate = discounts.some(d => d.discount_code === trimmedCode) ? trimmedCode : null;

    const onSaveFailed = (err: Error) => {
      setSaveError(err.message ?? 'Save failed.');
      bodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (codeToUpdate) {
      api.updateDiscount(codeToUpdate, buildPayload())
        .then(() => applyLocalUpdate(codeToUpdate))
        .catch(onSaveFailed);
    } else {
      api.createDiscount({ discount_code: trimmedCode, ...buildPayload() })
        .then(({ discount_code: newCode }) => applyLocalUpdate(newCode))
        .catch(onSaveFailed);
    }
  };

  // Current discounts list from MySQL (gl2015m1)
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [nagsParts, setNagsParts] = useState<NagsPrefixPart[]>([]);

  useEffect(() => {
    api.getDiscounts().then(data => setDiscounts(data)).catch(() => {});
    api.getDiscountParts().then(setNagsParts).catch(() => {});
  }, []);

  const n = (v: unknown) => parseFloat(String(v) || '0') || 0;

  const loadDiscount = (d: Discount) => {
    setSelectedCode(d.discount_code);
    setCode(d.discount_code);
    setName(d.discount_name);
    setEdiEnabled(d.edi_flag === 'Y');
    setEdiFormat(d.edi_format || '');
    setKitCharge(d.kit_charge === 'Y' ? 'Yes' : 'No');
    setKitAmount(n(d.kit_amount).toFixed(2));
    setHighModAmt(n(d.udam_amount).toFixed(2));
    setHighModNC15(n(d.udam_1_5_amount).toFixed(2));
    setTwoKitAmount(n(d.two_kit_amount).toFixed(2));
    setHighModNC20(n(d.two_part_amount).toFixed(2));
    setMaterialCharge(d.material_charge === 'Y' ? 'Yes' : 'No');
    setMaterialAmount(n(d.material_amount).toFixed(2));
    setLaborCharge(d.labor_charge === 'Y' ? 'Yes' : 'No');
    setRepairCharge(d.repair_charge === 'Y' ? 'Yes' : 'No');
    setInitRepairAmt(n(d.init_repair_amount).toFixed(2));
    setAddtnlRepairAmt(n(d.addtnl_repair_amount).toFixed(2));
    setDetailRows(d.details.map((det, i) => ({
      id:         Date.now() + i,
      nagsPrefix: det.nags_prefix || '',
      partType:   det.part_type,
      flatHourly: det.flat_or_hourly,
      discount:   n(det.discount_amount).toFixed(2),
      labor:      n(det.labor_rate).toFixed(2),
      minHours:   n(det.min_hours).toFixed(2),
      maxHours:   n(det.max_hours).toFixed(2),
    })));
    setSaveError('');
    setSubmitted(false);
  };

  const loadDiscountDetails = (d: Discount) => {
    loadDiscount(d);
    return api.getDiscountDetails(d.discount_code).then(details => {
      const rows = details.map((det, i) => ({
        id:         Date.now() + i,
        nagsPrefix: det.nags_prefix || '',
        partType:   det.part_type,
        flatHourly: det.flat_or_hourly,
        discount:   n(det.discount_amount).toFixed(2),
        labor:      n(det.labor_rate).toFixed(2),
        minHours:   n(det.min_hours).toFixed(2),
        maxHours:   n(det.max_hours).toFixed(2),
      }));
      setDetailRows(rows);
      return rows;
    }).catch(() => {
      setDetailRows([]);
      return [] as DetailRow[];
    });
  };

  // Expand a discount's per-category rates into one row per real NAGS prefix
  // (from gl2015m1.parts), mirroring the legacy Discount Maintenance grid.
  // While this discount is the one loaded in the form, read the live (possibly
  // unsaved) detailRows so edits made in the Discount Detail popup show up here
  // immediately instead of only after clicking the main Save button.
  type RateSource = { part_type: string; flat_or_hourly: string; discount_amount: unknown; labor_rate: unknown; min_hours: unknown; max_hours: unknown };
  const getExpandedRows = (d: Discount) => {
    const source: RateSource[] = selectedCode === d.discount_code
      ? detailRows.map(r => ({ part_type: r.partType, flat_or_hourly: r.flatHourly, discount_amount: r.discount, labor_rate: r.labor, min_hours: r.minHours, max_hours: r.maxHours }))
      : d.details.map(det => ({ part_type: det.part_type, flat_or_hourly: det.flat_or_hourly, discount_amount: det.discount_amount, labor_rate: det.labor_rate, min_hours: det.min_hours, max_hours: det.max_hours }));
    const byType: Record<string, RateSource | undefined> = {};
    for (const det of source) byType[det.part_type] = det;
    return nagsParts.map(p => {
      const det = byType[p.part_type];
      return {
        nagsPrefix: p.nags_prefix,
        partType:   p.part_type,
        flatHourly: det?.flat_or_hourly ?? 'Flat',
        discount:   n(det?.discount_amount).toFixed(2),
        labor:      n(det?.labor_rate).toFixed(2),
        minHours:   n(det?.min_hours).toFixed(2),
        maxHours:   n(det?.max_hours).toFixed(2),
      };
    });
  };

  const removeDiscount = (discountCode: string) => {
    api.deleteDiscount(discountCode).then(() => {
      setDiscounts(prev => prev.filter(d => d.discount_code !== discountCode));
      if (selectedCode === discountCode) setSelectedCode(null);
    }).catch(() => {});
  };

  return (
    <>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}><Tag size={20} color="#fff" /></div>
            <div>
              <div style={styles.headerTitle}>Discount Management</div>
              <div style={styles.headerSub}>Configure discount codes and rates</div>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}><X size={18} color="#fff" /></button>
        </div>

        <div ref={bodyRef} style={styles.body}>

          {/* Validation banner — sits at the top so it's visible on scroll-to-top */}
          {saveError && (
            <div style={styles.errorNote}>{saveError}</div>
          )}

          {/* Discount Details */}
          <Section title="Discount Details">
            <div style={styles.row2}>
              <Field label="Discount Code">
                <TextInput value={code} onChange={v => { setCode(v); if (v.trim()) setSaveError(''); }} placeholder="e.g., BOGO125" error={submitted && !code.trim()} />
                {submitted && !code.trim() && <span style={styles.fieldError}>Required</span>}
              </Field>
              <Field label="Name">
                <TextInput value={name} onChange={v => { setName(v); if (v.trim()) setSaveError(''); }} placeholder="e.g., SPRING" error={submitted && !name.trim()} />
                {submitted && !name.trim() && <span style={styles.fieldError}>Required</span>}
              </Field>
            </div>
            <div style={styles.row2}>
              <Field label="">
                <label style={styles.checkboxLabel}>
                  <input type="checkbox" checked={ediEnabled} onChange={e => setEdiEnabled(e.target.checked)} style={styles.checkbox} />
                  <span style={styles.checkboxText}>Turn on EDI?</span>
                </label>
              </Field>
              <Field label="EDI Format">
                <SelectInput value={ediFormat} onChange={setEdiFormat} options={['', 'Lynx - State Farm', 'Lynx - Other Insurance Company', 'Safelite']} />
              </Field>
            </div>
          </Section>

          {/* KIT */}
          <Section title="KIT">
            <div style={styles.row2}>
              <Field label="Kit Charge?"><SelectInput value={kitCharge} onChange={setKitCharge} options={['Yes', 'No']} /></Field>
              <Field label="High Mod Amount"><MoneyInput value={highModAmt} onChange={setHighModAmt} /></Field>
            </div>
            <div style={styles.row2}>
              <Field label="Kit Amount"><MoneyInput value={kitAmount} onChange={setKitAmount} /></Field>
              <Field label="High Mod/Non-Conduct 1.5"><MoneyInput value={highModNC15} onChange={setHighModNC15} /></Field>
            </div>
            <div style={styles.row2}>
              <Field label="2 Kit Amount"><MoneyInput value={twoKitAmount} onChange={setTwoKitAmount} /></Field>
              <Field label="High Mod/Non-Conduct 2.0"><MoneyInput value={highModNC20} onChange={setHighModNC20} /></Field>
            </div>
          </Section>

          {/* MATERIAL */}
          <Section title="MATERIAL">
            <div style={styles.row2}>
              <Field label="Material Charge?"><SelectInput value={materialCharge} onChange={setMaterialCharge} options={['No', 'Yes']} /></Field>
              <Field label="Material Amount"><MoneyInput value={materialAmount} onChange={setMaterialAmount} /></Field>
            </div>
          </Section>

          {/* LABOR */}
          <Section title="LABOR">
            <div style={styles.row2}>
              <Field label="Labor Charge?"><SelectInput value={laborCharge} onChange={setLaborCharge} options={['Yes', 'No']} /></Field>
              <Field label="Repair Charge?"><SelectInput value={repairCharge} onChange={setRepairCharge} options={['Yes', 'No']} /></Field>
            </div>
            <div style={styles.row3}>
              <Field label="Init Repair Amount"><MoneyInput value={initRepairAmt} onChange={setInitRepairAmt} /></Field>
              <Field label="Addtnl Repair Amount"><MoneyInput value={addtnlRepairAmt} onChange={setAddtnlRepairAmt} /></Field>
              <Field label="Base Labor Amount"><MoneyInput value={baseLaborAmt} onChange={setBaseLaborAmt} /></Field>
            </div>
          </Section>

          {/* Adds the discount straight to Current Discounts — per-glass-type rates can be
              fine-tuned afterward via double-click on the card, same as any other entry. */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button style={styles.btnEditDetail} onClick={handleSave}>
              <Plus size={13} color="#fff" /> Insert
            </button>
          </div>

          <div style={styles.divider} />

          {/* Current Discounts */}
          <div ref={discountListRef} style={styles.sectionBlock}>
            <div style={styles.discountHeader}>
              <span style={styles.sectionTitle}>Current Discounts</span>
            </div>
            <div style={styles.discountList}>
              {discounts.length === 0 && <div style={styles.emptyRow}>No discounts yet</div>}
              {discounts.map(d => {
                const isExpanded = expandedCode === d.discount_code;
                return (
                <React.Fragment key={d.discount_code}>
                  <div
                    style={{ ...styles.discountCard, ...(selectedCode === d.discount_code ? styles.discountCardSelected : {}) }}
                    onClick={() => {
                      setSelectedCode(d.discount_code);
                      loadDiscountDetails(d);
                    }}
                    onDoubleClick={() => {
                      loadDiscountDetails(d).then(rows => {
                        setModalInitial(getDetailInitials(rows));
                        setShowDetailModal(true);
                      });
                    }}
                    title="Click to load — double-click to edit detail"
                  >
                    <div style={styles.discountBadge}>{d.discount_code}</div>
                    <span style={styles.discountDesc}>{d.discount_name}</span>
                    <div style={styles.discountRight}>
                      <button
                        style={styles.deleteBtn}
                        onClick={e => { e.stopPropagation(); setExpandedCode(isExpanded ? null : d.discount_code); }}
                        title={isExpanded ? 'Collapse' : 'Expand NAGS prefix detail'}
                      >
                        {isExpanded ? <ChevronUp size={14} color="#16a34a" /> : <ChevronDown size={14} color="#16a34a" />}
                      </button>
                      <button style={styles.deleteBtn} onClick={e => { e.stopPropagation(); removeDiscount(d.discount_code); }}>
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={styles.tableWrapper}>
                      <table style={styles.table}>
                        <thead>
                          <tr style={styles.tableHead}>
                            {['NAGS Prefix', 'Part Type', 'Flat/Hourly', 'Discount', 'Labor', 'Min Hours', 'Max Hours'].map(h => (
                              <th key={h} style={styles.th}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {getExpandedRows(d).map(row => (
                            <tr key={row.nagsPrefix} style={styles.tr}>
                              <td style={styles.td}>{row.nagsPrefix}</td>
                              <td style={styles.td}>{row.partType}</td>
                              <td style={styles.td}>{row.flatHourly}</td>
                              <td style={styles.td}>{row.discount}</td>
                              <td style={styles.td}>{row.labor}</td>
                              <td style={styles.td}>{row.minHours}</td>
                              <td style={styles.td}>{row.maxHours}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </React.Fragment>
              );})}
            </div>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button style={styles.saveBtn} onClick={handleSave}><Save size={15} style={{ marginRight: 7, verticalAlign: 'middle' }} />Save</button>
          </div>
          <div style={styles.note}>
            <span><strong>Note:</strong> Discount percentages are applied to the total price</span>
          </div>

        </div>
      </div>

      {showDetailModal && (
        <DiscountDetailModal
          initial={modalInitial}
          onOk={handleDetailOk}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </>
  );
};

/* ── Shared sub-components ── */
const Section: React.FC<{ title: string; children: React.ReactNode; action?: React.ReactNode }> = ({ title, children, action }) => (
  <div style={sectionStyles.wrapper}>
    <div style={sectionStyles.header}>
      <span style={sectionStyles.title}>{title}</span>
      <div style={sectionStyles.line} />
      {action}
    </div>
    <div>{children}</div>
  </div>
);
const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={fieldStyles.wrapper}>
    {label ? <label style={fieldStyles.label}>{label}</label> : null}
    {children}
  </div>
);
const TextInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string; error?: boolean }> = ({ value, onChange, placeholder, error }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...styles.textInput, ...(error ? { borderColor: '#ef4444' } : {}) }} />
);
const MoneyInput: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <div style={styles.moneyWrapper}>
    <span style={styles.moneySym}>$</span>
    <input type="text" inputMode="decimal" value={value} onChange={e => onChange(e.target.value)} style={styles.moneyInput} />
  </div>
);
const SelectInput: React.FC<{ value: string; onChange: (v: string) => void; options: string[] }> = ({ value, onChange, options }) => (
  <select value={value} onChange={e => onChange(e.target.value)} style={styles.select}>
    {options.map(o => <option key={o} value={o}>{o || '— Select —'}</option>)}
  </select>
);

/* ── Styles ── */
const styles: Record<string, React.CSSProperties> = {
  card:         { flex: 1, display: 'flex', flexDirection: 'column', margin: 24, borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', background: '#fff' },
  header:       { background: '#16a34a', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft:   { display: 'flex', alignItems: 'center', gap: 14 },
  headerIcon:   { width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle:  { fontSize: 18, fontWeight: 700, color: '#fff' },
  headerSub:    { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  closeBtn:     { background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' },
  body:         { padding: '24px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1, overflowY: 'auto' },
  row2:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 },
  row3:         { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 },
  textInput:    { width: '100%', padding: '9px 12px', border: '1.5px solid #16a34a', borderRadius: 7, fontSize: 13, color: '#111827', outline: 'none', boxSizing: 'border-box' as const },
  select:       { width: '100%', padding: '9px 12px', border: '1.5px solid #16a34a', borderRadius: 7, fontSize: 13, color: '#111827', background: '#fff', outline: 'none', cursor: 'pointer' },
  moneyWrapper: { display: 'flex', alignItems: 'center', border: '1.5px solid #16a34a', borderRadius: 7, overflow: 'hidden' },
  moneySym:     { padding: '0 10px', fontSize: 13, color: '#6b7280', background: '#f9fafb', borderRight: '1px solid #d1d5db', alignSelf: 'stretch', display: 'flex', alignItems: 'center' },
  moneyInput:   { flex: 1, padding: '9px 10px', border: 'none', fontSize: 13, color: '#111827', outline: 'none' },
  checkboxLabel:{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', paddingTop: 28 },
  checkbox:     { width: 16, height: 16, accentColor: '#16a34a', cursor: 'pointer' },
  checkboxText: { fontSize: 13, color: '#374151', fontWeight: 500 },
  divider:      { height: 1, background: '#f3f4f6', margin: '8px 0' },
  sectionBlock: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: '#111827' },
  discountHeader:{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  btnInsert:    { display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: '#16a34a', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' },
  btnEditDetail:{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px', background: '#16a34a', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#fff', cursor: 'pointer', whiteSpace: 'nowrap' as const },
  discountList: { display: 'flex', flexDirection: 'column', gap: 10 },
  discountCard:         { display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', border: '1.5px solid #bbf7d0', borderRadius: 10, background: '#fff', cursor: 'pointer' },
  discountCardSelected: { border: '1.5px solid #16a34a', background: '#f0fdf4', boxShadow: '0 0 0 2px rgba(22,163,74,0.15)' },
  discountBadge:{ background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: 12, padding: '5px 12px', borderRadius: 6 },
  discountDesc: { flex: 1, fontSize: 13, color: '#374151' },
  discountRight:{ display: 'flex', alignItems: 'center', gap: 10 },
  percentBadge: { background: '#f0fdf4', color: '#16a34a', fontWeight: 700, fontSize: 13, padding: '5px 14px', borderRadius: 6, border: '1px solid #bbf7d0' },
  deleteBtn:    { background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  actions:      { display: 'flex', gap: 12, marginTop: 12 },
  cancelBtn:    { flex: 1, padding: '12px 0', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#111827', cursor: 'pointer' },
  saveBtn:      { flex: 1, padding: '12px 0', background: '#16a34a', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer' },
  note:         { background: '#f0fdf4', borderRadius: 7, padding: '10px 14px', fontSize: 12, color: '#374151', marginTop: 4 },
  errorNote:    { background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 7, padding: '10px 14px', fontSize: 12, color: '#dc2626', marginBottom: 4 },
  fieldError:   { fontSize: 11, color: '#ef4444', marginTop: 3 },
  tableWrapper: { border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'auto' },
  table:        { width: '100%', borderCollapse: 'collapse' as const, minWidth: 700 },
  tableHead:    { background: '#16a34a' },
  th:           { padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#fff', textAlign: 'left' as const, whiteSpace: 'nowrap' as const },
  tr:           { borderBottom: '1px solid #f3f4f6' },
  td:           { padding: '8px 10px' },
  emptyRow:     { padding: '20px', textAlign: 'center' as const, fontSize: 13, color: '#9ca3af' },
  btnOutline:   { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 7, fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' },
};

const sectionStyles: Record<string, React.CSSProperties> = {
  wrapper: { marginBottom: 16 },
  header:  { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  title:   { fontSize: 12, fontWeight: 700, color: '#16a34a', letterSpacing: 0.8, textTransform: 'uppercase' as const, whiteSpace: 'nowrap' as const },
  line:    { flex: 1, height: 1, background: '#e5e7eb' },
};
const fieldStyles: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: 6 },
  label:   { fontSize: 12, fontWeight: 600, color: '#374151' },
};

/* ── Modal styles ── */
const ms: Record<string, React.CSSProperties> = {
  overlay:     { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400 },
  modal:       { background: '#fff', borderRadius: 12, width: 560, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', overflow: 'hidden' },
  header:      { background: '#16a34a', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft:  { display: 'flex', alignItems: 'center', gap: 12 },
  headerIcon:  { width: 36, height: 36, background: 'rgba(255,255,255,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 700, color: '#fff' },
  headerSub:   { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  closeBtn:    { background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' },
  body:        { padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 4 },
  section:     { marginBottom: 14 },
  sectionHeader:{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  sectionTitle: { fontSize: 12, fontWeight: 700, color: '#16a34a', letterSpacing: 0.8, textTransform: 'uppercase' as const, whiteSpace: 'nowrap' as const },
  sectionLine:  { flex: 1, height: 1, background: '#e5e7eb' },
  sectionBody:  { display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center' },
  fieldGroup:   { display: 'flex', flexDirection: 'column', gap: 6 },
  fieldLabel:   { fontSize: 12, fontWeight: 600, color: '#374151' },
  numInput:     { padding: '8px 10px', border: '1.5px solid #16a34a', borderRadius: 7, fontSize: 13, color: '#111827', outline: 'none', width: '100%', boxSizing: 'border-box' as const },
  radioGroup:   { display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 20 },
  radioLabel:   { display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' },
  radioText:    { fontSize: 13, color: '#374151' },
  moneyWrap:    { display: 'flex', alignItems: 'center', border: '1.5px solid #16a34a', borderRadius: 7, overflow: 'hidden' },
  moneySym:     { padding: '0 8px', fontSize: 13, color: '#6b7280', background: '#f9fafb', borderRight: '1px solid #d1d5db', alignSelf: 'stretch', display: 'flex', alignItems: 'center' },
  moneyIn:      { flex: 1, padding: '8px 8px', border: 'none', fontSize: 13, color: '#111827', outline: 'none' },
  footer:       { padding: '14px 24px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', gap: 10 },
  cancelBtn:    { padding: '9px 24px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 7, fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' },
  okBtn:        { padding: '9px 32px', background: '#16a34a', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' },
};

export default Discounts;
