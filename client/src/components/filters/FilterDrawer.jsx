// components/filters/FilterDrawer.jsx
import React, { useState } from 'react';
import {
  SlidersHorizontal,
  RefreshCw,
  MapPin,
  Building,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Sliders,
  Check
} from 'lucide-react';

const PROPERTY_TYPES = [
  { label: 'All', value: 'ALL' },
  { label: 'Single Family', value: 'SINGLE_FAMILY' },
  { label: 'Condo', value: 'CONDO' },
  { label: 'Townhouse', value: 'TOWNHOUSE' },
  { label: 'Multi-Family', value: 'MULTI_FAMILY' }
];

const PRICE_PRESETS = [
  { label: '< $750k', min: '', max: '750000' },
  { label: '$750k - $1M', min: '750000', max: '1000000' },
  { label: '$1M - $1.5M', min: '1000000', max: '1500000' },
  { label: '$1.5M+', min: '1500000', max: '' }
];

export default function FilterDrawer({
  filters,
  onFilterChange,
  searchMode,
  onSearchModeChange,
  radiusMeters,
  onRadiusChange,
  totalResults = 0,
  onReset
}) {
  const [isExpanded, setIsExpanded] = useState(false); // Collapsed on mobile by default for better map space

  const activeFilterCount = [
    filters.minPrice,
    filters.maxPrice,
    filters.minBeds,
    filters.propertyType && filters.propertyType !== 'ALL'
  ].filter(Boolean).length;

  return (
    <div className="glass-panel overflow-hidden transition-all duration-300">
      {/* Interactive Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.03] transition-colors select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Spatial Filters
              </h4>
              {activeFilterCount > 0 && (
                <span className="badge-tag badge-emerald text-[10px] px-1.5 py-0.5">
                  {activeFilterCount} Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {searchMode === 'BBOX' ? 'ST_MakeEnvelope (Viewport)' : `ST_DWithin (${(radiusMeters / 1000).toFixed(0)}km radius)`} • <span className="text-emerald-400 font-mono font-semibold">{totalResults} listings</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
              className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              title="Reset all filters"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-300">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expandable Filter Body */}
      <div className={`drawer-content ${isExpanded ? 'drawer-expanded' : 'drawer-collapsed'}`}>
        <div className="p-4 pt-1 border-t border-white/5 flex flex-col gap-4 text-xs">
          {/* Spatial Mode Selector */}
          <div>
            <label className="text-slate-300 font-medium block mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>PostGIS Query Engine Mode:</span>
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-1 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => onSearchModeChange('BBOX')}
                className={`py-2 px-3 rounded-lg font-semibold transition-all touch-active ${
                  searchMode === 'BBOX'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ST_MakeEnvelope (BBox)
              </button>
              <button
                type="button"
                onClick={() => onSearchModeChange('RADIUS')}
                className={`py-2 px-3 rounded-lg font-semibold transition-all touch-active ${
                  searchMode === 'RADIUS'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ST_DWithin (Radius)
              </button>
            </div>
          </div>

          {/* Radius Control if in RADIUS mode */}
          {searchMode === 'RADIUS' && (
            <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5">
              <div className="flex justify-between text-slate-300 mb-1.5">
                <span>Radius Distance:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {(radiusMeters / 1000).toFixed(1)} km ({((radiusMeters / 1000) * 0.621371).toFixed(1)} mi)
                </span>
              </div>
              <input
                type="range"
                min="2000"
                max="30000"
                step="1000"
                value={radiusMeters}
                onChange={(e) => onRadiusChange(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>2 km</span>
                <span>15 km</span>
                <span>30 km</span>
              </div>
            </div>
          )}

          {/* Property Type Filter */}
          <div>
            <label className="text-slate-300 font-medium block mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-400" />
              <span>Property Type:</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PROPERTY_TYPES.map((pt) => {
                const isSelected = (filters.propertyType || 'ALL') === pt.value;
                return (
                  <button
                    key={pt.value}
                    type="button"
                    onClick={() => onFilterChange({ propertyType: pt.value })}
                    className={`py-1.5 px-3 rounded-xl border transition-all touch-active text-xs ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {pt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range & Quick Presets */}
          <div>
            <label className="text-slate-300 font-medium block mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Price Range (USD):</span>
              </span>
              {(filters.minPrice || filters.maxPrice) && (
                <button
                  type="button"
                  onClick={() => onFilterChange({ minPrice: '', maxPrice: '' })}
                  className="text-[10px] text-slate-400 hover:text-emerald-400 underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </label>

            {/* Quick Price Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2">
              {PRICE_PRESETS.map((preset, idx) => {
                const isSelected =
                  String(filters.minPrice || '') === String(preset.min) &&
                  String(filters.maxPrice || '') === String(preset.max);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        onFilterChange({ minPrice: '', maxPrice: '' });
                      } else {
                        onFilterChange({ minPrice: preset.min, maxPrice: preset.max });
                      }
                    }}
                    className={`py-1 px-2 rounded-lg border text-[11px] font-medium transition-all touch-active ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                        : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-300'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-slate-500">$</span>
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.minPrice || ''}
                  onChange={(e) => onFilterChange({ minPrice: e.target.value })}
                  className="form-input text-xs pl-6"
                />
              </div>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-slate-500">$</span>
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice || ''}
                  onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
                  className="form-input text-xs pl-6"
                />
              </div>
            </div>
          </div>

          {/* Minimum Bedrooms */}
          <div>
            <label className="text-slate-300 font-medium block mb-1.5">
              Minimum Bedrooms:
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {['', '1', '2', '3', '4'].map((bed) => {
                const isSelected = (filters.minBeds || '') === bed;
                return (
                  <button
                    key={bed || 'any'}
                    type="button"
                    onClick={() => onFilterChange({ minBeds: bed })}
                    className={`py-1.5 text-xs rounded-xl border font-medium transition-all touch-active ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {bed ? `${bed}+ bd` : 'Any'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
