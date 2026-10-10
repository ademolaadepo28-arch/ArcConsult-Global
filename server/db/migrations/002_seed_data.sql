-- Seed Data for Real Estate & Mortgages Analytics Portal (Nigeria Hub)

-- Clean existing data
TRUNCATE TABLE saved_portfolios CASCADE;
TRUNCATE TABLE schools CASCADE;
TRUNCATE TABLE properties CASCADE;
TRUNCATE TABLE users CASCADE;

-- Insert Demo User
INSERT INTO users (id, email, password_hash, full_name) VALUES
('a0000000-0000-0000-0000-000000000001', 'investor@arcconsult.ng', '$2a$10$examplehashedpasswordhereforportfolio', 'Babatunde Adeleke');

-- Insert Nigerian Schools
INSERT INTO schools (id, name, rating, school_type, location) VALUES
('b0000000-0000-0000-0000-000000000001', 'British International School (BIS)', 9.6, 'International Secondary', ST_SetSRID(ST_MakePoint(3.4420, 6.4355), 4326)),
('b0000000-0000-0000-0000-000000000002', 'Corona School Ikoyi', 9.4, 'Primary / Elementary', ST_SetSRID(ST_MakePoint(3.4320, 6.4550), 4326)),
('b0000000-0000-0000-0000-000000000003', 'American International School of Lagos', 9.8, 'International K-12', ST_SetSRID(ST_MakePoint(3.4390, 6.4320), 4326)),
('b0000000-0000-0000-0000-000000000004', 'Lekki British International School', 9.2, 'Secondary / High', ST_SetSRID(ST_MakePoint(3.4780, 6.4460), 4326)),
('b0000000-0000-0000-0000-000000000005', 'Grange School Ikeja GRA', 9.5, 'International K-12', ST_SetSRID(ST_MakePoint(3.3580, 6.5890), 4326)),
('b0000000-0000-0000-0000-000000000006', 'Children''s International School (CIS)', 9.3, 'Elementary / Middle', ST_SetSRID(ST_MakePoint(3.4850, 6.4390), 4326)),
('b0000000-0000-0000-0000-000000000007', 'The Regent College Maitama', 9.7, 'International Sixth Form', ST_SetSRID(ST_MakePoint(7.4890, 9.0850), 4326));

