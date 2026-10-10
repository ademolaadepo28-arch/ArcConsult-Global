-- Seed Data for Real Estate & Mortgages Analytics Portal

-- Clean existing data
TRUNCATE TABLE saved_portfolios CASCADE;
TRUNCATE TABLE schools CASCADE;
TRUNCATE TABLE properties CASCADE;
TRUNCATE TABLE users CASCADE;

-- Insert Demo User
INSERT INTO users (id, email, password_hash, full_name) VALUES
('a0000000-0000-0000-0000-000000000001', 'investor@arcconsult.com', '$2a$10$examplehashedpasswordhereforportfolio', 'Alexander Wright');

-- Insert Schools (Austin & Bay Area hubs)
INSERT INTO schools (id, name, rating, school_type, location) VALUES
('b0000000-0000-0000-0000-000000000001', 'Barton Hills Elementary', 9.2, 'Elementary', ST_SetSRID(ST_MakePoint(-97.7785, 30.2520), 4326)),
('b0000000-0000-0000-0000-000000000002', 'O. Henry Middle School', 8.7, 'Middle', ST_SetSRID(ST_MakePoint(-97.7710, 30.2790), 4326)),
('b0000000-0000-0000-0000-000000000003', 'Austin High School', 8.9, 'High', ST_SetSRID(ST_MakePoint(-97.7650, 30.2720), 4326)),
('b0000000-0000-0000-0000-000000000004', 'Zilker Elementary School', 9.5, 'Elementary', ST_SetSRID(ST_MakePoint(-97.7680, 30.2580), 4326)),
('b0000000-0000-0000-0000-000000000005', 'Westlake High School', 9.8, 'High', ST_SetSRID(ST_MakePoint(-97.8010, 30.2850), 4326)),
('b0000000-0000-0000-0000-000000000006', 'Highland Park Elementary', 9.1, 'Elementary', ST_SetSRID(ST_MakePoint(-97.7610, 30.3420), 4326));

-- Insert Diverse Properties
INSERT INTO properties (
  id, title, description, property_type, status,
  price_cents, estimated_hoa_monthly_cents, annual_property_tax_cents,
  bedrooms, bathrooms, square_feet, year_built,
  street_address, city, state, zip_code,
  image_url, alt_image_url, location
) VALUES
(
  'c0000000-0000-0000-0000-000000000001',
  'Modern Zilker Architectural Haven',
  'Sun-drenched contemporary craftsman with floor-to-ceiling glass, custom oak cabinetry, zero-scape gardens, and direct greenbelt trail access.',
  'SINGLE_FAMILY', 'ACTIVE',
  89500000, 0, 1420000,
  4, 3.5, 3150, 2021,
  '2104 Paramount Ave', 'Austin', 'TX', '78704',
  '/images/properties/prop-1-main.jpg', '/images/properties/prop-1-alt.jpg',
  ST_SetSRID(ST_MakePoint(-97.7694, 30.2543), 4326)
),
(
  'c0000000-0000-0000-0000-000000000002',
  'The Independent Sky Residence',
  'Luxury high-rise condo offering panoramic Lady Bird Lake views, quartz waterfall island, 24/7 concierge, and resort infinity pool.',
  'CONDO', 'ACTIVE',
  64500000, 78500, 1150000,
  2, 2.0, 1420, 2019,
  '301 West Ave Unit 3402', 'Austin', 'TX', '78701',
  '/images/properties/prop-2-main.jpg', '/images/properties/prop-2-alt.jpg',
  ST_SetSRID(ST_MakePoint(-97.7505, 30.2678), 4326)
),
(
  'c0000000-0000-0000-0000-000000000003',
  'Bouldin Creek Eco-Townhome',
  'Net-zero energy townhome featuring rooftop solar array, private plunge spa, EV charging garage, and walkable to iconic culinary row.',
  'TOWNHOUSE', 'ACTIVE',
  72500000, 29000, 1260000,
  3, 2.5, 2180, 2022,
  '908 S 3rd St Unit B', 'Austin', 'TX', '78704',
  '/images/properties/prop-3-main.jpg', '/images/properties/prop-3-alt.jpg',
  ST_SetSRID(ST_MakePoint(-97.7554, 30.2562), 4326)
),
(
  'c0000000-0000-0000-0000-000000000004',
  'Travis Heights Historic Quadplex',
  'High-yield multi-family asset with four fully leased boutique flats, private entries, vintage hardwood, and strong occupancy history.',
  'MULTI_FAMILY', 'ACTIVE',
  145000000, 0, 2480000,
  8, 6.0, 4800, 1968,
  '1412 Newning Ave', 'Austin', 'TX', '78704',
  '/images/properties/prop-4-main.jpg', '/images/properties/prop-4-alt.jpg',
  ST_SetSRID(ST_MakePoint(-97.7479, 30.2486), 4326)
),
(
  'c0000000-0000-0000-0000-000000000005',
  'Clarksville Historic Bungalow',
  'Restored 1920s classic bungalow in prime central Clarksville with wrap-around porch, designer lighting, and detached guest studio.',
  'SINGLE_FAMILY', 'ACTIVE',
  112000000, 0, 1950000,
  3, 2.0, 2450, 1928,
  '1608 Waterston Ave', 'Austin', 'TX', '78703',
  '/images/properties/prop-5-main.jpg', '/images/properties/prop-5-alt.jpg',
  ST_SetSRID(ST_MakePoint(-97.7601, 30.2789), 4326)
),
(
  'c0000000-0000-0000-0000-000000000006',
  'Seaholm Waterfront Loft',
  'Industrial chic loft in the historic Seaholm district featuring 14ft exposed concrete ceilings, Sub-Zero appliances, and private terrace.',
  'CONDO', 'ACTIVE',
  53500000, 62000, 940000,
  1, 1.5, 980, 2016,
  '222 West Ave Unit 1205', 'Austin', 'TX', '78701',
  '/images/properties/prop-6-main.jpg', '/images/properties/prop-6-alt.jpg',
  ST_SetSRID(ST_MakePoint(-97.7512, 30.2662), 4326)
),
(
  'c0000000-0000-0000-0000-000000000007',
  'Barton Hills Mid-Century Retreat',
  'Tucked into tranquil limestone bluffs with cedar tongue-and-groove ceilings, expansive canyon deck, and private access to Barton Creek.',
  'SINGLE_FAMILY', 'ACTIVE',
  98000000, 0, 1680000,
  4, 3.0, 3300, 1974,
  '2610 Barton Hills Dr', 'Austin', 'TX', '78704',
  '/images/properties/prop-7-main.jpg', '/images/properties/prop-7-alt.jpg',
  ST_SetSRID(ST_MakePoint(-97.7831, 30.2472), 4326)
),
(
  'c0000000-0000-0000-0000-000000000008',
  'Mueller Urban Townhome',
  'LEED Gold certified modern corner townhome overlooking tree-lined greenway, solar thermal water heating, and attached double garage.',
  'TOWNHOUSE', 'ACTIVE',
  59900000, 22000, 1020000,
  3, 2.5, 1950, 2020,
  '4112 Simond Ave', 'Austin', 'TX', '78723',
  '/images/properties/prop-8-main.jpg', '/images/properties/prop-8-alt.jpg',
  ST_SetSRID(ST_MakePoint(-97.7081, 30.2985), 4326)
);

-- Insert Initial Saved Portfolio Bookmark
INSERT INTO saved_portfolios (user_id, property_id, notes) VALUES
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Top candidate for family residence. Barton Hills Elementary rating 9.2.'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Strong candidate for 1031 exchange cash flow. Gross yield projected > 7.5%.');
