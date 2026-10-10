-- Enable Spatial GIS Extensions
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enum Types for Listings and Roles
DO $$ BEGIN
    CREATE TYPE property_type_enum AS ENUM ('SINGLE_FAMILY', 'CONDO', 'TOWNHOUSE', 'MULTI_FAMILY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE listing_status_enum AS ENUM ('ACTIVE', 'PENDING', 'SOLD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Properties Table with Spatial Location Column
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  property_type property_type_enum NOT NULL DEFAULT 'SINGLE_FAMILY',
  status listing_status_enum NOT NULL DEFAULT 'ACTIVE',
  -- Integer Financial Fields (stored in USD cents)
  price_cents BIGINT NOT NULL,
  estimated_hoa_monthly_cents INT DEFAULT 0,
  annual_property_tax_cents INT NOT NULL,
  -- Physical Attributes
  bedrooms INT NOT NULL,
  bathrooms NUMERIC(3,1) NOT NULL,
  square_feet INT NOT NULL,
  year_built INT,
  -- Address and Spatial Geometry
  street_address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  image_url VARCHAR(500),
  alt_image_url VARCHAR(500),
  location GEOMETRY(Point, 4326) NOT NULL, -- WGS 84 Coordinates
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for Fast Geospatial Radius Queries
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties (price_cents);

-- Schools Table for Neighborhood Scoring
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  rating NUMERIC(3,1) NOT NULL, -- Scale 1.0 to 10.0
  school_type VARCHAR(50) NOT NULL, -- 'Elementary', 'High', etc.
  location GEOMETRY(Point, 4326) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_schools_location ON schools USING GIST (location);

-- User Saved Property Portfolios (Many-to-Many Relationship)
CREATE TABLE IF NOT EXISTS saved_portfolios (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  notes TEXT,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, property_id)
);