-- Insert Diverse Nigerian Properties
INSERT INTO properties (
  id, title, description, property_type, status,
  price_cents, estimated_hoa_monthly_cents, annual_property_tax_cents, estimated_monthly_rent_cents,
  bedrooms, bathrooms, square_feet, year_built,
  street_address, city, state, zip_code,
  image_url, alt_image_url, location
) VALUES
(
  'c0000000-0000-0000-0000-000000000001',
  'Banana Island Ultra-Waterfront Villa',
  'Spectacular contemporary waterfront estate in private gated Banana Island featuring private yacht slipway, infinity pool overlooking Lagos Lagoon, automated smart home automation, Olympic gym, and detached twin staff quarters.',
  'SINGLE_FAMILY', 'ACTIVE',
  285000000000, 85000000, 450000000, 1800000000,
  6, 7.5, 8400, 2023,
  'Zone L Close 204, Banana Island', 'Ikoyi, Lagos', 'LA', '101233',
  '/images/properties/prop-1-main.jpg', '/images/properties/prop-1-alt.jpg',
  ST_SetSRID(ST_MakePoint(3.4475, 6.4635), 4326)
),
(
  'c0000000-0000-0000-0000-000000000002',
  'Eko Pearl Azure Penthouse',
  'Super-penthouse atop Eko Atlantic City offering 360-degree unobstructed Atlantic Ocean views, floor-to-ceiling soundproof Schuco glazing, private sky terrace, concierge, and independent IPP green power grid.',
  'CONDO', 'ACTIVE',
  145000000000, 65000000, 220000000, 1250000000,
  4, 4.5, 4600, 2022,
  'Ocean Parade, Eko Pearl Towers', 'Eko Atlantic City, Lagos', 'LA', '101241',
  '/images/properties/prop-2-main.jpg', '/images/properties/prop-2-alt.jpg',
  ST_SetSRID(ST_MakePoint(3.4070, 6.4180), 4326)
),
(
  'c0000000-0000-0000-0000-000000000003',
  'Bourne Smart Terrace Duplex',
  'Brand-new contemporary smart duplex along Lekki Phase 1 corridor featuring double-volume ceilings, private rooftop plunge pool, solar inverter hybrid system, motorized gate, and Italian fitted chef kitchen.',
  'TOWNHOUSE', 'ACTIVE',
  58000000000, 25000000, 95000000, 420000000,
  4, 4.5, 3200, 2024,
  'Admiralty Way', 'Lekki Phase 1, Lagos', 'LA', '105102',
  '/images/properties/prop-3-main.jpg', '/images/properties/prop-3-alt.jpg',
  ST_SetSRID(ST_MakePoint(3.4735, 6.4474), 4326)
),
(
  'c0000000-0000-0000-0000-000000000004',
  'Victoria Island Serviced Residence Block',
  'High-yield commercial multi-family residential asset with 6 luxury serviced apartments, rooftop executive lounge, Cummins dual generator backup, high corporate tenant occupancy history.',
  'MULTI_FAMILY', 'ACTIVE',
  420000000000, 120000000, 680000000, 3200000000,
  12, 14.0, 12000, 2021,
  'Ahmadu Bello Way', 'Victoria Island, Lagos', 'LA', '101241',
  '/images/properties/prop-4-main.jpg', '/images/properties/prop-4-alt.jpg',
  ST_SetSRID(ST_MakePoint(3.4219, 6.4281), 4326)
),
(
  'c0000000-0000-0000-0000-000000000005',
  'Old Ikoyi Colonial Heritage Mansion',
  'Prestige Bourdillon trophy residence set on 2,000sqm mature landscaped grounds with ancient mahogany trees, heated Olympic lap pool, cinema hall, bespoke wine cellar, and high-security diplomatic perimeter.',
  'SINGLE_FAMILY', 'ACTIVE',
  350000000000, 50000000, 520000000, 2200000000,
  5, 6.0, 7500, 2020,
  'Bourdillon Road', 'Old Ikoyi, Lagos', 'LA', '101233',
  '/images/properties/prop-5-main.jpg', '/images/properties/prop-5-alt.jpg',
  ST_SetSRID(ST_MakePoint(3.4350, 6.4520), 4326)
),
(
  'c0000000-0000-0000-0000-000000000006',
  'Signature Creek Waterfront Loft',
  'Chic metropolitan loft overlooking Five Cowries Creek and Lekki-Ikoyi Link Bridge, designer Poggenpohl kitchen, marble bathrooms, smart biometric entry, and rooftop helipad access.',
  'CONDO', 'ACTIVE',
  75000000000, 38000000, 110000000, 580000000,
  2, 2.5, 2100, 2023,
  'Ozumba Mbadiwe Avenue', 'Victoria Island, Lagos', 'LA', '101241',
  '/images/properties/prop-6-main.jpg', '/images/properties/prop-6-alt.jpg',
  ST_SetSRID(ST_MakePoint(3.4150, 6.4340), 4326)
),
(
  'c0000000-0000-0000-0000-000000000007',
  'Ikeja GRA Executive Secluded Villa',
  'Quiet leafy diplomatic avenue in historic Ikeja GRA with expansive manicured courtyard, swimming pool, perimeter CCTV, borehole water treatment plant, and 8 minutes to Murtala Muhammed International Airport.',
  'SINGLE_FAMILY', 'ACTIVE',
  110000000000, 30000000, 180000000, 750000000,
  5, 5.5, 5600, 2022,
  'Isaac John Street', 'Ikeja GRA, Lagos', 'LA', '100271',
  '/images/properties/prop-7-main.jpg', '/images/properties/prop-7-alt.jpg',
  ST_SetSRID(ST_MakePoint(3.3550, 6.5925), 4326)
),
(
  'c0000000-0000-0000-0000-000000000008',
  'Maitama Hills Diplomatic Villa',
  'Exclusive hilltop ambassadorial villa overlooking Aso Rock and the Abuja city skyline, bulletproof glazing, private elevator, subterranean parking for 8 cars, and lush cascading terrace gardens.',
  'SINGLE_FAMILY', 'ACTIVE',
  220000000000, 45000000, 380000000, 1500000000,
  6, 7.0, 7200, 2023,
  'Gana Street', 'Maitama District, Abuja', 'FCT', '900271',
  '/images/properties/prop-8-main.jpg', '/images/properties/prop-8-alt.jpg',
  ST_SetSRID(ST_MakePoint(7.4983, 9.0882), 4326)
);

-- Insert Initial Saved Portfolio Bookmark
INSERT INTO saved_portfolios (user_id, property_id, notes) VALUES
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Top tier Banana Island waterfront asset. Proximity to British International School & Corona Ikoyi.'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Strong candidate for Victoria Island corporate short-let rental cash flow. Gross yield projected > 9.1%.');
