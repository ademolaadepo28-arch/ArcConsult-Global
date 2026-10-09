# Real Estate & Mortgages Analytics Portal (Architecture Spec #05)

A full-stack geospatial real estate discovery and financial analytics portal combining PostGIS spatial search, Leaflet marker clustering, Chart.js interactive amortization curves, and investor yield modeling.

---

## 🏗️ System Architecture

```
               ┌────────────────────────────────────────────────────────┐
               │                  React SPA Frontend                    │
               │   • Leaflet Map + MarkerClustering                     │
               │   • Chart.js (Amortization & Yield Projections)        │
               │   • Multi-param Spatial Search Drawer (BBox / Radius)  │
               └──────────────────────────┬─────────────────────────────┘
                                          │  REST API (Axios / JSON)
                                          ▼
               ┌────────────────────────────────────────────────────────┐
               │                 Express Node.js API                    │
               │   • Geospatial Query Engine (ST_DWithin, ST_Envelope)  │
               │   • Mortgage Amortizer (Integer precision cents math)  │
               │   • Investor Cap Rate & Cash-on-Cash Calculator        │
               │   • JWT Auth & Portfolio Management                    │
               └──────────────────────────┬─────────────────────────────┘
                                          │  pg Pool (SQL Queries)
                                          ▼
               ┌────────────────────────────────────────────────────────┐
               │                 PostgreSQL + PostGIS                   │
               │   • GEOMETRY(Point, 4326) spatial vector columns       │
               │   • GiST Spatial Indexes (idx_properties_location)     │
               │   • Spatial JOINs (properties ↔ schools)               │
               │   • Relational saved_portfolios table                  │
               └────────────────────────────────────────────────────────┘
```

---

## ⚡ Key Capabilities

1. **Sub-100ms PostGIS Bounding-Box & Radius Searches**:
   - Queries properties using spatial polygon bounding boxes (`ST_MakeEnvelope`) on map viewport movement.
   - Calculates geographic distance and proximity radius searches using `ST_DWithin` and `ST_Distance(geography, geography)`.
   - Spatial JOINs connecting individual properties with nearby elementary, middle, and high schools within 5km.

2. **Compound Interest Amortization Engine (Integer Precision)**:
   - Eliminates floating-point rounding drift by computing all monetary transactions strictly in integer USD cents (`Math.round`).
   - Formula:
     $$M = P \cdot \frac{i(1 + i)^n}{(1 + i)^n - 1}$$
   - Generates full 360-month schedules detailing monthly principal, interest, remaining balance, and cumulative payments.
   - Models PITI obligations including property taxes, HOA fees, and PMI (Private Mortgage Insurance when LTV > 80%).

3. **Real Estate Investor Yield Calculator**:
   - Computes Gross Rental Yield, Net Operating Income (NOI), Net Cap Rate, and Cash-on-Cash Return.
   - Simulates 10-year cumulative equity growth comparing property appreciation against mortgage principal paydown.

4. **Interactive Leaflet Map with Marker Clustering**:
   - Clustering of listings via `leaflet.markercluster`.
   - Custom styled price chips with pulsing focus rings and neighborhood school overlays.

5. **Saved Portfolios & Comparison Matrix**:
   - Bookmark properties to user portfolios.
   - Side-by-side financial comparison modal.
   - Instant CSV export of portfolio metrics.

---

## 🗄️ Relational Database Schema (DDL)

```sql
-- Enable Spatial GIS Extensions
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enum Types for Listings and Roles
CREATE TYPE property_type_enum AS ENUM ('SINGLE_FAMILY', 'CONDO', 'TOWNHOUSE', 'MULTI_FAMILY');
CREATE TYPE listing_status_enum AS ENUM ('ACTIVE', 'PENDING', 'SOLD');

-- Properties Table with Spatial Location Column
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  property_type property_type_enum NOT NULL DEFAULT 'SINGLE_FAMILY',
  status listing_status_enum NOT NULL DEFAULT 'ACTIVE',
  price_cents BIGINT NOT NULL,
  estimated_hoa_monthly_cents INT DEFAULT 0,
  annual_property_tax_cents INT NOT NULL,
  bedrooms INT NOT NULL,
  bathrooms NUMERIC(3,1) NOT NULL,
  square_feet INT NOT NULL,
  year_built INT,
  street_address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for Fast Geospatial Radius Queries
CREATE INDEX idx_properties_location ON properties USING GIST (location);
CREATE INDEX idx_properties_price ON properties (price_cents);

-- Schools Table for Neighborhood Scoring
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  rating NUMERIC(3,1) NOT NULL,
  school_type VARCHAR(50) NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL
);
CREATE INDEX idx_schools_location ON schools USING GIST (location);
```

---

## 🚀 Quickstart & Running Locally

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Run the Full Stack Application
```bash
npm run dev
```
- **React Frontend**: http://localhost:3000
- **Express Backend API**: http://localhost:5001

*Note: The backend includes an integrated in-memory PostGIS spatial engine, so the application runs immediately without requiring a local PostgreSQL instance. If a PostgreSQL instance with PostGIS is configured in `.env`, the server automatically connects and runs live SQL queries.*

### 3. Optional: Running PostGIS with Docker Compose
```bash
docker compose up -d
```

### 4. Running Unit Tests
```bash
npm run test:server
```
Runs mathematical validation tests on the mortgage engine ensuring exact integer cents precision and terminal zero balance reconciliation.
