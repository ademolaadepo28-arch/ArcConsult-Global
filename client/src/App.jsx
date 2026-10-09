// App.jsx
import React, { useState, useEffect } from 'react';
import PropertyMap from './components/map/PropertyMap';
import FilterDrawer from './components/filters/FilterDrawer';
import AmortizationChart from './components/analytics/AmortizationChart';
import YieldBreakdown from './components/analytics/YieldBreakdown';
import SchoolMetricsBadge from './components/schools/SchoolMetricsBadge';
import PortfolioComparisonModal from './components/portfolio/PortfolioComparisonModal';
import { useSpatialSearch } from './hooks/useSpatialSearch';
import { propertyApi, analyticsApi, portfolioApi } from './services/api';
import {
  Building2,
  Bookmark,
  BookmarkCheck,
  Layers,
  ChevronRight,
  Calculator,
  Compass,
  DollarSign,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react';

export default function App() {
  const {
    properties,
    loading,
    error,
    executionTimeMs,
    engineInfo,
    filters,
    searchMode,
    radiusMeters,
    centerCoords,
    setSearchMode,
    setRadiusMeters,
    setBounds,
    updateFilters,
    refetch
  } = useSpatialSearch();

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [allSchools, setAllSchools] = useState([]);
  const [savedPortfolios, setSavedPortfolios] = useState([]);

  // Amortization simulation state
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [annualRate, setAnnualRate] = useState(6.5);
  const [loanYears, setLoanYears] = useState(30);
  const [extraMonthlyPrincipalUsd, setExtraMonthlyPrincipalUsd] = useState(0);
  const [amortizationData, setAmortizationData] = useState(null);

  // Investment simulation state
  const [estimatedRentUsd, setEstimatedRentUsd] = useState(4800);
  const [appreciationPercent, setAppreciationPercent] = useState(3.5);
  const [vacancyPercent, setVacancyPercent] = useState(5);
  const [yieldData, setYieldData] = useState(null);

  // Comparison modal state
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [comparisonResults, setComparisonResults] = useState([]);

  // Active analytics tab: 'MORTGAGE' | 'YIELD' | 'SCHOOLS'
  const [activeInspectorTab, setActiveInspectorTab] = useState('MORTGAGE');

  // Load all schools on mount
  useEffect(() => {
    propertyApi.getSchools().then((res) => {
      setAllSchools(res.schools || []);
    }).catch(console.error);

    portfolioApi.getSavedPortfolios().then((res) => {
      setSavedPortfolios(res.portfolio || []);
    }).catch(console.error);
  }, []);

  // Set default selected property once properties arrive
  useEffect(() => {
    if (properties.length > 0 && !selectedProperty) {
      handleSelectProperty(properties[0]);
    }
  }, [properties]);

  // Load single property details + spatial join schools when selected
  const handleSelectProperty = async (prop) => {
    setSelectedProperty(prop);
    try {
      const data = await propertyApi.getPropertyDetails(prop.id);
      setPropertyDetails(data);
      if (prop.estimated_monthly_rent_cents) {
        setEstimatedRentUsd(prop.estimated_monthly_rent_cents / 100);
      }
    } catch (err) {
      console.error('Failed to load property details:', err);
    }
  };

  // Recalculate amortization whenever property or mortgage parameters change
  useEffect(() => {
    if (!selectedProperty) return;

    analyticsApi.calculateAmortization({
      priceCents: selectedProperty.price_cents,
      downPaymentPercent,
      annualRate,
      loanYears,
      annualPropertyTaxCents: selectedProperty.annual_property_tax_cents,
      estimatedHoaMonthlyCents: selectedProperty.estimated_hoa_monthly_cents,
      extraMonthlyPrincipalCents: Math.round(extraMonthlyPrincipalUsd * 100)
    }).then(setAmortizationData).catch(console.error);
  }, [selectedProperty, downPaymentPercent, annualRate, loanYears, extraMonthlyPrincipalUsd]);

  // Recalculate investment yields whenever property or investor params change
  useEffect(() => {
    if (!selectedProperty) return;

    analyticsApi.calculateInvestment({
      purchasePriceCents: selectedProperty.price_cents,
      estimatedMonthlyRentCents: Math.round(estimatedRentUsd * 100),
      annualPropertyTaxCents: selectedProperty.annual_property_tax_cents,
      monthlyHoaCents: selectedProperty.estimated_hoa_monthly_cents,
      downPaymentPercent,
      annualRate,
      loanYears,
      annualAppreciationPercent: appreciationPercent,
      vacancyRatePercent: vacancyPercent
    }).then(setYieldData).catch(console.error);
  }, [selectedProperty, estimatedRentUsd, downPaymentPercent, annualRate, loanYears, appreciationPercent, vacancyPercent]);

  // Toggle bookmark property
  const handleToggleBookmark = async (propertyId) => {
    try {
      await portfolioApi.toggleSaveProperty(propertyId);
      const res = await portfolioApi.getSavedPortfolios();
      setSavedPortfolios(res.portfolio || []);
    } catch (err) {
      console.error('Bookmark toggle error:', err);
    }
  };

  const isBookmarked = (id) => savedPortfolios.some((p) => p.property_id === id || p.id === id);

  // Open comparison modal
  const handleOpenComparison = async () => {
    const idsToCompare = savedPortfolios.length > 0
      ? savedPortfolios.map((p) => p.property_id || p.id)
      : properties.slice(0, 3).map((p) => p.id);

    try {
      const res = await analyticsApi.compareProperties(idsToCompare);
      setComparisonResults(res.comparisons || []);
      setIsCompareOpen(true);
    } catch (err) {
      console.error('Comparison error:', err);
    }
  };

  const handleMortgageParamChange = (param, value) => {
    if (param === 'downPaymentPercent') setDownPaymentPercent(value);
    if (param === 'annualRate') setAnnualRate(value);
    if (param === 'loanYears') setLoanYears(value);
    if (param === 'extraMonthlyPrincipalUsd') setExtraMonthlyPrincipalUsd(value);
  };

  const handleYieldParamChange = (param, value) => {
    if (param === 'estimatedRentUsd') setEstimatedRentUsd(value);
    if (param === 'appreciationPercent') setAppreciationPercent(value);
    if (param === 'vacancyPercent') setVacancyPercent(value);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      {/* Top Luxury Navigation Header */}
      <header className="sticky top-0 z-[1500] bg-[#090d15]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-[#090d15] rounded-[10px] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight font-heading">
                ArcConsult <span className="gradient-text-emerald">Analytics Portal</span>
              </h1>
              <span className="hidden sm:inline-block badge-tag badge-emerald font-mono text-[10px]">
                Spec #05
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Geospatial Vector Discovery • PostGIS Spatial Engine • Mortgage Amortization & Yield Modeling
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Spatial Performance HUD */}
          <div className="hidden md:flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300 font-mono text-[11px]">{properties.length} Listings</span>
            <span className="text-white/20">|</span>
            <span className="text-emerald-400 font-mono font-bold text-[11px]">{executionTimeMs}ms</span>
          </div>

          {/* Compare Saved Button */}
          <button
            onClick={handleOpenComparison}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-2 hover:border-emerald-500/40"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Compare ({savedPortfolios.length})</span>
          </button>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1680px] w-full mx-auto">
        {/* Left Column: Leaflet Map & Search Filters (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Leaflet Map Card */}
          <div className="h-[460px] sm:h-[500px] w-full">
            <PropertyMap
              properties={properties}
              selectedProperty={selectedProperty}
              onSelectProperty={handleSelectProperty}
              onBoundsChange={setBounds}
              searchMode={searchMode}
              radiusMeters={radiusMeters}
              centerCoords={centerCoords}
              schools={allSchools}
              executionTimeMs={executionTimeMs}
              engineInfo={engineInfo}
            />
          </div>

          {/* Spatial Search Controls Drawer */}
          <FilterDrawer
            filters={filters}
            onFilterChange={updateFilters}
            searchMode={searchMode}
            onSearchModeChange={setSearchMode}
            radiusMeters={radiusMeters}
            onRadiusChange={setRadiusMeters}
            totalResults={properties.length}
            onReset={() => updateFilters({ minPrice: '', maxPrice: '', minBeds: '', propertyType: 'ALL' })}
          />

          {/* Horizontal Scrollable Listing Cards Preview */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-slate-300">
                Visible Map Properties ({properties.length})
              </span>
              <span>Click to inspect financial model</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
              {properties.map((prop) => {
                const isSelected = selectedProperty?.id === prop.id;
                const bookmarked = isBookmarked(prop.id);

                return (
                  <div
                    key={prop.id}
                    onClick={() => handleSelectProperty(prop)}
                    className={`glass-card-interactive p-4 flex flex-col justify-between gap-3 ${
                      isSelected ? 'glass-card-selected' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="badge-tag badge-cyan mb-1.5 text-[10px]">
                          {prop.property_type.replace('_', ' ')}
                        </span>
                        <h4 className="text-sm font-bold text-white leading-snug line-clamp-1">
                          {prop.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-1">{prop.street_address}</p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleBookmark(prop.id);
                        }}
                        className={`p-1.5 rounded-lg border transition-all ${
                          bookmarked
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                        title={bookmarked ? 'Remove from Saved Portfolio' : 'Bookmark to Portfolio'}
                      >
                        {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="text-base font-extrabold text-emerald-400 font-mono">
                        ${(prop.price_cents / 100).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{prop.bedrooms} bd</span>
                        <span>•</span>
                        <span>{prop.bathrooms} ba</span>
                        <span>•</span>
                        <span>{prop.square_feet} sqft</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Property & Financial Analytics Inspector (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {selectedProperty ? (
            <>
              {/* Selected Property Header Hero Card */}
              <div className="glass-panel p-5 flex flex-col gap-4 border-l-4 border-l-emerald-500">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge-tag badge-emerald text-[10px]">
                        {selectedProperty.status}
                      </span>
                      <span className="badge-tag badge-cyan text-[10px]">
                        {selectedProperty.property_type.replace('_', ' ')}
                      </span>
                    </div>
                    <h2 className="text-xl font-extrabold text-white">
                      {selectedProperty.title}
                    </h2>
                    <p className="text-xs text-slate-300">
                      {selectedProperty.street_address}, {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zip_code}
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleBookmark(selectedProperty.id)}
                    className={`btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 ${
                      isBookmarked(selectedProperty.id) ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' : ''
                    }`}
                  >
                    {isBookmarked(selectedProperty.id) ? (
                      <>
                        <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                        <span>Bookmarked</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4 text-slate-400" />
                        <span>Bookmark</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {selectedProperty.description}
                </p>

                {/* Property Specification Chips */}
                <div className="grid grid-cols-4 gap-2 bg-slate-950/60 p-3 rounded-xl border border-white/5 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Price</span>
                    <span className="font-extrabold text-emerald-400 font-mono text-sm">
                      ${(selectedProperty.price_cents / 100).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Beds / Baths</span>
                    <span className="font-bold text-white">
                      {selectedProperty.bedrooms} / {selectedProperty.bathrooms}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">SqFt</span>
                    <span className="font-bold text-white">
                      {selectedProperty.square_feet.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Built</span>
                    <span className="font-bold text-white">{selectedProperty.year_built || '—'}</span>
                  </div>
                </div>

                {/* HOA and Annual Property Tax */}
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>
                    Est. HOA: <strong className="text-slate-200">${(selectedProperty.estimated_hoa_monthly_cents / 100).toLocaleString()}/mo</strong>
                  </span>
                  <span>
                    Annual Taxes: <strong className="text-slate-200">${(selectedProperty.annual_property_tax_cents / 100).toLocaleString()}/yr</strong>
                  </span>
                </div>
              </div>

              {/* Inspector Navigation Tabs */}
              <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-white/10 text-xs">
                <button
                  onClick={() => setActiveInspectorTab('MORTGAGE')}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activeInspectorTab === 'MORTGAGE'
                      ? 'bg-emerald-500 text-slate-950 shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Mortgage Amortization</span>
                </button>
                <button
                  onClick={() => setActiveInspectorTab('YIELD')}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activeInspectorTab === 'YIELD'
                      ? 'bg-emerald-500 text-slate-950 shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Investor Yield & Cap</span>
                </button>
                <button
                  onClick={() => setActiveInspectorTab('SCHOOLS')}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activeInspectorTab === 'SCHOOLS'
                      ? 'bg-emerald-500 text-slate-950 shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Schools Spatial Join</span>
                </button>
              </div>

              {/* Inspector Content Panel */}
              {activeInspectorTab === 'MORTGAGE' && (
                <AmortizationChart
                  amortizationData={amortizationData}
                  onParamChange={handleMortgageParamChange}
                  propertyPriceUsd={selectedProperty.price_cents / 100}
                  downPaymentPercent={downPaymentPercent}
                  annualRate={annualRate}
                  loanYears={loanYears}
                  extraMonthlyPrincipalUsd={extraMonthlyPrincipalUsd}
                />
              )}

              {activeInspectorTab === 'YIELD' && (
                <YieldBreakdown
                  yieldData={yieldData}
                  onParamChange={handleYieldParamChange}
                  estimatedRentUsd={estimatedRentUsd}
                  appreciationPercent={appreciationPercent}
                  vacancyPercent={vacancyPercent}
                />
              )}

              {activeInspectorTab === 'SCHOOLS' && (
                <SchoolMetricsBadge schools={propertyDetails?.schools || []} />
              )}
            </>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <Compass className="w-8 h-8 text-emerald-400 animate-spin" />
              <span>Select a property on the map to begin mortgage and investment modeling.</span>
            </div>
          )}
        </div>
      </main>

      {/* Side-by-Side Portfolio Comparison Modal */}
      <PortfolioComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        comparisons={comparisonResults}
        onSelectProperty={handleSelectProperty}
      />
    </div>
  );
}
