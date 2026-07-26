-- =============================================================
--  GlassLogic v2.0  –  Seed Data  (FAKE / TEST ONLY)
--  Data is modified from source files in C:\DATA.
--  Do NOT use in production.
-- =============================================================

USE glasslogic_test;

-- -----------------------------------------------------------
--  CUSTOMERS
-- -----------------------------------------------------------
INSERT INTO customers (id, name, company, route, phone, address) VALUES
  (1, 'APEX GLASS WORKS',        'GEICO INSURANCE',       'Route A', '555-0101', '101 Main St, Springfield, IL'),
  (2, 'BLUE RIDGE AUTO GLASS',   'LIBERTY MUTUAL',        'Route B', '555-0202', '222 Oak Ave, Shelbyville, IL'),
  (3, 'CENTRAL COLLISION',       'NATIONWIDE INSURANCE',  'Route C', '555-0303', '333 Pine Rd, Capital City, IL'),
  (4, 'DIAMOND AUTO GLASS',      'TRAVELERS INSURANCE',   'Route A', '555-0404', '444 Elm Blvd, Ogdenville, IL'),
  (5, 'EASTSIDE BODY SHOP',      'AAA INSURANCE',         'Route D', '555-0505', '555 Maple Dr, North Haverbrook, IL'),
  (6, 'FAIRVIEW AUTO REPAIR',    '',                      'Route B', '555-0606', '666 Cedar Ln, Brockway, IL'),
  (7, 'GOLDEN GATE GLASS',       'USAA',                  'Route C', '555-0707', '777 Birch Way, Cypress Creek, IL'),
  (8, 'HIGHLAND FLEET SERVICES', 'FLEET ACCOUNT',         'Route A', '555-0808', '888 Spruce St, Shelbyville, IL');

-- -----------------------------------------------------------
--  BUSINESS TYPES
-- -----------------------------------------------------------
INSERT INTO business_types (id, name) VALUES
  (1, 'AUTO DEALER'),
  (2, 'BODY SHOP'),
  (3, 'FLEET ACCOUNT'),
  (4, 'GEICO INSURANCE'),
  (5, 'INDEPENDENT'),
  (6, 'LIBERTY MUTUAL'),
  (7, 'NATIONWIDE'),
  (8, 'TRAVELERS'),
  (9, 'USAA');

-- -----------------------------------------------------------
--  DISCOUNTS
-- -----------------------------------------------------------
INSERT INTO discounts (id, code, name, edi, edi_format, kit_charge, kit_amt, two_kit_amt, high_mod_amt, high_mod_nc15, high_mod_nc20) VALUES
  (1, 'SENIOR', 'Senior Citizen Discount',  0, '',                                    0, 0.00,  0.00, 0.00, 0.00, 0.00),
  (2, 'FLEET',  'Fleet Account Discount',   1, 'Lynx - Other Insurance Company',       1, 15.00, 25.00, 50.00, 1.50, 2.00),
  (3, 'CASH5',  'Cash Payment 5%',          0, '',                                    0, 0.00,  0.00, 0.00, 0.00, 0.00);

-- -----------------------------------------------------------
--  DISCOUNT DETAILS
-- -----------------------------------------------------------
INSERT INTO discount_details (discount_id, nags_prefix, part_type, flat_or_hourly, discount_pct, labor, min_hours, max_hours) VALUES
  -- SENIOR
  (1, 'FW', 'Windshield', 'Hourly', 7.50, 45.00, 1.50, 3.00),
  (1, 'DW', 'Tempered',   'Hourly', 7.50, 35.00, 0.50, 1.50),
  -- FLEET
  (2, 'FW', 'Windshield', 'Flat',   10.00, 0.00, 0.00, 0.00),
  (2, 'DW', 'Tempered',   'Flat',   10.00, 0.00, 0.00, 0.00),
  -- CASH5
  (3, 'FW', 'Windshield', 'Hourly', 5.00, 45.00, 1.50, 3.00);

