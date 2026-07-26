// Dummy test database — data is MODIFIED/FAKE for development purposes only.
// Structure mirrors the C:\DATA flat-file schema.

export interface Customer {
  id: number;
  name: string;
  company: string;
  route: string;
  phone: string;
  address: string;
}

export interface BusinessType {
  id: number;
  name: string;
}

export interface Discount {
  id: number;
  code: string;
  name: string;
  edi: boolean;
  ediFormat: string;
  kitCharge: boolean;
  kitAmt: number;
  twoKitAmt: number;
  highModAmt: number;
  highModNC15: number;
  highModNC20: number;
  details: DiscountDetail[];
}

export interface DiscountDetail {
  id: number;
  nagsPrefix: string;
  partType: string;
  flatOrHourly: 'Flat' | 'Hourly';
  discount: number;
  labor: number;
  minHours: number;
  maxHours: number;
}

export interface VehicleMake {
  id: number;
  code: string;
  name: string;
}

export interface VehicleModel {
  id: number;
  makeId: number;
  code: string;
  name: string;
}

export interface BodyStyle {
  id: number;
  code: string;
  description: string;
}

export interface GlassPart {
  partNo: string;
  description: string;
  type: 'Windshield' | 'Tempered' | 'Laminated';
  laborHours: number;
  listPrice: number;
}

export interface GlassColor {
  code: string;
  description: string;
  tier: number;
}

export interface HardwarePart {
  partNo: string;
  color: string;
  type: string;
  description: string;
  listPrice: number;
}

/* ─────────────────────────────────────────────
   CUSTOMERS  (fake test data)
───────────────────────────────────────────── */
export const customers: Customer[] = [
  { id: 1, name: 'APEX GLASS WORKS',       company: 'GEICO INSURANCE',        route: 'Route A', phone: '555-0101', address: '101 Main St, Springfield, IL' },
  { id: 2, name: 'BLUE RIDGE AUTO GLASS',  company: 'LIBERTY MUTUAL',         route: 'Route B', phone: '555-0202', address: '222 Oak Ave, Shelbyville, IL' },
  { id: 3, name: 'CENTRAL COLLISION',      company: 'NATIONWIDE INSURANCE',   route: 'Route C', phone: '555-0303', address: '333 Pine Rd, Capital City, IL' },
  { id: 4, name: 'DIAMOND AUTO GLASS',     company: 'TRAVELERS INSURANCE',    route: 'Route A', phone: '555-0404', address: '444 Elm Blvd, Ogdenville, IL' },
  { id: 5, name: 'EASTSIDE BODY SHOP',     company: 'AAA INSURANCE',          route: 'Route D', phone: '555-0505', address: '555 Maple Dr, North Haverbrook, IL' },
  { id: 6, name: 'FAIRVIEW AUTO REPAIR',   company: '',                       route: 'Route B', phone: '555-0606', address: '666 Cedar Ln, Brockway, IL' },
  { id: 7, name: 'GOLDEN GATE GLASS',      company: 'USAA',                   route: 'Route C', phone: '555-0707', address: '777 Birch Way, Cypress Creek, IL' },
  { id: 8, name: 'HIGHLAND FLEET SERVICES',company: 'FLEET ACCOUNT',          route: 'Route A', phone: '555-0808', address: '888 Spruce St, Shelbyville, IL' },
];

/* ─────────────────────────────────────────────
   BUSINESS TYPES  (fake test data)
───────────────────────────────────────────── */
export const businessTypes: BusinessType[] = [
  { id: 1,  name: 'AUTO DEALER'        },
  { id: 2,  name: 'BODY SHOP'          },
  { id: 3,  name: 'FLEET ACCOUNT'      },
  { id: 4,  name: 'GEICO INSURANCE'    },
  { id: 5,  name: 'INDEPENDENT'        },
  { id: 6,  name: 'LIBERTY MUTUAL'     },
  { id: 7,  name: 'NATIONWIDE'         },
  { id: 8,  name: 'TRAVELERS'          },
  { id: 9,  name: 'USAA'               },
];

