/// <reference types="vite/client" />
// Central API client — all components import from here.
import type { InvoiceRecord } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // ── Customers ──────────────────────────────────────────────
  getCustomers: (search?: string) =>
    request<Customer[]>(`/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  createCustomer: (data: Omit<Customer, 'id' | 'created_at'>) =>
    request<Customer>('/customers', { method: 'POST', body: JSON.stringify(data) }),
  deleteCustomer: (id: number) =>
    request<{ success: boolean }>(`/customers/${id}`, { method: 'DELETE' }),

  // ── Business Types ──────────────────────────────────────────
  getBusinessTypes: () => request<BusinessType[]>('/business-types'),
  createBusinessType: (name: string) =>
    request<BusinessType>('/business-types', { method: 'POST', body: JSON.stringify({ name }) }),
  deleteBusinessType: (id: number) =>
    request<{ success: boolean }>(`/business-types/${id}`, { method: 'DELETE' }),

  // ── Discounts (gl2015m1) ────────────────────────────────────
  getDiscounts: () => request<Discount[]>('/discounts'),
  getDiscountDetails: (code: string) =>
    request<DiscountDetail[]>(`/discounts/${encodeURIComponent(code)}/details`),
  getDiscountParts: () => request<NagsPrefixPart[]>('/discounts/parts'),
  createDiscount: (data: Omit<Discount, 'details'> & { details?: Omit<DiscountDetail, 'discount_code'>[] }) =>
    request<{ discount_code: string }>('/discounts', { method: 'POST', body: JSON.stringify(data) }),
  updateDiscount: (code: string, data: Omit<Discount, 'discount_code' | 'details'> & { details?: Omit<DiscountDetail, 'discount_code'>[] }) =>
    request<{ discount_code: string }>(`/discounts/${encodeURIComponent(code)}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDiscount: (code: string) =>
    request<{ success: boolean }>(`/discounts/${encodeURIComponent(code)}`, { method: 'DELETE' }),

  // ── NAGS Vehicle Lookup ─────────────────────────────────────
  getYears: () => request<string[]>('/years'),
  getMakes: (year?: string) =>
    request<VehicleMake[]>(year ? `/makes?year=${encodeURIComponent(year)}` : '/makes'),
  getModels: (makeId: number, year?: string) =>
    request<VehicleModel[]>(year ? `/makes/${makeId}/models?year=${encodeURIComponent(year)}` : `/makes/${makeId}/models`),
  getBodyStyles: () => request<BodyStyle[]>('/body-styles'),
  getBodyStylesByVehicle: (year: string, makeId: number, modelId?: number) => {
    const params = new URLSearchParams({ year, makeId: String(makeId) });
    if (modelId) params.set('modelId', String(modelId));
    return request<BodyStyle[]>(`/body-styles-by-vehicle?${params}`);
  },

  // ── NAGS Glass ──────────────────────────────────────────────
  getGlassByVehicle: (year: string, makeId: number, modelId?: number, bodyStyleId?: number) => {
    const params = new URLSearchParams({ year, makeId: String(makeId) });
    if (modelId)     params.set('modelId',     String(modelId));
    if (bodyStyleId) params.set('bodyStyleId', String(bodyStyleId));
    return request<NagsGlassPart[]>(`/glass-by-vehicle?${params}`);
  },
  searchGlassParts: (q?: string, limit = 200) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (q) params.set('q', q);
    return request<NagsGlassPart[]>(`/glass-parts?${params}`);
  },
  getGlassPart: (partNo: string) =>
    request<NagsGlassPartDetail>(`/glass-part/${encodeURIComponent(partNo)}`),
  getFitment: (partNo: string) =>
    request<VehicleFitment[]>(`/fitment/${encodeURIComponent(partNo)}`),

  // ── NAGS Colors & Hardware ──────────────────────────────────
  getGlassPricing: (partNo: string) =>
    request<GlassPricing[]>(`/glass-pricing/${encodeURIComponent(partNo)}`),
  getGlassColors: () => request<GlassColor[]>('/glass-colors'),
  getColorPrices: () => request<ColorPriceTier[]>('/color-prices'),
  getHardwareForGlass: (year: string, makeId: number, modelId: number | undefined, bodyStyleId: number | undefined, nagsGlassId: string) => {
    const params = new URLSearchParams({ year, makeId: String(makeId), nagsGlassId });
    if (modelId)     params.set('modelId',     String(modelId));
    if (bodyStyleId) params.set('bodyStyleId', String(bodyStyleId));
    return request<HardwareForGlass[]>(`/hardware-for-glass?${params}`);
  },
  getHardwareByVehicle: (year: string, makeId: number, modelId?: number) => {
    const params = new URLSearchParams({ year, makeId: String(makeId) });
    if (modelId) params.set('modelId', String(modelId));
    return request<NagsHwPart[]>(`/hardware-by-vehicle?${params}`);
  },
  getHardwareParts: () => request<NagsHwPart[]>('/hardware-parts'),

  // ── Schedule ──────────────────────────────────────────────
  getSchedule: (date: string) =>
    request<ScheduleBookingRow[]>(`/schedule?date=${encodeURIComponent(date)}`),
  saveScheduleBooking: (data: {
    date: string; slot: string; slotIndex: 0 | 1;
    customerName: string; phone: string; vin: string; notes: string;
  }) => request<{ success: boolean }>('/schedule', { method: 'PUT', body: JSON.stringify(data) }),
  deleteScheduleBooking: (data: { date: string; slot: string; slotIndex: 0 | 1 }) =>
    request<{ success: boolean }>('/schedule', { method: 'DELETE', body: JSON.stringify(data) }),

  // ── Invoices ──────────────────────────────────────────────
  getInvoices: () => request<InvoiceRecord[]>('/invoices'),
  saveInvoiceRecord: (data: InvoiceRecord) =>
    request<InvoiceRecord>('/invoices', { method: 'PUT', body: JSON.stringify(data) }),
  deleteInvoiceRecord: (id: number) =>
    request<{ success: boolean }>(`/invoices/${id}`, { method: 'DELETE' }),

  // ── Employees (user db) ─────────────────────────────────────
  getEmployees: () => request<Employee[]>('/employees'),
  createEmployee: (data: { id: number; name: string; total_working_hours: number }) =>
    request<Employee>('/employees', { method: 'POST', body: JSON.stringify(data) }),
  deleteEmployee: (id: number) =>
    request<{ success: boolean }>(`/employees/${id}`, { method: 'DELETE' }),
};