-- -----------------------------------------------------------
--  VEHICLE MAKES
-- -----------------------------------------------------------
INSERT INTO vehicle_makes (id, code, name) VALUES
  ( 1, 'ACURA',  'Acura'),
  ( 2, 'BMW',    'BMW'),
  ( 3, 'BUICK',  'Buick'),
  ( 4, 'CADDIE', 'Cadillac'),
  ( 5, 'CHEV',   'Chevrolet'),
  ( 6, 'CHRYS',  'Chrysler'),
  ( 7, 'DODGE',  'Dodge'),
  ( 8, 'FORD',   'Ford'),
  ( 9, 'GMC',    'GMC'),
  (10, 'HONDA',  'Honda'),
  (11, 'HYUND',  'Hyundai'),
  (12, 'INFIN',  'Infiniti'),
  (13, 'JEEP',   'Jeep'),
  (14, 'KIA',    'Kia'),
  (15, 'LEXUS',  'Lexus'),
  (16, 'LINC',   'Lincoln'),
  (17, 'MAZDA',  'Mazda'),
  (18, 'MBENZ',  'Mercedes-Benz'),
  (19, 'NISSAN', 'Nissan'),
  (20, 'RAM',    'Ram'),
  (21, 'SUBARU', 'Subaru'),
  (22, 'TESLA',  'Tesla'),
  (23, 'TOYOTA', 'Toyota'),
  (24, 'VW',     'Volkswagen'),
  (25, 'VOLVO',  'Volvo');

-- -----------------------------------------------------------
--  VEHICLE MODELS
-- -----------------------------------------------------------
INSERT INTO vehicle_models (id, make_id, code, name) VALUES
  -- Honda
  (101, 10, 'CIVIC',   'Civic'),
  (102, 10, 'ACCORD',  'Accord'),
  (103, 10, 'CRV',     'CR-V'),
  (104, 10, 'PILOT',   'Pilot'),
  (105, 10, 'ODYSSEY', 'Odyssey'),
  -- Toyota
  (201, 23, 'CAMRY',   'Camry'),
  (202, 23, 'COROLLA', 'Corolla'),
  (203, 23, 'TACOMA',  'Tacoma'),
  (204, 23, 'RAV4',    'RAV4'),
  (205, 23, 'HIGHLD',  'Highlander'),
  -- Ford
  (301,  8, 'F150',    'F-150'),
  (302,  8, 'ESCAPE',  'Escape'),
  (303,  8, 'EXPLOR',  'Explorer'),
  (304,  8, 'FUSION',  'Fusion'),
  (305,  8, 'MUST',    'Mustang'),
  -- Chevrolet
  (401,  5, 'SILVER',  'Silverado'),
  (402,  5, 'EQUINX',  'Equinox'),
  (403,  5, 'TAHOE',   'Tahoe'),
  (404,  5, 'MALIBU',  'Malibu'),
  (405,  5, 'TRAX',    'Trax'),
  -- Nissan
  (501, 19, 'ALTIMA',  'Altima'),
  (502, 19, 'ROGUE',   'Rogue'),
  (503, 19, 'SENTRA',  'Sentra'),
  (504, 19, 'ARMADA',  'Armada'),
  -- BMW
  (601,  2, '3SRS',    '3 Series'),
  (602,  2, '5SRS',    '5 Series'),
  (603,  2, 'X5',      'X5'),
  -- Dodge
  (701,  7, 'CHARGR',  'Charger'),
  (702,  7, 'DURANG',  'Durango'),
  (703,  7, 'CHALL',   'Challenger'),
  -- Jeep
  (801, 13, 'WRNGLR',  'Wrangler'),
  (802, 13, 'CHEROK',  'Cherokee'),
  (803, 13, 'COMPSS',  'Compass');

