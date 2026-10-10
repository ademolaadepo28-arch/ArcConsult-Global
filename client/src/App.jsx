// App.jsx
import React, { useState, useEffect, useMemo } from 'react';
import PropertyMap from './components/map/PropertyMap';
import FilterDrawer from './components/filters/FilterDrawer';
import AmortizationChart from './components/analytics/AmortizationChart';
import YieldBreakdown from './components/analytics/YieldBreakdown';
import SchoolMetricsBadge from './components/schools/SchoolMetricsBadge';
import PortfolioComparisonModal from './components/portfolio/PortfolioComparisonModal';
import ArchitectureModal from './components/modals/ArchitectureModal';
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
  ListFilter,
  Cpu,
  Copy,
  Check,
  RefreshCw,
  Share2,
  Camera,
  Image,
  ChevronLeft,
  X
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

  // Spec #05 Architecture modal state
  const [isSpecOpen, setIsSpecOpen] = useState(false);

  // Map focus target (school or property location)
  const [focusLocation, setFocusLocation] = useState(null);

  // Listing sort filter: 'DEFAULT' | 'PRICE_ASC' | 'PRICE_DESC' | 'BEDS' | 'SQFT'
  const [sortBy, setSortBy] = useState('DEFAULT');

  // Copy feedback state
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Responsive Mobile/Tablet Navigation Tab: 'MAP' | 'ANALYTICS' | 'SAVED'
  const [mobileViewTab, setMobileViewTab] = useState('MAP');

  // Photo viewer & Lightbox modal states
  const [selectedPhotoTab, setSelectedPhotoTab] = useState('MAIN'); // 'MAIN' | 'ALT'
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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

  // Derived sorted listings list
  const sortedProperties = useMemo(() => {
    const list = [...properties];
    if (sortBy === 'PRICE_ASC') return list.sort((a, b) => a.price_cents - b.price_cents);
    if (sortBy === 'PRICE_DESC') return list.sort((a, b) => b.price_cents - a.price_cents);
    if (sortBy === 'BEDS') return list.sort((a, b) => b.bedrooms - a.bedrooms);
    if (sortBy === 'SQFT') return list.sort((a, b) => b.square_feet - a.square_feet);
    return list;
  }, [properties, sortBy]);

  // Load single property details + spatial join schools when selected
  const handleSelectProperty = async (prop, shouldSwitchMobileView = false) => {
    setSelectedProperty(prop);
    setSelectedPhotoTab('MAIN');
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
              <button
                type="button"
                onClick={() => setIsSpecOpen(true)}
                className="hidden sm:inline-flex badge-tag badge-emerald font-mono text-[10px] cursor-pointer hover:bg-emerald-400 hover:text-slate-950 transition-all touch-active"
                title="View Spec #05 Architecture, PostGIS Queries & Demo Token"
              >
                Spec #05
              </button>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block">
              Geospatial Vector Discovery • PostGIS Engine • 30-Year Mortgage & Yield Projections
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Spatial Performance HUD - Click to Refetch */}
          <button
            type="button"
            onClick={() => refetch()}
            className="hidden md:flex items-center gap-2 bg-slate-900/80 hover:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-white/10 hover:border-emerald-500/40 text-xs transition-all cursor-pointer group touch-active"
            title="Click to re-query PostGIS engine"
          >
            <span className={`w-2 h-2 rounded-full bg-emerald-400 ${loading ? 'animate-ping' : ''}`} />
            <span className="text-slate-300 font-mono text-[11px]">{properties.length} Listings</span>
            <span className="text-white/20">|</span>
            <span className="text-emerald-400 font-mono font-bold text-[11px]">{executionTimeMs}ms</span>
            <RefreshCw className={`w-3 h-3 text-slate-400 group-hover:text-emerald-400 transition-transform ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Architecture / Spec Modal Button */}
          <button
            type="button"
            onClick={() => setIsSpecOpen(true)}
            className="btn-secondary text-xs py-1.5 px-2.5 sm:py-2 sm:px-3 flex items-center gap-1.5 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10 touch-active"
            title="View system architecture, PostGIS queries, and demo JWT token"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Spec & Architecture</span>
          </button>

          {/* Compare Saved Button */}
          <button
            type="button"
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
              focusLocation={focusLocation}
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

          {/* Horizontal / Grid Listing Cards Preview with Sorting */}
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-slate-300">
                Visible Map Properties ({properties.length})
              </span>

              {/* Interactive Sorting Controls */}
              <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-white/5 text-[11px]">
                <span className="text-slate-500 px-1 hidden sm:inline">Sort:</span>
                {[
                  { id: 'DEFAULT', label: 'Default' },
                  { id: 'PRICE_ASC', label: 'Price ↑' },
                  { id: 'PRICE_DESC', label: 'Price ↓' },
                  { id: 'BEDS', label: 'Beds' },
                  { id: 'SQFT', label: 'SqFt' }
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSortBy(s.id)}
                    className={`px-2 py-0.5 rounded transition-all touch-active ${
                      sortBy === s.id
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {sortedProperties.map((prop) => {
                const isSelected = selectedProperty?.id === prop.id;
                const bookmarked = isBookmarked(prop.id);

                return (
                  <div
                    key={prop.id}
                    onClick={() => handleSelectProperty(prop, true)}
                    className={`glass-card-interactive p-3 flex flex-col justify-between gap-2.5 touch-active group ${
                      isSelected ? 'glass-card-selected' : ''
                    }`}
                  >
                    {/* Realistic Property Image Thumbnail */}
                    <div className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-900">
                      <img
                        src={prop.image_url || '/images/properties/prop-1-main.jpg'}
                        alt={prop.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/properties/prop-1-main.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#090d15] via-transparent to-black/30 pointer-events-none" />

                      {/* Property Type Badge Overlay */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className="badge-tag badge-cyan text-[9px] py-0.5 px-2 bg-slate-950/80 backdrop-blur-md">
                          {prop.property_type.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Bookmark Button Overlay */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleBookmark(prop.id);
                        }}
                        className={`absolute top-2 right-2 p-1.5 rounded-lg border backdrop-blur-md transition-all touch-active ${
                          bookmarked
                            ? 'bg-emerald-500/30 border-emerald-500 text-emerald-400'
                            : 'bg-slate-950/70 border-white/20 text-slate-300 hover:text-white'
                        }`}
                        title={bookmarked ? 'Remove from Saved Portfolio' : 'Bookmark to Portfolio'}
                      >
                        {bookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                      </button>

                      {/* Floating Price on Image */}
                      <div className="absolute bottom-1.5 left-2">
                        <span className="font-extrabold text-emerald-400 font-mono text-sm drop-shadow-md">
                          ${(prop.price_cents / 100).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Listing Title & Address */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-1 group-hover:text-emerald-300 transition-colors">
                        {prop.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{prop.street_address}</p>
                    </div>

                    {/* Key Metrics */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span>{prop.bedrooms} bd</span>
                        <span>•</span>
                        <span>{prop.bathrooms} ba</span>
                        <span>•</span>
                        <span>{prop.square_feet} sqft</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                        Austin, TX
                      </span>
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
                      <button
                        type="button"
                        onClick={() => updateFilters({ propertyType: selectedProperty.property_type })}
                        className="badge-tag badge-cyan text-[9px] sm:text-[10px] cursor-pointer hover:bg-cyan-400 hover:text-slate-950 transition-colors"
                        title={`Filter listings by ${selectedProperty.property_type.replace('_', ' ')}`}
                      >
                        {selectedProperty.property_type.replace('_', ' ')}
                      </button>
                    </div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
                      {selectedProperty.title}
                    </h2>
                    <p className="text-xs text-slate-300">
                      {selectedProperty.street_address}, {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zip_code}
                    </p>
                  </div>

                  <button
                    type="button"
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

                {/* Interactive Realistic Photo Showcase */}
                <div className="relative w-full h-48 sm:h-56 rounded-xl overflow-hidden bg-slate-900 border border-white/10 group shadow-lg">
                  <img
                    src={
                      selectedPhotoTab === 'MAIN'
                        ? (selectedProperty.image_url || '/images/properties/prop-1-main.jpg')
                        : (selectedProperty.alt_image_url || selectedProperty.image_url || '/images/properties/prop-1-alt.jpg')
                    }
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                    onClick={() => setIsLightboxOpen(true)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/properties/prop-1-main.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090d15] via-transparent to-black/30 pointer-events-none" />

                  {/* Top-right Lightbox Expand Button */}
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(true)}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-950/70 hover:bg-slate-900 border border-white/20 text-white backdrop-blur-md transition-all touch-active"
                    title="Expand full photo (HD Lightbox)"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>

                  {/* Bottom Bar: Photo Switcher Controls */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-xl border border-white/15 backdrop-blur-md text-[11px]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPhotoTab('MAIN');
                        }}
                        className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all touch-active ${
                          selectedPhotoTab === 'MAIN'
                            ? 'bg-emerald-500 text-slate-950 shadow-sm'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <Camera className="w-3 h-3" />
                        <span>Exterior</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPhotoTab('ALT');
                        }}
                        className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all touch-active ${
                          selectedPhotoTab === 'ALT'
                            ? 'bg-emerald-500 text-slate-950 shadow-sm'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <Image className="w-3 h-3" />
                        <span>Interior / View</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsLightboxOpen(true)}
                      className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-950/80 px-2 py-1 rounded-xl border border-white/10 backdrop-blur-md transition-colors"
                    >
                      <Maximize2 className="w-3 h-3 text-emerald-400" />
                      <span>HD View</span>
                    </button>
                  </div>
                </div>

                {/* Interactive Action Bar: Map Center, Directions Link, Share/Copy */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      setFocusLocation({ lat: selectedProperty.lat, lng: selectedProperty.lng, zoom: 16 });
                      if (window.innerWidth < 1024) setMobileViewTab('MAP');
                    }}
                    className="py-1 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5 transition-colors touch-active"
                    title="Center listing on map"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Center on Map</span>
                  </button>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${selectedProperty.street_address}, ${selectedProperty.city}, ${selectedProperty.state} ${selectedProperty.zip_code}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors touch-active"
                    title="Open address in Google Maps"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Google Maps Directions</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      const shareText = `${selectedProperty.title} - ${selectedProperty.street_address}, ${selectedProperty.city}: $${(selectedProperty.price_cents / 100).toLocaleString()}`;
                      navigator.clipboard.writeText(shareText);
                      setCopiedAddress(true);
                      setTimeout(() => setCopiedAddress(false), 2000);
                    }}
                    className="py-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors touch-active sm:ml-auto"
                    title="Copy property summary to clipboard"
                  >
                    {copiedAddress ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Details</span>
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
                <SchoolMetricsBadge
                  schools={propertyDetails?.schools || []}
                  onSelectSchool={(school) => {
                    setFocusLocation({ lat: school.lat, lng: school.lng, zoom: 16 });
                    if (window.innerWidth < 1024) setMobileViewTab('MAP');
                  }}
                />
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

      {/* Footer with interactive quick links */}
      <footer className="border-t border-white/10 bg-[#06090e] px-4 py-6 mt-8">
        <div className="max-w-[1680px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>ArcConsult Global • Enterprise Real Estate & Quantitative Mortgages</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <button
              type="button"
              onClick={() => setIsSpecOpen(true)}
              className="text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Spec #05 Architecture
            </button>
            <button
              type="button"
              onClick={handleOpenComparison}
              className="text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Portfolio Comparison ({savedPortfolios.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setFocusLocation({ lat: 30.2672, lng: -97.7431, zoom: 13 });
                if (window.innerWidth < 1024) setMobileViewTab('MAP');
              }}
              className="text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Recenter Austin Metro
            </button>
          </div>
        </div>
      </footer>

      {/* Side-by-Side Portfolio Comparison Modal */}
      <PortfolioComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        comparisons={comparisonResults}
        onSelectProperty={(p) => handleSelectProperty(p, true)}
      />

      {/* Spec #05 Architecture, PostGIS Queries & JWT Auth Modal */}
      <ArchitectureModal
        isOpen={isSpecOpen}
        onClose={() => setIsSpecOpen(false)}
        engineInfo={engineInfo}
        executionTimeMs={executionTimeMs}
        totalProperties={properties.length}
        totalSchools={allSchools.length}
      />

      {/* Full-Resolution HD Photo Lightbox Modal */}
      {isLightboxOpen && selectedProperty && (
        <div
          className="fixed inset-0 z-[2200] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-lg animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full flex flex-col bg-slate-950/95 border border-white/20 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                    {selectedProperty.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedPhotoTab === 'MAIN' ? 'Primary Exterior View' : 'Interior Architecture & Layout'} • {selectedProperty.street_address}, {selectedProperty.city}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Switch tab directly inside lightbox */}
                <div className="bg-slate-900 p-0.5 rounded-lg border border-white/10 text-xs flex">
                  <button
                    onClick={() => setSelectedPhotoTab('MAIN')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                      selectedPhotoTab === 'MAIN'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Exterior
                  </button>
                  <button
                    onClick={() => setSelectedPhotoTab('ALT')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                      selectedPhotoTab === 'ALT'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Interior
                  </button>
                </div>

                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Close Lightbox"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lightbox Image Container */}
            <div className="relative w-full h-[55vh] sm:h-[65vh] bg-black flex items-center justify-center overflow-hidden select-none">
              <img
                src={
                  selectedPhotoTab === 'MAIN'
                    ? (selectedProperty.image_url || '/images/properties/prop-1-main.jpg')
                    : (selectedProperty.alt_image_url || selectedProperty.image_url || '/images/properties/prop-1-alt.jpg')
                }
                alt={selectedProperty.title}
                className="w-full h-full object-contain"
              />

              {/* Previous / Next Arrow toggles */}
              <button
                onClick={() => setSelectedPhotoTab((prev) => (prev === 'MAIN' ? 'ALT' : 'MAIN'))}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-white/20 text-white backdrop-blur-md transition-all touch-active cursor-pointer"
                title="Toggle Photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedPhotoTab((prev) => (prev === 'MAIN' ? 'ALT' : 'MAIN'))}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-white/20 text-white backdrop-blur-md transition-all touch-active cursor-pointer"
                title="Toggle Photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Lightbox Footer */}
            <div className="flex items-center justify-between p-3.5 bg-slate-900/60 border-t border-white/10 text-xs text-slate-300">
              <span className="font-mono text-emerald-400 font-bold text-sm">
                ${(selectedProperty.price_cents / 100).toLocaleString()}
              </span>
              <div className="flex items-center gap-3 text-slate-400">
                <span>{selectedProperty.bedrooms} Beds</span>
                <span>•</span>
                <span>{selectedProperty.bathrooms} Baths</span>
                <span>•</span>
                <span>{selectedProperty.square_feet} SqFt</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