// ── Types ─────────────────────────────────────────────────────

export interface Customer {
  id: number;
  name: string;
  company: string;
  route: string;
  phone: string;
  address: string;
  created_at?: string;
}

export interface BusinessType {
  id: number;
  name: string;
}

export interface Employee {
  id: number;
  name: string;
  total_working_hours: number;
}

export interface Discount {
  discount_code: string;
  discount_name: string;
  kit_charge: string;
  kit_amount: number;
  ukit_amount: number;
  udam_amount: number;
  two_part_amount: number;
  udam_1_5_amount: number;
  two_kit_amount: number;
  material_charge: string;
  material_amount: number;
  labor_charge: string;
  repair_charge: string;
  init_repair_amount: number;
  addtnl_repair_amount: number;
  edi_flag: string;
  edi_format: string;
  details: DiscountDetail[];
}

export interface NagsPrefixPart {
  nags_prefix: string;
  part_type: string;
}

export interface DiscountDetail {
  discount_code: string;
  nags_prefix: string;
  part_type: string;
  flat_or_hourly: 'Flat' | 'Hourly';
  discount_amount: number;
  labor_rate: number;
  min_hours: number;
  max_hours: number;
  discount_amount2: number;
  labor_rate2: number;
  min_hours2: number;
  max_hours2: number;
}

export interface VehicleMake {
  id: number;
  code: string;
  name: string;
}

export interface VehicleModel {
  id: number;
  make_id: number;
  code: string;
  name: string;
}

export interface BodyStyle {
  id: number;
  code: string;
  description: string;
}

export interface NagsGlassPart {
  part_no: string;
  description: string;
  type: 'Windshield' | 'Tempered' | 'Laminated';
  prefix: string;
  labor_hours: number;
  list_price: number;
  height?: number;
  width?: number;
  color_code?: string;
  color_desc?: string;
  opening_type?: string;
  sort_order?: number;
  pos_cd?: string;
  side_cd?: string;
  num_holes?: number;
  from_range?: string;
  to_range?: string;
  note?: string;
  has_antenna?: boolean;
  is_encapsulated?: boolean;
  is_hud?: boolean;
  is_heated?: boolean;
  has_solar?: boolean;
  is_modular?: boolean;
}

export interface NagsGlassPartDetail extends NagsGlassPart {
  is_oem: boolean;
  is_encapsulated: boolean;
  is_modular: boolean;
  has_solar: boolean;
  is_heated: boolean;
  is_privacy: boolean;
  interchange: Array<{ interchg_part: string; mfr_code: string; mfr_name: string }>;
}

export interface VehicleFitment {
  year: number;
  make: string;
  model: string;
  style: string;
}

export interface GlassColor {
  code: string;
  tier: number;
  description: string;
}

export interface GlassPricing {
  color: string;
  price: number;
  color_code: string;
  display_code: string;
  atchmnt_flag: string;
  prem_flag: string;
  labor_hours: number;
  mlding_flag: string;
  atchmnt_is_clip: string;
  atchmnt_is_mlding: string;
  atchmnt_dsc: string;
}

export interface HardwareForGlass {
  part_no: string;
  color: string;
  type: string;
  list_price: number;
}

export interface ColorPriceTier {
  color_code: string;
  color_name: string;
  tier: number;
  price_multiplier: number;
  labor_hours: number;
}

export interface NagsHwPart {
  part_no: string;
  type: string;
  color: string;
  color_code: string;
  description: string;
  quantity?: number;
  list_price: number;
}

export interface ScheduleBookingRow {
  slot_time: string;
  slot_index: 0 | 1;
  customer_name: string;
  phone: string;
  vin: string;
  notes: string;
}

// Legacy alias kept for components still using the old type name
export type GlassPart = NagsGlassPart;
export type HardwarePart = NagsHwPart;