-- -----------------------------------------------------------
--  BODY STYLES
-- -----------------------------------------------------------
INSERT INTO body_styles (id, code, description) VALUES
  ( 1, '2DSD',  '2 Door Sedan'),
  ( 2, '4DSD',  '4 Door Sedan'),
  ( 3, '2DHB',  '2 Door Hatchback'),
  ( 4, '4DHB',  '4 Door Hatchback'),
  ( 5, '2DPU',  '2 Door Pickup'),
  ( 6, '4DUT',  '4 Door Utility/SUV'),
  ( 7, '2DUT',  '2 Door Utility/SUV'),
  ( 8, '4DWG',  '4 Door Station Wagon'),
  ( 9, 'MINVN', 'Minivan'),
  (10, '2DCNV', '2 Door Convertible');

-- -----------------------------------------------------------
--  GLASS PARTS  (fake part numbers – not real NAGS data)
-- -----------------------------------------------------------
INSERT INTO glass_parts (part_no, description, type, labor_hours, list_price) VALUES
  ('FW09001GTAN', 'Windshield',          'Windshield', 2.0, 318.75),
  ('FW09002GBLU', 'Windshield Solar',    'Windshield', 2.0, 352.00),
  ('DW09101GTAN', 'Door Glass FR LH',    'Tempered',   0.8, 148.50),
  ('DW09102GTAN', 'Door Glass FR RH',    'Tempered',   0.8, 148.50),
  ('DW09103GTAN', 'Door Glass RR LH',    'Tempered',   0.7, 131.00),
  ('DW09104GTAN', 'Door Glass RR RH',    'Tempered',   0.7, 131.00),
  ('QR09201GTAN', 'Quarter Glass RR LH', 'Tempered',   0.5,  92.25),
  ('QR09202GTAN', 'Quarter Glass RR RH', 'Tempered',   0.5,  92.25),
  ('BG09301GTAN', 'Back Glass',          'Tempered',   1.0, 215.00),
  ('BG09302GHTR', 'Back Glass Heated',   'Tempered',   1.2, 248.00),
  ('VT09401GTAN', 'Vent Glass FR LH',    'Tempered',   0.4,  68.00),
  ('VT09402GTAN', 'Vent Glass FR RH',    'Tempered',   0.4,  68.00);

-- -----------------------------------------------------------
--  GLASS COLORS
-- -----------------------------------------------------------
INSERT INTO glass_colors (code, description, tier) VALUES
  ('CL', 'Clear',              1),
  ('GT', 'Green Tint',         1),
  ('BT', 'Blue Tint',          1),
  ('BP', 'Blue Tint Privacy',  5),
  ('GP', 'Green Tint Privacy', 5),
  ('KP', 'Black Privacy',      5);

-- -----------------------------------------------------------
--  COLOR / PRICE TIERS
-- -----------------------------------------------------------
INSERT INTO color_price_tiers (color_code, color_name, labor_hours, price_multiplier) VALUES
  ('CL', 'Clear',              2.0, 1.0000),
  ('GT', 'Green Tint',         2.0, 1.0800),
  ('BT', 'Blue Tint',          2.0, 1.0800),
  ('BP', 'Blue Tint Privacy',  2.0, 1.1500),
  ('GP', 'Green Tint Privacy', 2.0, 1.1500),
  ('KP', 'Black Privacy',      2.0, 0.9200);

-- -----------------------------------------------------------
--  HARDWARE PARTS  (fake part numbers – not real NAGS data)
-- -----------------------------------------------------------
INSERT INTO hardware_parts (part_no, color, type, description) VALUES
  ('HML-09001', 'Silver', 'Moulding', 'Windshield Moulding Upper'),
  ('HML-09002', 'Black',  'Moulding', 'Windshield Moulding Lower'),
  ('HCL-09003', 'Black',  'Clip',     'Retainer Clip Set'),
  ('HSL-09004', 'Black',  'Seal',     'Windshield Seal'),
  ('HAD-09005', 'Black',  'Adhesive', 'Urethane Adhesive Kit'),
  ('HPR-09006', 'Black',  'Primer',   'Glass Primer');
