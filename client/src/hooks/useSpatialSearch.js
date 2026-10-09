// hooks/useSpatialSearch.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { propertyApi } from '../services/api';

/**
 * Custom React Hook for zoom-responsive debounced PostGIS geospatial querying
 */
export function useSpatialSearch(initialFilters = {}) {
  const [properties, setProperties] = useState([]);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [executionTimeMs, setExecutionTimeMs] = useState(0);
  const [engineInfo, setEngineInfo] = useState('');

  const [searchMode, setSearchMode] = useState('BBOX'); // 'BBOX' or 'RADIUS'
  const [radiusMeters, setRadiusMeters] = useState(10000); // 10km default
  const [centerCoords, setCenterCoords] = useState({ lat: 30.2672, lng: -97.7431 }); // Austin, TX
  const [currentBounds, setCurrentBounds] = useState(null);

  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minBeds: '',
    propertyType: 'ALL',
    ...initialFilters
  });

  const debounceTimerRef = useRef(null);

  const executeSearch = useCallback(async (boundsOverride, centerOverride, filterOverride) => {
    setLoading(true);
    setError(null);

    const activeFilters = filterOverride || filters;
    const activeCenter = centerOverride || centerCoords;
    const activeBounds = boundsOverride || currentBounds;

    const params = {
      format: 'geojson',
      minPrice: activeFilters.minPrice || undefined,
      maxPrice: activeFilters.maxPrice || undefined,
      minBeds: activeFilters.minBeds || undefined,
      propertyType: activeFilters.propertyType !== 'ALL' ? activeFilters.propertyType : undefined
    };

    if (searchMode === 'BBOX' && activeBounds) {
      // Bounding box format: minLng,minLat,maxLng,maxLat
      params.bbox = `${activeBounds.getWest()},${activeBounds.getSouth()},${activeBounds.getEast()},${activeBounds.getNorth()}`;
    } else {
      // Radius search using center point
      params.lat = activeCenter.lat;
      params.lng = activeCenter.lng;
      params.radius = radiusMeters;
    }

    try {
      const data = await propertyApi.getProperties(params);
      setGeoJsonData(data);
      const propsList = (data.features || []).map((f) => ({
        ...f.properties,
        lng: f.geometry.coordinates[0],
        lat: f.geometry.coordinates[1]
      }));
      setProperties(propsList);

      if (data.meta) {
        setExecutionTimeMs(data.meta.executionTimeMs);
        setEngineInfo(data.meta.engine);
      }
    } catch (err) {
      console.error('Spatial search failed:', err);
      setError(err.message || 'Error executing PostGIS query');
    } finally {
      setLoading(false);
    }
  }, [searchMode, radiusMeters, centerCoords, currentBounds, filters]);

  // Debounced trigger for zoom/pan updates
  const triggerDebouncedSearch = useCallback((bounds, center) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      executeSearch(bounds, center);
    }, 180);
  }, [executeSearch]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      executeSearch(undefined, undefined, updated);
      return updated;
    });
  }, [executeSearch]);

  const setCenter = useCallback((lat, lng) => {
    setCenterCoords({ lat, lng });
  }, []);

  const setBounds = useCallback((bounds) => {
    setCurrentBounds(bounds);
    triggerDebouncedSearch(bounds);
  }, [triggerDebouncedSearch]);

  // Initial load
  useEffect(() => {
    executeSearch();
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  return {
    properties,
    geoJsonData,
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
    setCenter,
    setBounds,
    updateFilters,
    refetch: executeSearch
  };
}