/* ─────────────────────────────────────────────
   DISCOUNTS  (fake test data)
───────────────────────────────────────────── */
export const discounts: Discount[] = [
  {
    id: 1,
    code: 'SENIOR',
    name: 'Senior Citizen Discount',
    edi: false,
    ediFormat: '',
    kitCharge: false,
    kitAmt: 0,
    twoKitAmt: 0,
    highModAmt: 0,
    highModNC15: 0,
    highModNC20: 0,
    details: [
      { id: 1, nagsPrefix: 'FW', partType: 'Windshield', flatOrHourly: 'Hourly', discount: 7.5, labor: 45.0, minHours: 1.5, maxHours: 3.0 },
      { id: 2, nagsPrefix: 'DW', partType: 'Tempered',   flatOrHourly: 'Hourly', discount: 7.5, labor: 35.0, minHours: 0.5, maxHours: 1.5 },
    ],
  },
  {
    id: 2,
    code: 'FLEET',
    name: 'Fleet Account Discount',
    edi: true,
    ediFormat: 'Lynx - Other Insurance Company',
    kitCharge: true,
    kitAmt: 15.0,
    twoKitAmt: 25.0,
    highModAmt: 50.0,
    highModNC15: 1.5,
    highModNC20: 2.0,
    details: [
      { id: 3, nagsPrefix: 'FW', partType: 'Windshield', flatOrHourly: 'Flat',   discount: 10.0, labor: 0,    minHours: 0,   maxHours: 0   },
      { id: 4, nagsPrefix: 'DW', partType: 'Tempered',   flatOrHourly: 'Flat',   discount: 10.0, labor: 0,    minHours: 0,   maxHours: 0   },
    ],
  },
  {
    id: 3,
    code: 'CASH5',
    name: 'Cash Payment 5%',
    edi: false,
    ediFormat: '',
    kitCharge: false,
    kitAmt: 0,
    twoKitAmt: 0,
    highModAmt: 0,
    highModNC15: 0,
    highModNC20: 0,
    details: [
      { id: 5, nagsPrefix: 'FW', partType: 'Windshield', flatOrHourly: 'Hourly', discount: 5.0,  labor: 45.0, minHours: 1.5, maxHours: 3.0 },
    ],
  },
];

/* ─────────────────────────────────────────────
   VEHICLE MAKES  (fake test data — based on real make codes, names changed)
───────────────────────────────────────────── */
export const vehicleMakes: VehicleMake[] = [
  { id:  1, code: 'ACURA',   name: 'Acura'         },
  { id:  2, code: 'BMW',     name: 'BMW'            },
  { id:  3, code: 'BUICK',   name: 'Buick'          },
  { id:  4, code: 'CADDIE',  name: 'Cadillac'       },
  { id:  5, code: 'CHEV',    name: 'Chevrolet'      },
  { id:  6, code: 'CHRYS',   name: 'Chrysler'       },
  { id:  7, code: 'DODGE',   name: 'Dodge'          },
  { id:  8, code: 'FORD',    name: 'Ford'           },
  { id:  9, code: 'GMC',     name: 'GMC'            },
  { id: 10, code: 'HONDA',   name: 'Honda'          },
  { id: 11, code: 'HYUND',   name: 'Hyundai'        },
  { id: 12, code: 'INFIN',   name: 'Infiniti'       },
  { id: 13, code: 'JEEP',    name: 'Jeep'           },
  { id: 14, code: 'KIA',     name: 'Kia'            },
  { id: 15, code: 'LEXUS',   name: 'Lexus'          },
  { id: 16, code: 'LINC',    name: 'Lincoln'        },
  { id: 17, code: 'MAZDA',   name: 'Mazda'          },
  { id: 18, code: 'MBENZ',   name: 'Mercedes-Benz'  },
  { id: 19, code: 'NISSAN',  name: 'Nissan'         },
  { id: 20, code: 'RAM',     name: 'Ram'            },
  { id: 21, code: 'SUBARU',  name: 'Subaru'         },
  { id: 22, code: 'TESLA',   name: 'Tesla'          },
  { id: 23, code: 'TOYOTA',  name: 'Toyota'         },
  { id: 24, code: 'VW',      name: 'Volkswagen'     },
  { id: 25, code: 'VOLVO',   name: 'Volvo'          },
];

