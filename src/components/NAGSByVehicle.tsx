import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Car, X, Search, ChevronRight, Loader, Hash } from 'lucide-react';
import { api, type VehicleMake, type VehicleModel, type BodyStyle, type NagsGlassPart, type GlassPricing, type HardwareForGlass, type Discount } from '../api/client';
import { formatPrice } from '../test_data/db';

interface Props { onClose: () => void; onTurnIntoInvoice: () => void; }

const NAGSByVehicle: React.FC<Props> = ({ onClose, onTurnIntoInvoice }) => {
  /* ── Step state ── */
  const [year,          setYear]          = useState('');
  const [makeId,        setMakeId]        = useState('');
  const [modelId,       setModelId]       = useState('');
  const [bodyStyleId,   setBodyStyleId]   = useState('');
  const [searched,      setSearched]      = useState(false);
  const [selectedGlass, setSelectedGlass] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [selectedHw,    setSelectedHw]    = useState<number | null>(null);
  const [discountFilter,   setDiscountFilter]   = useState('');
  const [selectedDiscount, setSelectedDiscount] = useState<number | null>(null);
  const [showQuoteModal,   setShowQuoteModal]   = useState(false);

  /* ── VIN decode ── */
  const [vinInput,   setVinInput]   = useState('');
  const [vinDecoding, setVinDecoding] = useState(false);
  const [vinResult,  setVinResult]  = useState<{ year: string; make: string; model: string; bodyStyle: string | null } | null>(null);
  const [vinError,   setVinError]   = useState('');

  /* ── API data ── */
  const [years,       setYears]       = useState<string[]>([]);
  const [discounts,   setDiscounts]   = useState<Discount[]>([]);
  const [makes,       setMakes]       = useState<VehicleMake[]>([]);
  const [models,      setModels]      = useState<VehicleModel[]>([]);
  const [bodyStyles,  setBodyStyles]  = useState<BodyStyle[]>([]);
  const [glassParts,  setGlassParts]  = useState<NagsGlassPart[]>([]);
  const [glassColors, setGlassColors] = useState<GlassPricing[]>([]);
  const [hwParts,     setHwParts]     = useState<HardwareForGlass[]>([]);
  const [hwLoaded,    setHwLoaded]    = useState(false);

  /* ── Loading / error ── */
  const [loadingMakes,      setLoadingMakes]      = useState(false);
  const [loadingModels,     setLoadingModels]     = useState(false);
  const [loadingBodyStyles, setLoadingBodyStyles] = useState(false);
  const [loadingGlass,      setLoadingGlass]      = useState(false);
  const [loadingHw,         setLoadingHw]         = useState(false);
  const [error,             setError]             = useState('');

  /* ── Scroll refs ── */
  const bodyRef     = useRef<HTMLDivElement>(null);
  const glassRef    = useRef<HTMLDivElement>(null);
  const colorRef    = useRef<HTMLDivElement>(null);
  const hwRef       = useRef<HTMLDivElement>(null);
  const discountRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current || !bodyRef.current) return;
    const top = ref.current.offsetTop - bodyRef.current.offsetTop;
    bodyRef.current.scrollTo({ top, behavior: 'smooth' });
  };

  useEffect(() => { if (searched)               scrollTo(glassRef);    }, [searched]);
  useEffect(() => { if (selectedGlass !== null)  scrollTo(colorRef);   }, [selectedGlass]);
  useEffect(() => { if (selectedColor !== null)  scrollTo(hwRef);      }, [selectedColor]);
  useEffect(() => {
    if (selectedHw !== null) { scrollTo(discountRef); setSelectedDiscount(0); }
  }, [selectedHw]);
  // When hardware finishes loading with no results, advance to discount step
  useEffect(() => {
    if (hwLoaded && hwParts.length === 0 && selectedColor !== null) {
      scrollTo(discountRef);
      setSelectedDiscount(0);
    }
  }, [hwLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Load reference data on mount ── */
  useEffect(() => {
    api.getYears().then(data => {
      setYears(data);
      if (data.length) {
        const firstYear = data[0];
        setYear(firstYear);
        setLoadingMakes(true);
        api.getMakes(firstYear).then(setMakes).catch(() => {}).finally(() => setLoadingMakes(false));
      }
    }).catch(() => {});

    api.getDiscounts().then(setDiscounts).catch(() => {});
  }, []);

  /* ── VIN: cascade year→make→model→body-style from decoded result ── */
  const applyVinResult = useCallback(async (decoded: { year: string; make: string; model: string; bodyStyle: string | null }) => {
    setYear(''); setMakeId(''); setModelId(''); setBodyStyleId('');
    setMakes([]); setModels([]); setBodyStyles([]);
    setSearched(false); setGlassParts([]);
    setSelectedGlass(null); setSelectedColor(null);
    setSelectedHw(null); setSelectedDiscount(null);

    if (!decoded.year) return;
    setYear(decoded.year);

    setLoadingMakes(true);
    const makesData = await api.getMakes(decoded.year).catch(() => [] as VehicleMake[]);
    setMakes(makesData);
    setLoadingMakes(false);

    const matchedMake = makesData.find(m => m.name.toLowerCase() === decoded.make.toLowerCase());
    if (!matchedMake) return;
    setMakeId(String(matchedMake.id));

    setLoadingModels(true);
    const modelsData = await api.getModels(matchedMake.id, decoded.year).catch(() => [] as VehicleModel[]);
    setModels(modelsData);
    setLoadingModels(false);

    const decodedModel = decoded.model.toLowerCase();
    const matchedModel =
      modelsData.find(m => m.name.toLowerCase() === decodedModel) ??
      modelsData.find(m => m.name.toLowerCase().includes(decodedModel) || decodedModel.includes(m.name.toLowerCase()));
    if (!matchedModel) return;
    setModelId(String(matchedModel.id));

    setLoadingBodyStyles(true);
    const stylesData = await api.getBodyStylesByVehicle(decoded.year, matchedMake.id, matchedModel.id).catch(() => [] as BodyStyle[]);
    setBodyStyles(stylesData);
    setLoadingBodyStyles(false);

    if (stylesData.length === 0) {
      setSearched(true);
      setLoadingGlass(true);
      const parts = await api.getGlassByVehicle(decoded.year, matchedMake.id, matchedModel.id).catch(() => [] as NagsGlassPart[]);
      setGlassParts(parts);
      setLoadingGlass(false);
    } else if (decoded.bodyStyle) {
      const bs = decoded.bodyStyle.toLowerCase();
      const matchedStyle = stylesData.find(s =>
        s.description.toLowerCase().includes(bs) || bs.includes(s.description.toLowerCase())
      );
      if (matchedStyle) {
        setBodyStyleId(String(matchedStyle.id));
        setSearched(true);
        setLoadingGlass(true);
        const parts = await api.getGlassByVehicle(decoded.year, matchedMake.id, matchedModel.id, matchedStyle.id).catch(() => [] as NagsGlassPart[]);
        setGlassParts(parts);
        setLoadingGlass(false);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── VIN: call NHTSA public API ── */
  const decodeVin = useCallback(async (vin: string) => {
    setVinDecoding(true);
    setVinError('');
    setVinResult(null);
    try {
      const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const results: Array<{ Variable: string; Value: string | null }> = data.Results;
      const getValue = (name: string) => results.find(r => r.Variable === name)?.Value ?? null;

      const year      = getValue('Model Year');
      const make      = getValue('Make');
      const model     = getValue('Model');
      const bodyStyle = getValue('Body Class');

      if (!year || !make || !model) {
        setVinError('Could not decode VIN — verify the number and try again');
        return;
      }
      const decoded = { year, make, model, bodyStyle };
      setVinResult(decoded);
      await applyVinResult(decoded);
    } catch {
      setVinError('VIN decode failed — check network connection');
    } finally {
      setVinDecoding(false);
    }
  }, [applyVinResult]);

  /* ── VIN input handler ── */
  const handleVinChange = useCallback((v: string) => {
    const val = v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 17);
    setVinInput(val);
    setVinError('');
    if (val.length === 17) decodeVin(val);
    else setVinResult(null);
  }, [decodeVin]);

  /* ── When year changes: reload makes, reset downstream ── */
  const handleYearChange = useCallback((y: string) => {
    setYear(y);
    setMakeId(''); setModelId(''); setBodyStyleId('');
    setMakes([]); setModels([]); setBodyStyles([]);
    setSearched(false); setGlassParts([]);
    setSelectedGlass(null); setSelectedColor(null);
    setSelectedHw(null); setSelectedDiscount(null);
    if (!y) return;
    setLoadingMakes(true);
    api.getMakes(y).then(setMakes).catch(() => setError('Failed to load makes')).finally(() => setLoadingMakes(false));
  }, []);

  /* ── When make changes: reload models filtered by year+make, reset downstream ── */
  const handleMakeChange = useCallback((id: string) => {
    setMakeId(id); setModelId(''); setBodyStyleId('');
    setModels([]); setBodyStyles([]);
    setSearched(false); setGlassParts([]);
    setSelectedGlass(null); setSelectedColor(null);
    setSelectedHw(null); setSelectedDiscount(null);
    if (!id) return;
    setLoadingModels(true);
    api.getModels(parseInt(id), year)
      .then(setModels)
      .catch(() => setError('Failed to load models'))
      .finally(() => setLoadingModels(false));
  }, [year]);

  /* ── When model changes: reload body styles, auto-search if no body styles ── */
  const handleModelChange = useCallback((id: string) => {
    setModelId(id); setBodyStyleId('');
    setBodyStyles([]);
    setSearched(false); setGlassParts([]);
    setSelectedGlass(null); setSelectedColor(null);
    setSelectedHw(null); setSelectedDiscount(null);
    if (!id || !makeId) return;
    setLoadingBodyStyles(true);
    api.getBodyStylesByVehicle(year, parseInt(makeId), parseInt(id))
      .then(styles => {
        setBodyStyles(styles);
        if (styles.length === 0) {
          // No body styles for this vehicle — search glass immediately
          setSearched(true);
          setLoadingGlass(true);
          api.getGlassByVehicle(year, parseInt(makeId), parseInt(id))
            .then(setGlassParts)
            .catch(() => setError('Failed to load glass parts'))
            .finally(() => setLoadingGlass(false));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingBodyStyles(false));
  }, [year, makeId]);

  /* ── When body style changes: auto-search glass for the full vehicle spec ── */
  const handleBodyStyleChange = useCallback((bsId: string) => {
    setBodyStyleId(bsId);
    setSearched(false); setGlassParts([]);
    setSelectedGlass(null); setSelectedColor(null);
    setSelectedHw(null); setSelectedDiscount(null);
    if (!bsId || !makeId) return;
    setSearched(true);
    setLoadingGlass(true);
    api.getGlassByVehicle(
      year, parseInt(makeId),
      modelId ? parseInt(modelId) : undefined,
      parseInt(bsId)
    )
      .then(setGlassParts)
      .catch(() => setError('Failed to load glass parts'))
      .finally(() => setLoadingGlass(false));
  }, [year, makeId, modelId]);

  /* ── Manual search (Search Parts button) ── */
  const handleSearch = useCallback(async () => {
    if (!makeId) return;
    setSearched(true);
    setSelectedGlass(null); setSelectedColor(null);
    setSelectedHw(null); setSelectedDiscount(null);
    setError('');
    setLoadingGlass(true);
    try {
      const parts = await api.getGlassByVehicle(
        year, parseInt(makeId),
        modelId     ? parseInt(modelId)     : undefined,
        bodyStyleId ? parseInt(bodyStyleId) : undefined,
      );
      setGlassParts(parts);
    } catch {
      setError('Failed to load glass parts — check server connection');
      setGlassParts([]);
    } finally {
      setLoadingGlass(false);
    }
  }, [year, makeId, modelId, bodyStyleId]);

  /* ── Load color/price when glass selected ── */
  useEffect(() => {
    if (selectedGlass === null) { setGlassColors([]); return; }
    api.getGlassPricing(glassParts[selectedGlass].part_no)
      .then(setGlassColors)
      .catch(() => setGlassColors([]));
  }, [selectedGlass]);   // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Load hardware when color selected ── */
  useEffect(() => {
    if (selectedColor === null || !makeId || selectedGlass === null) return;
    setLoadingHw(true);
    setHwLoaded(false);
    api.getHardwareForGlass(
      year,
      parseInt(makeId),
      modelId     ? parseInt(modelId)     : undefined,
      bodyStyleId ? parseInt(bodyStyleId) : undefined,
      glassParts[selectedGlass].part_no,
    )
      .then(setHwParts)
      .catch(() => setHwParts([]))
      .finally(() => { setLoadingHw(false); setHwLoaded(true); });
  }, [selectedColor]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Derived ── */
  const selectedMake  = makes.find(m => String(m.id) === makeId);
  const selectedModel = models.find(m => String(m.id) === modelId);


  const filteredDiscounts = discounts.filter((d: Discount) =>
    !discountFilter ||
    d.discount_code.toLowerCase().includes(discountFilter.toLowerCase()) ||
    d.discount_name.toLowerCase().includes(discountFilter.toLowerCase())
  );

  const hwStepComplete = selectedHw !== null || (hwLoaded && hwParts.length === 0 && selectedColor !== null);

  const step =
    hwStepComplete         ? 5 :
    selectedColor !== null ? 4 :
    selectedGlass !== null ? 3 :
    searched               ? 2 : 1;

  const colHasSide     = glassParts.some(p => !!p.side_cd);
  const colHasFeatures = glassParts.some(p => p.has_solar || p.is_heated || p.is_hud || p.has_antenna || p.is_encapsulated || p.is_modular);
  const colHasHoles    = glassParts.some(p => (p.num_holes ?? 0) > 0);
  const colHasVinRange = glassParts.some(p => !!p.from_range || !!p.to_range);
  const colHasNotes    = glassParts.some(p => !!p.note);
  const glassColCount  = 2 + (colHasSide ? 1 : 0) + (colHasFeatures ? 1 : 0) + (colHasHoles ? 1 : 0) + (colHasVinRange ? 1 : 0) + (colHasNotes ? 1 : 0);

  return (
    <div style={styles.card}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}><Car size={20} color="#fff" /></div>
          <div>
            <div style={styles.headerTitle}>NAGS Part Search By Vehicle</div>
            <div style={styles.headerSub}>Complete each step to build your quote</div>
          </div>
        </div>
        <div style={styles.headerRight}>
          <StepPills current={step} />
          <button style={styles.closeBtn} onClick={onClose}><X size={18} color="#fff" /></button>
        </div>
      </div>

      {error && <div style={styles.errorBanner}>{error}</div>}

      {/* ── Scrollable body ── */}
      <div ref={bodyRef} style={styles.body}>

        {/* ═══ STEP 1: Vehicle Selection ═══ */}
        <StepSection step={1} label="Vehicle Selection" active={step >= 1}>
          {/* VIN decode */}
          <div style={{ marginBottom: 16 }}>
            <Field label="Decode by VIN (optional)">
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Hash size={14} color="#9ca3af" style={{ position: 'absolute', left: 10, pointerEvents: 'none' }} />
                <input
                  type="text"
                  value={vinInput}
                  onChange={e => handleVinChange(e.target.value)}
                  placeholder="Enter 17-character VIN to auto-fill…"
                  maxLength={17}
                  style={{ ...styles.select, paddingLeft: 30, fontFamily: 'monospace', letterSpacing: 1 }}
                />
                {vinDecoding && (
                  <span style={{ position: 'absolute', right: 10 }}>
                    <Loader size={14} color="#16a34a" style={{ animation: 'spin 1s linear infinite' }} />
                  </span>
                )}
              </div>
            </Field>
            {vinResult && !vinDecoding && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 14px' }}>
                <Car size={14} color="#16a34a" />
                <span style={{ fontSize: 13, color: '#15803d', fontWeight: 600 }}>
                  {vinResult.year} {vinResult.make} {vinResult.model}
                  {vinResult.bodyStyle ? ` · ${vinResult.bodyStyle}` : ''}
                </span>
              </div>
            )}
            {vinError && (
              <div style={{ marginTop: 6, fontSize: 12, color: '#dc2626' }}>{vinError}</div>
            )}
          </div>
          <div style={styles.searchGrid}>
            <Field label="Year">
              <Select value={year} onChange={handleYearChange} options={years} />
            </Field>
            <Field label="Make">
              {loadingMakes
                ? <Spinner />
                : <Select
                    value={makeId}
                    onChange={handleMakeChange}
                    options={makes.map(m => ({ value: String(m.id), label: m.name }))}
                    placeholder="Select make…"
                  />
              }
            </Field>
            <Field label="Model">
              {loadingModels
                ? <Spinner />
                : <Select
                    value={modelId}
                    onChange={handleModelChange}
                    options={models.map(m => ({ value: String(m.id), label: m.name }))}
                    placeholder={makeId ? 'Select model…' : '— select make first —'}
                    disabled={!makeId}
                  />
              }
            </Field>
            <Field label="Body Style">
              {loadingBodyStyles
                ? <Spinner />
                : <Select
                    value={bodyStyleId}
                    onChange={handleBodyStyleChange}
                    options={bodyStyles.map(b => ({ value: String(b.id), label: b.description }))}
                    placeholder={modelId ? 'Select body style…' : '— select model first —'}
                    disabled={!modelId}
                  />
              }
            </Field>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
            <button
              style={{ ...styles.searchBtn, opacity: makeId ? 1 : 0.45 }}
              onClick={handleSearch}
              disabled={!makeId || loadingGlass}
            >
              {loadingGlass
                ? <Loader size={15} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
                : <Search size={15} color="#fff" />
              }
              Search Parts
            </button>
          </div>
          {searched && (
            <div style={styles.summaryPill}>
              <span style={styles.summaryText}>
                {year} · {selectedMake?.name}{selectedModel ? ` · ${selectedModel.name}` : ''}
              </span>
              <button style={styles.changeBtn} onClick={() => {
                setSearched(false); setSelectedGlass(null);
                setSelectedColor(null); setSelectedHw(null);
              }}>Change</button>
            </div>
          )}
        </StepSection>

        {/* ═══ STEP 2: Glass Selection ═══ */}
        {searched && (
          <StepSection step={2} label="Select Glass Part" active={step >= 2} innerRef={glassRef}>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHead}>
                    <Th>Part #</Th>
                    <Th>Description</Th>
                    {colHasSide     && <Th>Side</Th>}
                    {colHasFeatures && <Th>Features</Th>}
                    {colHasHoles    && <Th>Holes</Th>}
                    {colHasVinRange && <Th>VIN Range</Th>}
                    {colHasNotes    && <Th>Notes</Th>}
                  </tr>
                </thead>
                <tbody>
                  {loadingGlass ? (
                    <tr><td colSpan={glassColCount} style={styles.empty}><Spinner /> Loading parts…</td></tr>
                  ) : glassParts.length === 0 ? (
                    <tr><td colSpan={glassColCount} style={styles.empty}>No parts found for this vehicle</td></tr>
                  ) : (() => {
                    let lastOpening = '';
                    return glassParts.map((r, i) => {
                      const showHeader = r.opening_type && r.opening_type !== lastOpening;
                      if (showHeader) lastOpening = r.opening_type!;
                      return (
                        <React.Fragment key={r.part_no}>
                          {showHeader && (
                            <tr style={styles.groupHeader}>
                              <td colSpan={glassColCount} style={styles.groupHeaderTd}>{r.opening_type}</td>
                            </tr>
                          )}
                          <tr
                            style={{ ...styles.tr, background: selectedGlass === i ? '#dcfce7' : '#fff', cursor: 'pointer' }}
                            onClick={() => { setSelectedGlass(i); setSelectedColor(null); setSelectedHw(null); }}
                          >
                            <Td><span style={styles.partNo}>{r.part_no}</span></Td>
                            <Td>{r.description}</Td>
                            {colHasSide     && <Td>{r.side_cd || ''}</Td>}
                            {colHasFeatures && (
                              <Td>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                  {r.has_solar       && <FlagBadge label="SLR" color="#ca8a04" bg="#fefce8" />}
                                  {r.is_heated       && <FlagBadge label="HTD" color="#dc2626" bg="#fef2f2" />}
                                  {r.is_hud          && <FlagBadge label="HUD" color="#2563eb" bg="#eff6ff" />}
                                  {r.has_antenna     && <FlagBadge label="ANT" color="#7c3aed" bg="#f5f3ff" />}
                                  {r.is_encapsulated && <FlagBadge label="ENC" color="#0891b2" bg="#ecfeff" />}
                                  {r.is_modular      && <FlagBadge label="SLD" color="#ea580c" bg="#fff7ed" />}
                                </div>
                              </Td>
                            )}
                            {colHasHoles    && <Td>{r.num_holes || ''}</Td>}
                            {colHasVinRange && (
                              <Td>
                                {r.from_range || r.to_range
                                  ? <span style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>{[r.from_range, r.to_range].filter(Boolean).join(' – ')}</span>
                                  : ''}
                              </Td>
                            )}
                            {colHasNotes && <Td><span style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>{r.note || ''}</span></Td>}
                          </tr>
                        </React.Fragment>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
            {selectedGlass !== null && (
              <div style={styles.summaryPill}>
                <span style={styles.summaryText}>
                  Selected: <strong>{glassParts[selectedGlass].part_no}</strong> — {glassParts[selectedGlass].description}
                </span>
              </div>
            )}
          </StepSection>
        )}

        {/* ═══ STEP 3: Color / Price ═══ */}
        {selectedGlass !== null && (
          <StepSection step={3} label="Select Color" active={step >= 3} innerRef={colorRef}>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHead}>
                    <Th>Color</Th><Th>Hours</Th><Th>Price</Th><Th>Code</Th>
                  </tr>
                </thead>
                <tbody>
                  {glassColors.length === 0 ? (
                    <tr><td colSpan={4} style={styles.empty}><Spinner /> Loading colors…</td></tr>
                  ) : glassColors.map((r, i) => (
                    <tr
                      key={r.color_code}
                      style={{ ...styles.tr, background: selectedColor === i ? '#dcfce7' : '#fff', cursor: 'pointer' }}
                      onClick={() => { setSelectedColor(i); setSelectedHw(null); }}
                    >
                      <Td>{r.color}</Td>
                      <Td>{r.labor_hours.toFixed(1)} hrs</Td>
                      <Td><span style={styles.price}>{formatPrice(r.price)}</span></Td>
                      <Td><span style={styles.codeTag}>{r.display_code}</span></Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selectedColor !== null && (
              <div style={styles.summaryPill}>
                <span style={styles.summaryText}>
                  Color: <strong>{glassColors[selectedColor].color}</strong> · {formatPrice(glassColors[selectedColor].price)} · {glassColors[selectedColor].labor_hours.toFixed(1)} hrs
                </span>
              </div>
            )}
          </StepSection>
        )}

        {/* ═══ STEP 4: Hardware ═══ */}
        {selectedColor !== null && (
          <StepSection step={4} label="Select Hardware" active={step >= 4} innerRef={hwRef}>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHead}>
                    <Th>Part #</Th><Th>Color</Th><Th>Type</Th>
                  </tr>
                </thead>
                <tbody>
                  {loadingHw ? (
                    <tr><td colSpan={3} style={styles.empty}><Spinner /> Loading hardware…</td></tr>
                  ) : hwParts.length === 0 ? (
                    <tr><td colSpan={3} style={styles.empty}>There is no hardware for this glass</td></tr>
                  ) : hwParts.map((r, i) => (
                    <tr
                      key={r.part_no}
                      style={{ ...styles.tr, background: selectedHw === i ? '#dcfce7' : '#fff', cursor: 'pointer' }}
                      onClick={() => setSelectedHw(i)}
                    >
                      <Td><span style={styles.partNo}>{r.part_no}</span></Td>
                      <Td>{r.color}</Td>
                      <Td>{r.type}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </StepSection>
        )}

        {/* ═══ STEP 5: Discount + Actions ═══ */}
        {hwStepComplete && (
          <StepSection step={5} label="Discount & Actions" active={step >= 5} innerRef={discountRef}>
            <div style={styles.discountRow}>
              <div style={styles.discountBox}>
                <select
                  value={discountFilter}
                  onChange={e => { setDiscountFilter(e.target.value); setSelectedDiscount(null); }}
                  style={styles.discountSelect}
                >
                  <option value="">— All Discounts —</option>
                  {discounts.map((d: Discount) => (
                    <option key={d.discount_code} value={d.discount_code}>{d.discount_code}</option>
                  ))}
                </select>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                  <table style={{ ...styles.table, minWidth: 0 }}>
                    <thead>
                      <tr style={styles.discountHead}>
                        <th style={styles.discountTh}>Code</th>
                        <th style={styles.discountTh}>Discount Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDiscounts.length === 0 ? (
                        <tr><td colSpan={2} style={styles.empty}>No discounts found</td></tr>
                      ) : filteredDiscounts.map((d: Discount, i: number) => (
                        <tr
                          key={d.discount_code}
                          style={{ ...styles.tr, background: selectedDiscount === i ? '#dcfce7' : '#fff', cursor: 'pointer' }}
                          onClick={() => setSelectedDiscount(i)}
                        >
                          <td style={styles.discountTd}><span style={styles.partNo}>{d.discount_code}</span></td>
                          <td style={styles.discountTd}>{d.discount_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div style={styles.actionBtns}>
                <button style={styles.btnRepair}>Repair</button>
                <button
                  style={{ ...styles.btnQuote, opacity: selectedDiscount !== null ? 1 : 0.45 }}
                  disabled={selectedDiscount === null}
                  onClick={() => setShowQuoteModal(true)}
                >
                  Quote
                </button>
              </div>
            </div>
          </StepSection>
        )}

        <div style={{ height: 32 }} />
      </div>

      {/* ── Quote Modal ── */}
      {showQuoteModal &&
       selectedGlass    !== null &&
       selectedColor    !== null &&
       hwStepComplete   &&
       selectedDiscount !== null && (
        <QuoteModal
          year={year}
          make={selectedMake?.name ?? ''}
          model={selectedModel?.name ?? ''}
          glass={glassParts[selectedGlass]}
          glassColorPrice={glassColors[selectedColor]?.price ?? glassParts[selectedGlass].list_price}
          hardware={selectedHw !== null ? hwParts[selectedHw] : undefined}
          discount={filteredDiscounts[selectedDiscount]}
          onClose={() => setShowQuoteModal(false)}
          onTurnIntoInvoice={onTurnIntoInvoice}
        />
      )}
    </div>
  );
};

/* ── Sub-components ── */

const StepSection: React.FC<{
  step: number; label: string; active: boolean;
  children: React.ReactNode; innerRef?: React.RefObject<HTMLDivElement>;
}> = ({ step, label, children, innerRef }) => (
  <div ref={innerRef} style={ss.wrapper}>
    <div style={ss.header}>
      <div style={ss.badge}>{step}</div>
      <span style={ss.label}>{label}</span>
      <div style={ss.line} />
    </div>
    <div style={ss.body}>{children}</div>
  </div>
);

const StepPills: React.FC<{ current: number }> = ({ current }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
    {[1, 2, 3, 4, 5].map((s, i) => (
      <React.Fragment key={s}>
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: s <= current ? '#fff' : 'rgba(255,255,255,0.25)',
          color: s <= current ? '#16a34a' : 'rgba(255,255,255,0.6)',
          fontSize: 11, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{s}</div>
        {i < 4 && <ChevronRight size={12} color={s < current ? '#fff' : 'rgba(255,255,255,0.35)'} />}
      </React.Fragment>
    ))}
  </div>
);

const Spinner: React.FC = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
    <Loader size={13} color="#16a34a" style={{ animation: 'spin 1s linear infinite' }} />
  </span>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{label}</label>
    {children}
  </div>
);

const Select: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: string[] | Array<{ value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
}> = ({ value, onChange, options, placeholder, disabled }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    disabled={disabled}
    style={{ ...styles.select, opacity: disabled ? 0.5 : 1 }}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(o =>
      typeof o === 'string'
        ? <option key={o} value={o}>{o}</option>
        : <option key={o.value} value={o.value}>{o.label}</option>
    )}
  </select>
);

const Th: React.FC<{ children: React.ReactNode }> = ({ children }) => <th style={styles.th}>{children}</th>;
const Td: React.FC<{ children: React.ReactNode }> = ({ children }) => <td style={styles.td}>{children}</td>;

const FlagBadge: React.FC<{ label: string; color: string; bg: string }> = ({ label, color, bg }) => (
  <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'monospace', color, background: bg, border: `1px solid ${color}33`, padding: '1px 5px', borderRadius: 4 }}>
    {label}
  </span>
);

/* ── Quote Modal ── */
const QuoteModal: React.FC<{
  year: string; make: string; model: string;
  glass: NagsGlassPart;
  glassColorPrice: number;
  hardware?: HardwareForGlass;
  discount: Discount;
  onClose: () => void;
  onTurnIntoInvoice: () => void;
}> = ({ year, make, model, glass, glassColorPrice, hardware, discount, onClose, onTurnIntoInvoice }) => {
  const [quotedCustomer, setQuotedCustomer] = useState('');
  const [taxRate,        setTaxRate]        = useState(6);
  const [taxInput,       setTaxInput]       = useState('6');
  const [prevTaxRate,    setPrevTaxRate]    = useState(6);

  const glassListPrice = glassColorPrice;
  const detail = discount.details.find(d => glass.part_no.startsWith(d.nags_prefix)) ?? discount.details[0];
  // Legacy DB stores display/pricing values in the _2 columns (per legacy SQL)
  const discountPct  = detail?.discount_amount2 ?? detail?.discount_amount ?? 0;
  const laborRate    = detail?.labor_rate2       ?? detail?.labor_rate       ?? 0;
  const glassSellPrice = detail ? glassListPrice * (1 - discountPct / 100) : glassListPrice;
  const labor = detail
    ? detail.flat_or_hourly === 'Hourly'
      ? glass.labor_hours * laborRate
      : laborRate
    : 0;
  const laborLabel = detail
    ? detail.flat_or_hourly === 'Hourly'
      ? `LABOR (${glass.labor_hours} hrs @ $${laborRate}/hr)`
      : 'LABOR (flat rate)'
    : 'LABOR';
  const hwPrice  = 0;
  const subTotal = glassSellPrice + hwPrice + labor;
  const tax      = subTotal * (taxRate / 100);
  const total    = subTotal + tax;

  const handleTaxInput = (val: string) => {
    setTaxInput(val);
    const n = parseFloat(val);
    if (!isNaN(n)) { setTaxRate(n); setPrevTaxRate(n); }
  };
  const handleZeroTax = (checked: boolean) => {
    if (checked) { setPrevTaxRate(taxRate || prevTaxRate); setTaxRate(0); setTaxInput('0'); }
    else         { const r = prevTaxRate || 6; setTaxRate(r); setTaxInput(String(r)); }
  };

  const vehicleTitle = [year, make, model].filter(Boolean).join(' ');
  const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
  const fmt = (n: number) => `$${n.toFixed(2)}`;

  return (
    <div style={qm.overlay}>
      <div style={qm.box}>
        <div style={qm.titleBar}>
          <div style={qm.titleLeft}>
            <div style={qm.titleIcon}><Car size={18} color="#fff" /></div>
            <div>
              <div style={qm.titleText}>Quote For A {vehicleTitle}</div>
              <div style={qm.titleSub}>Review and confirm before saving</div>
            </div>
          </div>
          <button style={qm.xBtn} onClick={onClose}><X size={18} color="#fff" /></button>
        </div>

        <div style={qm.fieldsRow}>
          <div style={qm.fieldGroup}>
            <label style={qm.fieldLabel}>Discount Applied</label>
            <input style={qm.fieldInput} defaultValue={discount.discount_code} readOnly />
          </div>
          <div style={qm.fieldGroup}>
            <label style={qm.fieldLabel}>Quoted Customer</label>
            <input
              style={qm.fieldInput}
              value={quotedCustomer}
              onChange={e => setQuotedCustomer(e.target.value)}
              placeholder="Customer name…"
            />
          </div>
          <button style={qm.printBtn}>Print</button>
        </div>

        <div style={qm.doc}>
          <div style={qm.docHeader}>
            <span style={qm.docTitle}>Quote</span>
            <span style={qm.docDate}>{today}</span>
          </div>

          <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', marginTop: 14 }}>
            <table style={qm.docTable}>
              <thead>
                <tr style={{ background: '#16a34a' }}>
                  {(['Part #', 'Description', 'Qty', 'Avail'] as const).map(h => (
                    <th key={h} style={qm.docTh}>{h}</th>
                  ))}
                  {(['List', 'Sell'] as const).map(h => (
                    <th key={h} style={qm.docThR}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={qm.docRow}>
                  <td style={qm.docTd}><span style={qm.mono}>{glass.part_no}</span></td>
                  <td style={qm.docTd}>{glass.description}</td>
                  <td style={qm.docTd}>1.00</td>
                  <td style={qm.docTd}></td>
                  <td style={qm.docTdR}>{fmt(glassListPrice)}</td>
                  <td style={{ ...qm.docTdR, ...qm.green }}>{fmt(glassSellPrice)}</td>
                </tr>
                {hardware && (
                  <tr style={qm.docRow}>
                    <td style={qm.docTd}><span style={qm.mono}>{hardware.part_no}</span></td>
                    <td style={qm.docTd}>{hardware.type}{hardware.color ? ` — ${hardware.color}` : ''}</td>
                    <td style={qm.docTd}>1.00</td>
                    <td style={qm.docTd}></td>
                    <td style={qm.docTdR}>—</td>
                    <td style={{ ...qm.docTdR, ...qm.green }}>—</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={qm.totalsWrap}>
            <div style={qm.tRowGreen}>
              <span style={qm.tLabel}>{laborLabel}</span>
              <span style={qm.tValue}>{fmt(labor)}</span>
            </div>
            <div style={{ ...qm.tRowGreen, borderBottom: 'none' }}>
              <span style={{ ...qm.tLabel, fontWeight: 700 }}>SUB TOTAL</span>
              <span style={{ ...qm.tValue, fontWeight: 700, color: '#16a34a' }}>{fmt(subTotal)}</span>
            </div>
            <div style={qm.tRowWhite}>
              <span style={qm.tTaxLabel}>Change Tax Rate</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto', marginRight: 16 }}>
                <input
                  type="number" min="0" max="100"
                  style={qm.taxInput}
                  value={taxInput}
                  onChange={e => handleTaxInput(e.target.value)}
                />
                <span style={{ fontSize: 13, color: '#374151' }}>%</span>
              </div>
              <span style={qm.tValue}>{fmt(tax)}</span>
            </div>
            <div style={qm.tRowGray}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={taxRate === 0}
                  onChange={e => handleZeroTax(e.target.checked)}
                  style={{ width: 14, height: 14, accentColor: '#16a34a', cursor: 'pointer' }}
                />
                <span style={qm.tTaxLabel}>Zero Tax</span>
              </label>
              <span style={{ ...qm.tValue, fontWeight: 700, fontSize: 15 }}>{fmt(total)}</span>
            </div>
          </div>

          <div style={qm.glFooter}>Generated with Glass Logic</div>
        </div>

        <div style={qm.btnGrid}>
          <button style={qm.btnSecondary}>Override NAGS Discount</button>
          <button style={qm.btnPrimary} onClick={onTurnIntoInvoice}>Turn Into Invoice</button>
          <button style={qm.btnSecondary}>Add Another Line Item</button>
          <button style={qm.btnSecondary}>Override Quote Numbers</button>
          <button style={qm.btnPrimary}>Save Quote</button>
          <button style={qm.btnCancel} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

/* ── Styles ── */
const styles: Record<string, React.CSSProperties> = {
  card:         { flex: 1, display: 'flex', flexDirection: 'column', margin: 24, borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', background: '#fff' },
  header:       { background: '#16a34a', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft:   { display: 'flex', alignItems: 'center', gap: 14 },
  headerRight:  { display: 'flex', alignItems: 'center', gap: 16 },
  headerIcon:   { width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle:  { fontSize: 17, fontWeight: 700, color: '#fff' },
  headerSub:    { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  closeBtn:     { background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' },
  errorBanner:  { background: '#fef2f2', color: '#dc2626', fontSize: 12, padding: '8px 24px', borderBottom: '1px solid #fecaca' },
  body:         { padding: 24, display: 'flex', flexDirection: 'column', gap: 0, flex: 1, overflowY: 'auto' },
  searchGrid:   { display: 'grid', gridTemplateColumns: '110px 1fr 1fr', gap: 14 },
  select:       { width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: 7, fontSize: 13, color: '#111827', background: '#fff', outline: 'none', cursor: 'pointer' },
  searchBtn:    { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: '#16a34a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' },
  summaryPill:  { marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 14px' },
  summaryText:  { fontSize: 13, color: '#15803d' },
  changeBtn:    { fontSize: 12, color: '#16a34a', background: 'transparent', border: '1px solid #16a34a', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontWeight: 600 },
  table:        { width: '100%', borderCollapse: 'collapse' as const },
  tableHead:    { background: '#16a34a' },
  th:           { padding: '10px 14px', fontSize: 12, fontWeight: 600, color: '#fff', textAlign: 'left' as const, whiteSpace: 'nowrap' as const },
  tr:           { borderBottom: '1px solid #f3f4f6', transition: 'background 0.1s' },
  td:           { padding: '10px 14px', fontSize: 13, color: '#111827' },
  empty:        { padding: 20, textAlign: 'center' as const, fontSize: 13, color: '#9ca3af' },
  partNo:       { fontFamily: 'monospace', fontSize: 12, color: '#374151', fontWeight: 600 },
  price:        { fontWeight: 600, color: '#16a34a' },
  codeTag:      { fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#6b7280', background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 },
  groupHeader:    { background: '#f3f4f6' },
  groupHeaderTd:  { padding: '6px 14px', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: 0.6, borderBottom: '1px solid #e5e7eb' },
  discountRow:  { display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 },
  discountBox:  { display: 'flex', flexDirection: 'column', gap: 8 },
  discountSelect:{ width: '100%', padding: '8px 12px', border: '1.5px solid #d1d5db', borderRadius: 7, fontSize: 13, color: '#111827', background: '#fff', outline: 'none', cursor: 'pointer' },
  discountHead: { background: '#f9fafb' },
  discountTh:   { padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#6b7280', textAlign: 'left' as const, borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  discountTd:   { padding: '8px 12px', fontSize: 13, color: '#111827' },
  actionBtns:   { display: 'flex', flexDirection: 'column', gap: 10 },
  btnRepair:    { padding: '11px 0', background: '#fff', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' },
  btnQuote:     { padding: '11px 0', background: '#16a34a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' },
};

const ss: Record<string, React.CSSProperties> = {
  wrapper: { marginBottom: 24 },
  header:  { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 },
  badge:   { width: 24, height: 24, borderRadius: '50%', background: '#16a34a', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  label:   { fontSize: 13, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' as const },
  line:    { flex: 1, height: 1, background: '#e5e7eb' },
  body:    {},
};

const qm: Record<string, React.CSSProperties> = {
  overlay:     { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  box:         { background: '#fff', borderRadius: 12, width: 640, maxHeight: '92vh', overflow: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.22)', display: 'flex', flexDirection: 'column' },
  titleBar:    { background: '#16a34a', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  titleLeft:   { display: 'flex', alignItems: 'center', gap: 14 },
  titleIcon:   { width: 38, height: 38, background: 'rgba(255,255,255,0.2)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  titleText:   { fontSize: 15, fontWeight: 700, color: '#fff' },
  titleSub:    { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  xBtn:        { background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', borderRadius: 4 },
  fieldsRow:   { display: 'flex', alignItems: 'flex-end', gap: 12, padding: '14px 24px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', flexWrap: 'wrap' as const },
  fieldGroup:  { display: 'flex', flexDirection: 'column' as const, gap: 5, flex: 1, minWidth: 160 },
  fieldLabel:  { fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  fieldInput:  { padding: '8px 12px', border: '1.5px solid #d1d5db', borderRadius: 7, fontSize: 13, color: '#111827', background: '#fff', outline: 'none' },
  printBtn:    { padding: '9px 20px', background: '#fff', border: '1.5px solid #16a34a', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#16a34a', whiteSpace: 'nowrap' as const, alignSelf: 'flex-end' as const },
  doc:         { padding: '20px 24px', flex: 1 },
  docHeader:   { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' },
  docTitle:    { fontSize: 15, fontWeight: 700, color: '#111827' },
  docDate:     { fontSize: 12, color: '#6b7280' },
  docTable:    { width: '100%', borderCollapse: 'collapse' as const },
  docTh:       { padding: '10px 14px', fontSize: 12, fontWeight: 600, color: '#fff', textAlign: 'left' as const },
  docThR:      { padding: '10px 14px', fontSize: 12, fontWeight: 600, color: '#fff', textAlign: 'right' as const },
  docRow:      { borderBottom: '1px solid #f3f4f6' },
  docTd:       { padding: '10px 14px', fontSize: 13, color: '#111827' },
  docTdR:      { padding: '10px 14px', fontSize: 13, color: '#374151', textAlign: 'right' as const },
  mono:        { fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: '#374151' },
  green:       { fontWeight: 600, color: '#16a34a' },
  totalsWrap:  { marginTop: 12, border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' },
  tRowGreen:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f0fdf4', borderBottom: '1px solid #e5e7eb' },
  tRowWhite:   { display: 'flex', alignItems: 'center', padding: '10px 16px', background: '#fff', borderBottom: '1px solid #e5e7eb' },
  tRowGray:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f9fafb' },
  tLabel:      { fontSize: 13, color: '#374151' },
  tTaxLabel:   { fontSize: 13, fontWeight: 600, color: '#15803d' },
  tValue:      { fontSize: 13, color: '#374151', textAlign: 'right' as const },
  taxInput:    { width: 52, padding: '3px 8px', border: '1px solid #d1d5db', borderRadius: 5, fontSize: 13, textAlign: 'right' as const, outline: 'none' },
  glFooter:    { marginTop: 16, textAlign: 'center' as const, fontSize: 11, color: '#9ca3af', fontStyle: 'italic' as const, letterSpacing: 0.3 },
  btnGrid:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '16px 24px', borderTop: '1px solid #e5e7eb', background: '#f9fafb' },
  btnSecondary:{ padding: '10px 0', background: '#fff', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' },
  btnPrimary:  { padding: '10px 0', background: '#16a34a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' },
  btnCancel:   { padding: '10px 0', background: '#fff', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#9ca3af', cursor: 'pointer' },
};

export default NAGSByVehicle;
