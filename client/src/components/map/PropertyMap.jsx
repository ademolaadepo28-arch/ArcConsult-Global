// components/map/PropertyMap.jsx
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import MapCluster from './MapCluster';
import { Layers, GraduationCap, MapPin, ZoomIn, ZoomOut, Compass } from 'lucide-react';

export default function PropertyMap({
  properties = [],
  selectedProperty,
  onSelectProperty,
  onBoundsChange,
  searchMode = 'BBOX',
  radiusMeters = 25000,
  centerCoords = { lat: 6.4474, lng: 3.4350 },
  schools = [],
  executionTimeMs = 0,
  engineInfo = '',
  focusLocation = null
}) {
  const Leaflet = (typeof window !== 'undefined' && window.L) ? window.L : L;
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const radiusCircleRef = useRef(null);
  const [showSchools, setShowSchools] = useState(true);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = Leaflet.map(mapContainerRef.current, {
      center: [centerCoords.lat, centerCoords.lng],
      zoom: 13,
      zoomControl: false
    });

    // OpenStreetMap Basemap styled with sleek dark filter in index.css
    Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;
    setMapInstance(map);

    // Initial bounding box notify
    map.whenReady(() => {
      map.invalidateSize();
      if (onBoundsChange) {
        onBoundsChange(map.getBounds());
      }
    });

    // Debounced bounds listener on pan & zoom
    map.on('moveend', () => {
      if (onBoundsChange) {
        onBoundsChange(map.getBounds());
      }
    });

    // Handle container resizing (e.g. responsive breakpoints, drawer toggling)
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      setMapInstance(null);
    };
  }, []);

  // Sync radius circle layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (searchMode === 'RADIUS') {
      if (!radiusCircleRef.current) {
        radiusCircleRef.current = Leaflet.circle([centerCoords.lat, centerCoords.lng], {
          radius: radiusMeters,
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: '4, 8'
        }).addTo(map);
      } else {
        radiusCircleRef.current.setLatLng([centerCoords.lat, centerCoords.lng]);
        radiusCircleRef.current.setRadius(radiusMeters);
      }
    } else {
      if (radiusCircleRef.current) {
        map.removeLayer(radiusCircleRef.current);
        radiusCircleRef.current = null;
      }
    }
  }, [searchMode, radiusMeters, centerCoords]);

  // Center on selected property if changed
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedProperty) return;

    if (selectedProperty.lat && selectedProperty.lng) {
      map.flyTo([selectedProperty.lat, selectedProperty.lng], Math.max(map.getZoom(), 14), {
        duration: 0.8
      });
    }
  }, [selectedProperty]);

  // Center on custom focusLocation (e.g. school clicked or center property clicked)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !focusLocation) return;

    if (focusLocation.lat && focusLocation.lng) {
      map.flyTo([focusLocation.lat, focusLocation.lng], focusLocation.zoom || 15, {
        duration: 0.8
      });
    }
  }, [focusLocation]);

  // Controls
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetCenter = () => {
    mapInstanceRef.current?.flyTo([6.4474, 3.4350], 13);
  };
  const handleFlyToLagos = () => {
    mapInstanceRef.current?.flyTo([6.4474, 3.4350], 13);
  };
  const handleFlyToAbuja = () => {
    mapInstanceRef.current?.flyTo([9.0882, 7.4983], 13);
  };

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#090d14]">
      {/* Map DOM Node */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Embedded Cluster Layer */}
      {mapInstance && (
        <MapCluster
          map={mapInstance}
          properties={properties}
          selectedPropertyId={selectedProperty?.id}
          onSelectProperty={onSelectProperty}
          showSchools={showSchools}
          schools={schools}
        />
      )}

      {/* Top Map HUD Bar: Engine Info & Query Latency */}
      <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 z-[1000] flex flex-wrap items-center gap-1.5 sm:gap-2 pointer-events-auto max-w-[calc(100%-52px)] sm:max-w-none">
        <div className="glass-panel px-2.5 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span className="text-emerald-400 font-semibold hidden xs:inline">Nigeria PostGIS Engine</span>
          <span className="text-emerald-400 font-semibold xs:hidden">PostGIS</span>
          <span className="text-white/30">•</span>
          <span className="text-slate-300 font-mono">{executionTimeMs}ms</span>
        </div>

        {/* Metro Quick Switchers */}
        <div className="glass-panel p-0.5 flex items-center text-[11px] sm:text-xs">
          <button
            type="button"
            onClick={handleFlyToLagos}
            className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-emerald-400 hover:bg-emerald-500/10 font-semibold transition-colors cursor-pointer touch-active"
            title="Focus Lagos Metro (Island, Ikoyi, Lekki)"
          >
            Lagos Hub
          </button>
          <span className="text-white/20">|</span>
          <button
            type="button"
            onClick={handleFlyToAbuja}
            className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-cyan-400 hover:bg-cyan-500/10 font-semibold transition-colors cursor-pointer touch-active"
            title="Focus Abuja FCT (Maitama)"
          >
            Abuja Hub
          </button>
        </div>

        <button
          onClick={() => setShowSchools(!showSchools)}
          className={`glass-panel px-2.5 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold cursor-pointer transition-all touch-active ${
            showSchools ? 'text-indigo-300 border-indigo-500/40 bg-indigo-950/40' : 'text-slate-400'
          }`}
          title="Toggle neighborhood school overlay"
        >
          <GraduationCap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>Schools ({schools.length})</span>
        </button>
      </div>

      {/* Floating Map Zoom & Orientation Tools */}
      <div className="absolute right-2.5 top-2.5 sm:right-4 sm:top-4 z-[1000] flex flex-col gap-1.5 sm:gap-2 pointer-events-auto">
        <button
          onClick={handleZoomIn}
          className="glass-panel w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-200 hover:text-white hover:bg-white/10 transition-colors touch-active"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="glass-panel w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-200 hover:text-white hover:bg-white/10 transition-colors touch-active"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={handleResetCenter}
          className="glass-panel w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-emerald-400 hover:text-emerald-300 hover:bg-white/10 transition-colors touch-active"
          title="Recenter Lagos Hub"
        >
          <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Bottom Floating Search Legend */}
      <div className="absolute bottom-2.5 left-2.5 sm:bottom-4 sm:left-4 z-[1000] pointer-events-none hidden xs:block">
        <div className="glass-panel px-2.5 py-1 sm:px-3 sm:py-1.5 flex items-center gap-2.5 sm:gap-3 text-[10px] sm:text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span>Listing Price</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
            <span>Top-Tier School</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-emerald-400">{properties.length} Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