/* ─────────────────────────────────────────────
   VEHICLE MODELS  (fake test data)
───────────────────────────────────────────── */
export const vehicleModels: VehicleModel[] = [
  // Honda (makeId=10)
  { id: 101, makeId: 10, code: 'CIVIC',   name: 'Civic'      },
  { id: 102, makeId: 10, code: 'ACCORD',  name: 'Accord'     },
  { id: 103, makeId: 10, code: 'CRV',     name: 'CR-V'       },
  { id: 104, makeId: 10, code: 'PILOT',   name: 'Pilot'      },
  { id: 105, makeId: 10, code: 'ODYSSEY', name: 'Odyssey'    },
  // Toyota (makeId=23)
  { id: 201, makeId: 23, code: 'CAMRY',   name: 'Camry'      },
  { id: 202, makeId: 23, code: 'COROLLA', name: 'Corolla'    },
  { id: 203, makeId: 23, code: 'TACOMA',  name: 'Tacoma'     },
  { id: 204, makeId: 23, code: 'RAV4',    name: 'RAV4'       },
  { id: 205, makeId: 23, code: 'HIGHLD',  name: 'Highlander' },
  // Ford (makeId=8)
  { id: 301, makeId:  8, code: 'F150',    name: 'F-150'      },
  { id: 302, makeId:  8, code: 'ESCAPE',  name: 'Escape'     },
  { id: 303, makeId:  8, code: 'EXPLOR',  name: 'Explorer'   },
  { id: 304, makeId:  8, code: 'FUSION',  name: 'Fusion'     },
  { id: 305, makeId:  8, code: 'MUST',    name: 'Mustang'    },
  // Chevrolet (makeId=5)
  { id: 401, makeId:  5, code: 'SILVER',  name: 'Silverado'  },
  { id: 402, makeId:  5, code: 'EQUINX',  name: 'Equinox'    },
  { id: 403, makeId:  5, code: 'TAHOE',   name: 'Tahoe'      },
  { id: 404, makeId:  5, code: 'MALIBU',  name: 'Malibu'     },
  { id: 405, makeId:  5, code: 'TRAX',    name: 'Trax'       },
  // Nissan (makeId=19)
  { id: 501, makeId: 19, code: 'ALTIMA',  name: 'Altima'     },
  { id: 502, makeId: 19, code: 'ROGUE',   name: 'Rogue'      },
  { id: 503, makeId: 19, code: 'SENTRA',  name: 'Sentra'     },
  { id: 504, makeId: 19, code: 'ARMADA',  name: 'Armada'     },
  // BMW (makeId=2)
  { id: 601, makeId:  2, code: '3SRS',    name: '3 Series'   },
  { id: 602, makeId:  2, code: '5SRS',    name: '5 Series'   },
  { id: 603, makeId:  2, code: 'X5',      name: 'X5'         },
  // Dodge (makeId=7)
  { id: 701, makeId:  7, code: 'CHARGR',  name: 'Charger'    },
  { id: 702, makeId:  7, code: 'DURANG',  name: 'Durango'    },
  { id: 703, makeId:  7, code: 'CHALL',   name: 'Challenger' },
  // Jeep (makeId=13)
  { id: 801, makeId: 13, code: 'WRNGLR',  name: 'Wrangler'   },
  { id: 802, makeId: 13, code: 'CHEROK',  name: 'Cherokee'   },
  { id: 803, makeId: 13, code: 'COMPSS',  name: 'Compass'    },
];

/* ─────────────────────────────────────────────
   BODY STYLES  (fake test data — codes modified)
───────────────────────────────────────────── */
export const bodyStyles: BodyStyle[] = [
  { id: 1, code: '2DSD',   description: '2 Door Sedan'          },
  { id: 2, code: '4DSD',   description: '4 Door Sedan'          },
  { id: 3, code: '2DHB',   description: '2 Door Hatchback'      },
  { id: 4, code: '4DHB',   description: '4 Door Hatchback'      },
  { id: 5, code: '2DPU',   description: '2 Door Pickup'         },
  { id: 6, code: '4DUT',   description: '4 Door Utility/SUV'    },
  { id: 7, code: '2DUT',   description: '2 Door Utility/SUV'    },
  { id: 8, code: '4DWG',   description: '4 Door Station Wagon'  },
  { id: 9, code: 'MINVN',  description: 'Minivan'               },
  { id: 10,code: '2DCNV',  description: '2 Door Convertible'    },
];

