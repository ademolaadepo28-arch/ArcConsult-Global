// config/database.js
const { Pool } = require('pg');
require('dotenv').config();

let pool = null;
let isConnectedToPostgres = false;

// In-Memory Seed Data (used when PostgreSQL / PostGIS is not locally configured)
const fallbackSchools = [
  { id: 'b0000000-0000-0000-0000-000000000001', name: 'British International School (BIS)', rating: 9.6, school_type: 'International Secondary', lng: 3.4420, lat: 6.4355 },
  { id: 'b0000000-0000-0000-0000-000000000002', name: 'Corona School Ikoyi', rating: 9.4, school_type: 'Primary / Elementary', lng: 3.4320, lat: 6.4550 },
  { id: 'b0000000-0000-0000-0000-000000000003', name: 'American International School of Lagos', rating: 9.8, school_type: 'International K-12', lng: 3.4390, lat: 6.4320 },
  { id: 'b0000000-0000-0000-0000-000000000004', name: 'Lekki British International School', rating: 9.2, school_type: 'Secondary / High', lng: 3.4780, lat: 6.4460 },
  { id: 'b0000000-0000-0000-0000-000000000005', name: 'Grange School Ikeja GRA', rating: 9.5, school_type: 'International K-12', lng: 3.3580, lat: 6.5890 },
  { id: 'b0000000-0000-0000-0000-000000000006', name: "Children's International School (CIS)", rating: 9.3, school_type: 'Elementary / Middle', lng: 3.4850, lat: 6.4390 },
  { id: 'b0000000-0000-0000-0000-000000000007', name: 'The Regent College Maitama', rating: 9.7, school_type: 'International Sixth Form', lng: 7.4890, lat: 9.0850 }
];

