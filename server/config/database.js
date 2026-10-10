// config/database.js
const { Pool } = require('pg');
require('dotenv').config();

let pool = null;
let isConnectedToPostgres = false;

// In-Memory Seed Data (used when PostgreSQL / PostGIS is not locally configured)
const fallbackSchools = [
  { id: 'b0000000-0000-0000-0000-000000000001', name: 'Barton Hills Elementary', rating: 9.2, school_type: 'Elementary', lng: -97.7785, lat: 30.2520 },
  { id: 'b0000000-0000-0000-0000-000000000002', name: 'O. Henry Middle School', rating: 8.7, school_type: 'Middle', lng: -97.7710, lat: 30.2790 },
  { id: 'b0000000-0000-0000-0000-000000000003', name: 'Austin High School', rating: 8.9, school_type: 'High', lng: -97.7650, lat: 30.2720 },
  { id: 'b0000000-0000-0000-0000-000000000004', name: 'Zilker Elementary School', rating: 9.5, school_type: 'Elementary', lng: -97.7680, lat: 30.2580 },
  { id: 'b0000000-0000-0000-0000-000000000005', name: 'Westlake High School', rating: 9.8, school_type: 'High', lng: -97.8010, lat: 30.2850 },
  { id: 'b0000000-0000-0000-0000-000000000006', name: 'Highland Park Elementary', rating: 9.1, school_type: 'Elementary', lng: -97.7610, lat: 30.3420 }
];

const fallbackProperties = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    title: 'Modern Zilker Architectural Haven',
    description: 'Sun-drenched contemporary craftsman with floor-to-ceiling glass, custom oak cabinetry, zero-scape gardens, and direct greenbelt trail access.',
    property_type: 'SINGLE_FAMILY',
    status: 'ACTIVE',
    price_cents: 89500000,
    estimated_hoa_monthly_cents: 0,
    annual_property_tax_cents: 1420000,
    bedrooms: 4,
    bathrooms: 3.5,
    square_feet: 3150,
    year_built: 2021,
    street_address: '2104 Paramount Ave',
    city: 'Austin',
    state: 'TX',
    zip_code: '78704',
    lng: -97.7694,
    lat: 30.2543,
    estimated_monthly_rent_cents: 520000,
    image_url: '/images/properties/prop-1-main.jpg',
    alt_image_url: '/images/properties/prop-1-alt.jpg'
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    title: 'The Independent Sky Residence',
    description: 'Luxury high-rise condo offering panoramic Lady Bird Lake views, quartz waterfall island, 24/7 concierge, and resort infinity pool.',
    property_type: 'CONDO',
    status: 'ACTIVE',
    price_cents: 64500000,
    estimated_hoa_monthly_cents: 78500,
    annual_property_tax_cents: 1150000,
    bedrooms: 2,
    bathrooms: 2.0,
    square_feet: 1420,
    year_built: 2019,
    street_address: '301 West Ave Unit 3402',
    city: 'Austin',
    state: 'TX',
    zip_code: '78701',
    lng: -97.7505,
    lat: 30.2678,
    estimated_monthly_rent_cents: 430000,
    image_url: '/images/properties/prop-2-main.jpg',
    alt_image_url: '/images/properties/prop-2-alt.jpg'
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    title: 'Bouldin Creek Eco-Townhome',
    description: 'Net-zero energy townhome featuring rooftop solar array, private plunge spa, EV charging garage, and walkable to iconic culinary row.',
    property_type: 'TOWNHOUSE',
    status: 'ACTIVE',
    price_cents: 72500000,
    estimated_hoa_monthly_cents: 29000,
    annual_property_tax_cents: 1260000,
    bedrooms: 3,
    bathrooms: 2.5,
    square_feet: 2180,
    year_built: 2022,
    street_address: '908 S 3rd St Unit B',
    city: 'Austin',
    state: 'TX',
    zip_code: '78704',
    lng: -97.7554,
    lat: 30.2562,
    estimated_monthly_rent_cents: 480000,
    image_url: '/images/properties/prop-3-main.jpg',
    alt_image_url: '/images/properties/prop-3-alt.jpg'
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    title: 'Travis Heights Historic Quadplex',
    description: 'High-yield multi-family asset with four fully leased boutique flats, private entries, vintage hardwood, and strong occupancy history.',
    property_type: 'MULTI_FAMILY',
    status: 'ACTIVE',
    price_cents: 145000000,
    estimated_hoa_monthly_cents: 0,
    annual_property_tax_cents: 2480000,
    bedrooms: 8,
    bathrooms: 6.0,
    square_feet: 4800,
    year_built: 1968,
    street_address: '1412 Newning Ave',
    city: 'Austin',
    state: 'TX',
    zip_code: '78704',
    lng: -97.7479,
    lat: 30.2486,
    estimated_monthly_rent_cents: 950000,
    image_url: '/images/properties/prop-4-main.jpg',
    alt_image_url: '/images/properties/prop-4-alt.jpg'
  },
  {
    id: 'c0000000-0000-0000-0000-000000000005',
    title: 'Clarksville Historic Bungalow',
    description: 'Restored 1920s classic bungalow in prime central Clarksville with wrap-around porch, designer lighting, and detached guest studio.',
    property_type: 'SINGLE_FAMILY',
    status: 'ACTIVE',
    price_cents: 112000000,
    estimated_hoa_monthly_cents: 0,
    annual_property_tax_cents: 1950000,
    bedrooms: 3,
    bathrooms: 2.0,
    square_feet: 2450,
    year_built: 1928,
    street_address: '1608 Waterston Ave',
    city: 'Austin',
    state: 'TX',
    zip_code: '78703',
    lng: -97.7601,
    lat: 30.2789,
    estimated_monthly_rent_cents: 640000,
    image_url: '/images/properties/prop-5-main.jpg',
    alt_image_url: '/images/properties/prop-5-alt.jpg'
  },
  {
    id: 'c0000000-0000-0000-0000-000000000006',
    title: 'Seaholm Waterfront Loft',
    description: 'Industrial chic loft in the historic Seaholm district featuring 14ft exposed concrete ceilings, Sub-Zero appliances, and private terrace.',
    property_type: 'CONDO',
    status: 'ACTIVE',
    price_cents: 53500000,
    estimated_hoa_monthly_cents: 62000,
    annual_property_tax_cents: 940000,
    bedrooms: 1,
    bathrooms: 1.5,
    square_feet: 980,
    year_built: 2016,
    street_address: '222 West Ave Unit 1205',
    city: 'Austin',
    state: 'TX',
    zip_code: '78701',
    lng: -97.7512,
    lat: 30.2662,
    estimated_monthly_rent_cents: 340000,
    image_url: '/images/properties/prop-6-main.jpg',
    alt_image_url: '/images/properties/prop-6-alt.jpg'
  },
  {
    id: 'c0000000-0000-0000-0000-000000000007',
    title: 'Barton Hills Mid-Century Retreat',
    description: 'Tucked into tranquil limestone bluffs with cedar tongue-and-groove ceilings, expansive canyon deck, and private access to Barton Creek.',
    property_type: 'SINGLE_FAMILY',
    status: 'ACTIVE',
    price_cents: 98000000,
    estimated_hoa_monthly_cents: 0,
    annual_property_tax_cents: 1680000,
    bedrooms: 4,
    bathrooms: 3.0,
    square_feet: 3300,
    year_built: 1974,
    street_address: '2610 Barton Hills Dr',
    city: 'Austin',
    state: 'TX',
    zip_code: '78704',
    lng: -97.7831,
    lat: 30.2472,
    estimated_monthly_rent_cents: 580000,
    image_url: '/images/properties/prop-7-main.jpg',
    alt_image_url: '/images/properties/prop-7-alt.jpg'
  },
  {
    id: 'c0000000-0000-0000-0000-000000000008',
    title: 'Mueller Urban Townhome',
    description: 'LEED Gold certified modern corner townhome overlooking tree-lined greenway, solar thermal water heating, and attached double garage.',
    property_type: 'TOWNHOUSE',
    status: 'ACTIVE',
    price_cents: 59900000,
    estimated_hoa_monthly_cents: 22000,
    annual_property_tax_cents: 1020000,
    bedrooms: 3,
    bathrooms: 2.5,
    square_feet: 1950,
    year_built: 2020,
    street_address: '4112 Simond Ave',
    city: 'Austin',
    state: 'TX',
    zip_code: '78723',
    lng: -97.7081,
    lat: 30.2985,
    estimated_monthly_rent_cents: 380000,
    image_url: '/images/properties/prop-8-main.jpg',
    alt_image_url: '/images/properties/prop-8-alt.jpg'
  }
];