/* ─────────────────────────────────────────────
   GLASS PARTS  (fake part numbers — NOT real NAGS data)
───────────────────────────────────────────── */
export const glassParts: GlassPart[] = [
  { partNo: 'FW09001GTAN', description: 'Windshield',           type: 'Windshield', laborHours: 2.0, listPrice: 318.75 },
  { partNo: 'FW09002GBLU', description: 'Windshield Solar',     type: 'Windshield', laborHours: 2.0, listPrice: 352.00 },
  { partNo: 'DW09101GTAN', description: 'Door Glass FR LH',     type: 'Tempered',   laborHours: 0.8, listPrice: 148.50 },
  { partNo: 'DW09102GTAN', description: 'Door Glass FR RH',     type: 'Tempered',   laborHours: 0.8, listPrice: 148.50 },
  { partNo: 'DW09103GTAN', description: 'Door Glass RR LH',     type: 'Tempered',   laborHours: 0.7, listPrice: 131.00 },
  { partNo: 'DW09104GTAN', description: 'Door Glass RR RH',     type: 'Tempered',   laborHours: 0.7, listPrice: 131.00 },
  { partNo: 'QR09201GTAN', description: 'Quarter Glass RR LH',  type: 'Tempered',   laborHours: 0.5, listPrice:  92.25 },
  { partNo: 'QR09202GTAN', description: 'Quarter Glass RR RH',  type: 'Tempered',   laborHours: 0.5, listPrice:  92.25 },
  { partNo: 'BG09301GTAN', description: 'Back Glass',           type: 'Tempered',   laborHours: 1.0, listPrice: 215.00 },
  { partNo: 'BG09302GHTR', description: 'Back Glass Heated',    type: 'Tempered',   laborHours: 1.2, listPrice: 248.00 },
  { partNo: 'VT09401GTAN', description: 'Vent Glass FR LH',     type: 'Tempered',   laborHours: 0.4, listPrice:  68.00 },
  { partNo: 'VT09402GTAN', description: 'Vent Glass FR RH',     type: 'Tempered',   laborHours: 0.4, listPrice:  68.00 },
];

/* ─────────────────────────────────────────────
   GLASS COLORS  (fake data — codes modified)
───────────────────────────────────────────── */
export const glassColors: GlassColor[] = [
  { code: 'CL', description: 'Clear',              tier: 1 },
  { code: 'GT', description: 'Green Tint',         tier: 1 },
  { code: 'BT', description: 'Blue Tint',          tier: 1 },
  { code: 'BP', description: 'Blue Tint Privacy',  tier: 5 },
  { code: 'GP', description: 'Green Tint Privacy', tier: 5 },
  { code: 'KP', description: 'Black Privacy',      tier: 5 },
];

/* ─────────────────────────────────────────────
   HARDWARE PARTS  (fake part numbers — NOT real NAGS data)
───────────────────────────────────────────── */
export const hardwareParts: HardwarePart[] = [
  { partNo: 'HML-09001', color: 'Silver',  type: 'Moulding',  description: 'Windshield Moulding Upper', listPrice: 18.50 },
  { partNo: 'HML-09002', color: 'Black',   type: 'Moulding',  description: 'Windshield Moulding Lower', listPrice: 16.25 },
  { partNo: 'HCL-09003', color: 'Black',   type: 'Clip',      description: 'Retainer Clip Set',         listPrice:  8.75 },
  { partNo: 'HSL-09004', color: 'Black',   type: 'Seal',      description: 'Windshield Seal',           listPrice: 12.99 },
  { partNo: 'HAD-09005', color: 'Black',   type: 'Adhesive',  description: 'Urethane Adhesive Kit',     listPrice: 24.50 },
  { partNo: 'HPR-09006', color: 'Black',   type: 'Primer',    description: 'Glass Primer',              listPrice: 14.97 },
];

/* ─────────────────────────────────────────────
   COLOR / PRICE LOOKUP
   Returns labor hours and price adjustment by color tier
───────────────────────────────────────────── */
export interface ColorPriceEntry {
  colorCode: string;
  colorName: string;
  laborHours: number;
  priceMultiplier: number;
}

export const colorPriceTiers: ColorPriceEntry[] = [
  { colorCode: 'CL', colorName: 'Clear',              laborHours: 2.0, priceMultiplier: 1.00 },
  { colorCode: 'GT', colorName: 'Green Tint',         laborHours: 2.0, priceMultiplier: 1.08 },
  { colorCode: 'BT', colorName: 'Blue Tint',          laborHours: 2.0, priceMultiplier: 1.08 },
  { colorCode: 'BP', colorName: 'Blue Tint Privacy',  laborHours: 2.0, priceMultiplier: 1.15 },
  { colorCode: 'GP', colorName: 'Green Tint Privacy', laborHours: 2.0, priceMultiplier: 1.15 },
  { colorCode: 'KP', colorName: 'Black Privacy',      laborHours: 2.0, priceMultiplier: 0.92 },
];

/* ─────────────────────────────────────────────
   UTILITY HELPERS
───────────────────────────────────────────── */

export function getModelsForMake(makeId: number): VehicleModel[] {
  return vehicleModels.filter(m => m.makeId === makeId);
}

export function getMakeByCode(code: string): VehicleMake | undefined {
  return vehicleMakes.find(m => m.code === code);
}

export function formatPrice(n: number): string {
  return '$' + n.toFixed(2);
}

export const YEARS: string[] = Array.from({ length: 2026 - 1949 }, (_, i) => String(2025 - i));

export const DISCOUNT_OPTIONS = discounts.map(d => `${d.code} – ${d.name}`);
