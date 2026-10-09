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
  ExternalLink,
  MapPin,
  BarChart3,
  ListFilter
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

  // Responsive Mobile/Tablet Navigation Tab: 'MAP' | 'ANALYTICS' | 'SAVED'
  const [mobileViewTab, setMobileViewTab] = useState('MAP');

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

  // Load all schools & saved portfolio on mount
  useEffect(() => {
    propertyApi.getSchools().then((res) => {
      setAllSchools(res.schools || []);
    }).catch(console.error);

    portfolioApi.getSavedPortfolios().then((res) => {
      setSavedPortfolios(res.portfolio || []);
    }).catch(console.error);
  }, []);

  // Set default selected property once properties load
  useEffect(() => {
    if (properties.length > 0 && !selectedProperty) {
      handleSelectProperty(properties[0], false);
    }
  }, [properties]);

  // Load single property details + spatial join schools when selected
  const handleSelectProperty = async (prop, shouldSwitchMobileView = false) => {
    setSelectedProperty(prop);
    if (shouldSwitchMobileView && window.innerWidth < 1024) {
      setMobileViewTab('ANALYTICS');
    }

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
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col pb-20 lg:pb-0">
      {/* Top Luxury Navigation Header */}
      <header className="sticky top-0 z-[1500] bg-[#090d15]/90 backdrop-blur-xl border-b border-white/10 px-3.5 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-[#090d15] rounded-[10px] flex items-center justify-center">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-lg font-extrabold text-white tracking-tight font-heading">
                ArcConsult <span className="gradient-text-emerald">Analytics</span>
              </h1>
              <span className="hidden sm:inline-block badge-tag badge-emerald font-mono text-[10px]">
                Spec #05
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block">
              Geospatial Vector Discovery • PostGIS Engine • 30-Year Mortgage & Yield Projections
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Spatial Performance HUD */}
          <div className="hidden md:flex items-center gap-2 bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-white/10 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300 font-mono text-[11px]">{properties.length} Listings</span>
            <span className="text-white/20">|</span>
            <span className="text-emerald-400 font-mono font-bold text-[11px]">{executionTimeMs}ms</span>
          </div>

          {/* Compare Saved Button */}
          <button
            onClick={handleOpenComparison}
            className="btn-secondary text-xs py-1.5 px-2.5 sm:py-2 sm:px-3 flex items-center gap-1.5 hover:border-emerald-500/40 touch-active"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Compare ({savedPortfolios.length})</span>
          </button>
        </div>
      </header>

      {/* Responsive View Switcher for Mobile & Tablet (<1024px) */}
      <div className="lg:hidden sticky top-[57px] z-[1450] bg-[#090d15]/95 backdrop-blur-md px-3 py-2 border-b border-white/10 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-1.5 w-full max-w-md bg-slate-950/80 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setMobileViewTab('MAP')}
            className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all touch-active ${
              mobileViewTab === 'MAP'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Map & Search ({properties.length})</span>
          </button>
          <button
            onClick={() => setMobileViewTab('ANALYTICS')}
            className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all touch-active ${
              mobileViewTab === 'ANALYTICS'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Financial Model</span>
          </button>
        </div>
      </div>

      {/* Main Content Dashboard */}
      <main className="flex-1 p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 max-w-[1680px] w-full mx-auto">
        {/* Left Column: Leaflet Map & Search Filters (7 Cols) */}
        <div
          className={`lg:col-span-7 flex flex-col gap-4 sm:gap-5 ${
            mobileViewTab === 'MAP' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Leaflet Map Card */}
          <div className="h-[360px] sm:h-[450px] lg:h-[500px] w-full">
            <PropertyMap
              properties={properties}
              selectedProperty={selectedProperty}
              onSelectProperty={(p) => handleSelectProperty(p, true)}
              onBoundsChange={setBounds}
              searchMode={searchMode}
              radiusMeters={radiusMeters}
              centerCoords={centerCoords}
              schools={allSchools}
              executionTimeMs={executionTimeMs}
              engineInfo={engineInfo}
            />
          </div>

          {/* Spatial Search Controls Drawer (Collapsible) */}
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

          {/* Horizontal / Grid Listing Cards Preview */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-slate-300">
                Visible Map Properties ({properties.length})
              </span>
              <span className="text-[11px] text-slate-400">Tap card to inspect financial model</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {properties.map((prop) => {
                const isSelected = selectedProperty?.id === prop.id;
                const bookmarked = isBookmarked(prop.id);

                return (
                  <div
                    key={prop.id}
                    onClick={() => handleSelectProperty(prop, true)}
                    className={`glass-card-interactive p-3.5 sm:p-4 flex flex-col justify-between gap-3 touch-active ${
                      isSelected ? 'glass-card-selected' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="badge-tag badge-cyan mb-1 text-[10px]">
                          {prop.property_type.replace('_', ' ')}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-1">
                          {prop.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{prop.street_address}</p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleBookmark(prop.id);
                        }}
                        className={`p-1.5 rounded-lg border transition-all touch-active ${
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
                      <div className="text-base sm:text-lg font-extrabold text-emerald-400 font-mono">
                        ${(prop.price_cents / 100).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
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
        <div
          className={`lg:col-span-5 flex flex-col gap-4 sm:gap-5 ${
            mobileViewTab === 'ANALYTICS' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {selectedProperty ? (
            <>
              {/* Selected Property Header Hero Card */}
              <div className="glass-panel p-4 sm:p-5 flex flex-col gap-3.5 border-l-4 border-l-emerald-500">
                <div className="flex items-start justify-between gap-2.5">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="badge-tag badge-emerald text-[9px] sm:text-[10px]">
                        {selectedProperty.status}
                      </span>
                      <span className="badge-tag badge-cyan text-[9px] sm:text-[10px]">
                        {selectedProperty.property_type.replace('_', ' ')}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
                      {selectedProperty.title}
                    </h2>
                    <p className="text-xs text-slate-300">
                      {selectedProperty.street_address}, {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zip_code}
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleBookmark(selectedProperty.id)}
                    className={`btn-secondary text-xs py-1.5 px-2.5 sm:py-2 sm:px-3 flex items-center gap-1.5 touch-active ${
                      isBookmarked(selectedProperty.id) ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' : ''
                    }`}
                  >
                    {isBookmarked(selectedProperty.id) ? (
                      <>
                        <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                        <span className="hidden sm:inline">Saved</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4 text-slate-400" />
                        <span className="hidden sm:inline">Save</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 sm:line-clamp-none">
                  {selectedProperty.description}
                </p>

                {/* Property Specification Chips */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 bg-slate-950/60 p-2.5 sm:p-3 rounded-xl border border-white/5 text-center text-xs">
                  <div>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 block">Price</span>
                    <span className="font-extrabold text-emerald-400 font-mono text-xs sm:text-sm">
                      ${(selectedProperty.price_cents / 100).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 block">Beds / Baths</span>
                    <span className="font-bold text-white text-xs sm:text-sm">
                      {selectedProperty.bedrooms} / {selectedProperty.bathrooms}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 block">SqFt</span>
                    <span className="font-bold text-white text-xs sm:text-sm">
                      {selectedProperty.square_feet.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 block">Built</span>
                    <span className="font-bold text-white text-xs sm:text-sm">{selectedProperty.year_built || '—'}</span>
                  </div>
                </div>

                {/* HOA and Annual Property Tax */}
                <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 px-1">
                  <span>
                    Est. HOA: <strong className="text-slate-200">${(selectedProperty.estimated_hoa_monthly_cents / 100).toLocaleString()}/mo</strong>
                  </span>
                  <span>
                    Annual Taxes: <strong className="text-slate-200">${(selectedProperty.annual_property_tax_cents / 100).toLocaleString()}/yr</strong>
                  </span>
                </div>
              </div>

              {/* Inspector Navigation Tabs */}
              <div className="flex bg-slate-900/90 p-1 rounded-2xl border border-white/10 text-xs">
                <button
                  onClick={() => setActiveInspectorTab('MORTGAGE')}
                  className={`flex-1 py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all touch-active ${
                    activeInspectorTab === 'MORTGAGE'
                      ? 'bg-emerald-500 text-slate-950 shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Amortization</span>
                </button>
                <button
                  onClick={() => setActiveInspectorTab('YIELD')}
                  className={`flex-1 py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all touch-active ${
                    activeInspectorTab === 'YIELD'
                      ? 'bg-emerald-500 text-slate-950 shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Yield & Cap</span>
                </button>
                <button
                  onClick={() => setActiveInspectorTab('SCHOOLS')}
                  className={`flex-1 py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all touch-active ${
                    activeInspectorTab === 'SCHOOLS'
                      ? 'bg-emerald-500 text-slate-950 shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Schools</span>
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
            <div className="glass-panel p-10 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <Compass className="w-8 h-8 text-emerald-400 animate-spin" />
              <span>Select a property on the map or listing feed to begin financial modeling.</span>
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Pill on Mobile when in MAP view */}
      {selectedProperty && mobileViewTab === 'MAP' && (
        <div className="lg:hidden fixed bottom-4 left-3 right-3 z-[1400] animate-fadeIn">
          <div className="glass-panel p-3 bg-slate-950/95 border border-emerald-500/40 shadow-2xl flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-emerald-400 uppercase font-mono font-bold block">Selected Listing</span>
              <p className="text-xs font-bold text-white truncate">{selectedProperty.title}</p>
              <p className="text-xs font-mono font-extrabold text-emerald-400">${(selectedProperty.price_cents / 100).toLocaleString()}</p>
            </div>
            <button
              onClick={() => setMobileViewTab('ANALYTICS')}
              className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5 shrink-0"
            >
              <span>View Analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Side-by-Side Portfolio Comparison Modal */}
      <PortfolioComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        comparisons={comparisonResults}
        onSelectProperty={(p) => handleSelectProperty(p, true)}
      />
    </div>
  );
}