const fallbackProperties = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    title: 'Banana Island Ultra-Waterfront Villa',
    description: 'Spectacular contemporary waterfront estate in private gated Banana Island featuring private yacht slipway, infinity pool overlooking Lagos Lagoon, automated smart home automation, Olympic gym, and detached twin staff quarters.',
    property_type: 'SINGLE_FAMILY',
    status: 'ACTIVE',
    price_cents: 285000000000, // ₦2,850,000,000 in kobo
    estimated_hoa_monthly_cents: 85000000, // ₦850,000/mo Estate Service Charge
    annual_property_tax_cents: 450000000, // ₦4,500,000/yr Lagos Land Use Charge
    bedrooms: 6,
    bathrooms: 7.5,
    square_feet: 8400,
    year_built: 2023,
    street_address: 'Zone L Close 204, Banana Island',
    city: 'Ikoyi, Lagos',
    state: 'LA',
    zip_code: '101233',
    lng: 3.4475,
    lat: 6.4635,
    estimated_monthly_rent_cents: 1800000000, // ₦18,000,000/mo
    image_url: '/images/properties/prop-1-main.jpg',
    alt_image_url: '/images/properties/prop-1-alt.jpg'
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    title: 'Eko Pearl Azure Penthouse',
    description: 'Super-penthouse atop Eko Atlantic City offering 360-degree unobstructed Atlantic Ocean views, floor-to-ceiling soundproof Schuco glazing, private sky terrace, concierge, and independent IPP green power grid.',
    property_type: 'CONDO',
    status: 'ACTIVE',
    price_cents: 145000000000, // ₦1,450,000,000
    estimated_hoa_monthly_cents: 65000000, // ₦650,000/mo
    annual_property_tax_cents: 220000000, // ₦2,200,000/yr
    bedrooms: 4,
    bathrooms: 4.5,
    square_feet: 4600,
    year_built: 2022,
    street_address: 'Ocean Parade, Eko Pearl Towers',
    city: 'Eko Atlantic City, Lagos',
    state: 'LA',
    zip_code: '101241',
    lng: 3.4070,
    lat: 6.4180,
    estimated_monthly_rent_cents: 1250000000, // ₦12,500,000/mo
    image_url: '/images/properties/prop-2-main.jpg',
    alt_image_url: '/images/properties/prop-2-alt.jpg'
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    title: 'Bourne Smart Terrace Duplex',
    description: 'Brand-new contemporary smart duplex along Lekki Phase 1 corridor featuring double-volume ceilings, private rooftop plunge pool, solar inverter hybrid system, motorized gate, and Italian fitted chef kitchen.',
    property_type: 'TOWNHOUSE',
    status: 'ACTIVE',
    price_cents: 58000000000, // ₦580,000,000
    estimated_hoa_monthly_cents: 25000000, // ₦250,000/mo
    annual_property_tax_cents: 95000000, // ₦950,000/yr
    bedrooms: 4,
    bathrooms: 4.5,
    square_feet: 3200,
    year_built: 2024,
    street_address: 'Admiralty Way',
    city: 'Lekki Phase 1, Lagos',
    state: 'LA',
    zip_code: '105102',
    lng: 3.4735,
    lat: 6.4474,
    estimated_monthly_rent_cents: 420000000, // ₦4,200,000/mo
    image_url: '/images/properties/prop-3-main.jpg',
    alt_image_url: '/images/properties/prop-3-alt.jpg'
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    title: 'Victoria Island Serviced Residence Block',
    description: 'High-yield commercial multi-family residential asset with 6 luxury serviced apartments, rooftop executive lounge, Cummins dual generator backup, high corporate tenant occupancy history.',
    property_type: 'MULTI_FAMILY',
    status: 'ACTIVE',
    price_cents: 420000000000, // ₦4,200,000,000
    estimated_hoa_monthly_cents: 120000000, // ₦1,200,000/mo
    annual_property_tax_cents: 680000000, // ₦6,800,000/yr
    bedrooms: 12,
    bathrooms: 14.0,
    square_feet: 12000,
    year_built: 2021,
    street_address: 'Ahmadu Bello Way',
    city: 'Victoria Island, Lagos',
    state: 'LA',
    zip_code: '101241',
    lng: 3.4219,
    lat: 6.4281,
    estimated_monthly_rent_cents: 3200000000, // ₦32,000,000/mo
    image_url: '/images/properties/prop-4-main.jpg',
    alt_image_url: '/images/properties/prop-4-alt.jpg'
  },
  {
    id: 'c0000000-0000-0000-0000-000000000005',
    title: 'Old Ikoyi Colonial Heritage Mansion',
    description: 'Prestige Bourdillon trophy residence set on 2,000sqm mature landscaped grounds with ancient mahogany trees, heated Olympic lap pool, cinema hall, bespoke wine cellar, and high-security diplomatic perimeter.',
    property_type: 'SINGLE_FAMILY',
    status: 'ACTIVE',
    price_cents: 350000000000, // ₦3,500,000,000
    estimated_hoa_monthly_cents: 50000000, // ₦500,000/mo
    annual_property_tax_cents: 520000000, // ₦5,200,000/yr
    bedrooms: 5,
    bathrooms: 6.0,
    square_feet: 7500,
    year_built: 2020,
    street_address: 'Bourdillon Road',
    city: 'Old Ikoyi, Lagos',
    state: 'LA',
    zip_code: '101233',
    lng: 3.4350,
    lat: 6.4520,
    estimated_monthly_rent_cents: 2200000000, // ₦22,000,000/mo
    image_url: '/images/properties/prop-5-main.jpg',
    alt_image_url: '/images/properties/prop-5-alt.jpg'
  },
  {
    id: 'c0000000-0000-0000-0000-000000000006',
    title: 'Signature Creek Waterfront Loft',
    description: 'Chic metropolitan loft overlooking Five Cowries Creek and Lekki-Ikoyi Link Bridge, designer Poggenpohl kitchen, marble bathrooms, smart biometric entry, and rooftop helipad access.',
    property_type: 'CONDO',
    status: 'ACTIVE',
    price_cents: 75000000000, // ₦750,000,000
    estimated_hoa_monthly_cents: 38000000, // ₦380,000/mo
    annual_property_tax_cents: 110000000, // ₦1,100,000/yr
    bedrooms: 2,
    bathrooms: 2.5,
    square_feet: 2100,
    year_built: 2023,
    street_address: 'Ozumba Mbadiwe Avenue',
    city: 'Victoria Island, Lagos',
    state: 'LA',
    zip_code: '101241',
    lng: 3.4150,
    lat: 6.4340,
    estimated_monthly_rent_cents: 580000000, // ₦5,800,000/mo
    image_url: '/images/properties/prop-6-main.jpg',
    alt_image_url: '/images/properties/prop-6-alt.jpg'
  },
  {
    id: 'c0000000-0000-0000-0000-000000000007',
    title: 'Ikeja GRA Executive Secluded Villa',
    description: 'Quiet leafy diplomatic avenue in historic Ikeja GRA with expansive manicured courtyard, swimming pool, perimeter CCTV, borehole water treatment plant, and 8 minutes to Murtala Muhammed International Airport.',
    property_type: 'SINGLE_FAMILY',
    status: 'ACTIVE',
    price_cents: 110000000000, // ₦1,100,000,000
    estimated_hoa_monthly_cents: 30000000, // ₦300,000/mo
    annual_property_tax_cents: 180000000, // ₦1,800,000/yr
    bedrooms: 5,
    bathrooms: 5.5,
    square_feet: 5600,
    year_built: 2022,
    street_address: 'Isaac John Street',
    city: 'Ikeja GRA, Lagos',
    state: 'LA',
    zip_code: '100271',
    lng: 3.3550,
    lat: 6.5925,
    estimated_monthly_rent_cents: 750000000, // ₦7,500,000/mo
    image_url: '/images/properties/prop-7-main.jpg',
    alt_image_url: '/images/properties/prop-7-alt.jpg'
  },
  {
    id: 'c0000000-0000-0000-0000-000000000008',
    title: 'Maitama Hills Diplomatic Villa',
    description: 'Exclusive hilltop ambassadorial villa overlooking Aso Rock and the Abuja city skyline, bulletproof glazing, private elevator, subterranean parking for 8 cars, and lush cascading terrace gardens.',
    property_type: 'SINGLE_FAMILY',
    status: 'ACTIVE',
    price_cents: 220000000000, // ₦2,200,000,000
    estimated_hoa_monthly_cents: 45000000, // ₦450,000/mo
    annual_property_tax_cents: 380000000, // ₦3,800,000/yr Ground Rent
    bedrooms: 6,
    bathrooms: 7.0,
    square_feet: 7200,
    year_built: 2023,
    street_address: 'Gana Street',
    city: 'Maitama District, Abuja',
    state: 'FCT',
    zip_code: '900271',
    lng: 7.4983,
    lat: 9.0882,
    estimated_monthly_rent_cents: 1500000000, // ₦15,000,000/mo
    image_url: '/images/properties/prop-8-main.jpg',
    alt_image_url: '/images/properties/prop-8-alt.jpg'
  }
];

const fallbackPortfolios = new Map();
// Pre-populate demo portfolio
fallbackPortfolios.set('a0000000-0000-0000-0000-000000000001:c0000000-0000-0000-0000-000000000001', {
  user_id: 'a0000000-0000-0000-0000-000000000001',
  property_id: 'c0000000-0000-0000-0000-000000000001',
  notes: 'Top tier Banana Island waterfront asset. Proximity to British International School & Corona Ikoyi.',
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