const fallbackPortfolios = new Map();
// Pre-populate demo portfolio
fallbackPortfolios.set('a0000000-0000-0000-0000-000000000001:c0000000-0000-0000-0000-000000000001', {
  user_id: 'a0000000-0000-0000-0000-000000000001',
  property_id: 'c0000000-0000-0000-0000-000000000001',
  notes: 'Top candidate for family residence. Barton Hills Elementary rating 9.2.',
  saved_at: new Date().toISOString()
});

async function initDatabase() {
  if (process.env.DATABASE_URL || process.env.PGHOST) {
    try {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL || `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || 'postgres'}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'realestate'}`
      });
      const client = await pool.connect();
      const res = await client.query('SELECT postgis_version()');
      client.release();
      isConnectedToPostgres = true;
      console.log(`[Database] Connected to PostgreSQL with PostGIS ${res.rows[0].postgis_version}`);
    } catch (err) {
      console.warn(`[Database] PostgreSQL connection failed (${err.message}). Using In-Memory PostGIS Engine with full spatial vector capability.`);
      isConnectedToPostgres = false;
    }
  } else {
    console.log('[Database] No DATABASE_URL specified. Running In-Memory PostGIS Engine for development.');
    isConnectedToPostgres = false;
  }
}

function getDatabaseStatus() {
  return {
    isPostgres: isConnectedToPostgres,
    engine: isConnectedToPostgres ? 'PostgreSQL + PostGIS (Active)' : 'In-Memory PostGIS Spatial Engine',
    totalProperties: fallbackProperties.length,
    totalSchools: fallbackSchools.length
  };
}

module.exports = {
  initDatabase,
  getDatabaseStatus,
  getPool: () => pool,
  isConnectedToPostgres: () => isConnectedToPostgres,
  fallbackProperties,
  fallbackSchools,
  fallbackPortfolios
};
