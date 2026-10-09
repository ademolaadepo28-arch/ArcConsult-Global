// components/filters/FilterDrawer.jsx
import React from 'react';
import { Filter, SlidersHorizontal, RefreshCw, MapPin, Building, DollarSign } from 'lucide-react';

const PROPERTY_TYPES = [
  { label: 'All Types', value: 'ALL' },
  { label: 'Single Family', value: 'SINGLE_FAMILY' },
  { label: 'Condo', value: 'CONDO' },
  { label: 'Townhouse', value: 'TOWNHOUSE' },
  { label: 'Multi-Family', value: 'MULTI_FAMILY' }
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
  return (
    <div className="glass-panel p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Spatial Search Filters</h4>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
          title="Reset to default filters"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Spatial Query Mode Toggle */}
      <div>
        <label className="text-xs text-slate-300 font-medium block mb-1.5 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span>PostGIS Query Engine Mode:</span>
        </label>
        <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => onSearchModeChange('BBOX')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              searchMode === 'BBOX'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ST_MakeEnvelope (BBox)
          </button>
          <button
            onClick={() => onSearchModeChange('RADIUS')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              searchMode === 'RADIUS'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ST_DWithin (Radius)
          </button>
        </div>
      </div>

      {/* Radius Slider if RADIUS mode */}
      {searchMode === 'RADIUS' && (
        <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5">
          <div className="flex justify-between text-xs text-slate-300 mb-1.5">
            <span>Radius:</span>
            <span className="font-mono text-emerald-400 font-bold">{(radiusMeters / 1000).toFixed(1)} km ({((radiusMeters / 1000) * 0.621371).toFixed(1)} mi)</span>
          </div>
          <input
            type="range"
            min="2000"
            max="30000"
            step="1000"
            value={radiusMeters}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
          />
        </div>
      )}

      {/* Property Type Pills */}
      <div>
        <label className="text-xs text-slate-300 font-medium block mb-1.5 flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-indigo-400" />
          <span>Property Type:</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PROPERTY_TYPES.map((pt) => {
            const isSelected = (filters.propertyType || 'ALL') === pt.value;
            return (
              <button
                key={pt.value}
                onClick={() => onFilterChange({ propertyType: pt.value })}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
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

      {/* Price Range */}
      <div>
        <label className="text-xs text-slate-300 font-medium block mb-1.5 flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span>Price Range (USD):</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min Price (e.g. 500k)"
            value={filters.minPrice || ''}
            onChange={(e) => onFilterChange({ minPrice: e.target.value })}
            className="form-input text-xs"
          />
          <input
            type="number"
            placeholder="Max Price (e.g. 1.5M)"
            value={filters.maxPrice || ''}
            onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
            className="form-input text-xs"
          />
        </div>
      </div>

      {/* Minimum Bedrooms */}
      <div>
        <label className="text-xs text-slate-300 font-medium block mb-1.5">
          Minimum Bedrooms:
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {['', '1', '2', '3', '4'].map((bed) => {
            const isSelected = (filters.minBeds || '') === bed;
            return (
              <button
                key={bed || 'any'}
                onClick={() => onFilterChange({ minBeds: bed })}
                className={`py-1 text-xs rounded-lg border font-medium transition-all ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {bed ? `${bed}+` : 'Any'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count Footer */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <span>Matching Listings:</span>
        <span className="font-mono text-emerald-400 font-bold text-sm">{totalResults}</span>
      </div>
    </div>
  );
}
