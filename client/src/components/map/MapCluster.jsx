// components/map/MapCluster.jsx
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function MapCluster({
  map,
  properties = [],
  selectedPropertyId,
  onSelectProperty,
  showSchools = true,
  schools = []
}) {
  const clusterGroupRef = useRef(null);
  const schoolsGroupRef = useRef(null);

  const Leaflet = (typeof window !== 'undefined' && window.L && typeof window.L.markerClusterGroup === 'function')
    ? window.L
    : L;

  // Initialize marker cluster group
  useEffect(() => {
    if (!map) return;

    if (!clusterGroupRef.current) {
      if (typeof Leaflet.markerClusterGroup === 'function') {
        clusterGroupRef.current = Leaflet.markerClusterGroup({
          maxClusterRadius: 45,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          iconCreateFunction: (cluster) => {
            const count = cluster.getChildCount();
            return Leaflet.divIcon({
              html: `<div style="
                width: 36px;
                height: 36px;
                background: rgba(16, 185, 129, 0.9);
                color: #042f2e;
                font-weight: 800;
                font-family: Outfit, sans-serif;
                font-size: 13px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                border: 2px solid #ffffff;
                box-shadow: 0 0 16px rgba(16, 185, 129, 0.7);
              ">${count}</div>`,
              className: 'custom-cluster-icon',
              iconSize: Leaflet.point(36, 36)
            });
          }
        });
      } else {
        clusterGroupRef.current = Leaflet.layerGroup();
      }
    }

    if (!map.hasLayer(clusterGroupRef.current)) {
      map.addLayer(clusterGroupRef.current);
    }

    if (!schoolsGroupRef.current) {
      schoolsGroupRef.current = Leaflet.layerGroup();
    }

    if (!map.hasLayer(schoolsGroupRef.current)) {
      map.addLayer(schoolsGroupRef.current);
    }

    return () => {
      if (clusterGroupRef.current && map.hasLayer(clusterGroupRef.current)) {
        map.removeLayer(clusterGroupRef.current);
      }
      if (schoolsGroupRef.current && map.hasLayer(schoolsGroupRef.current)) {
        map.removeLayer(schoolsGroupRef.current);
      }
    };
  }, [map]);

  // Update property markers
  useEffect(() => {
    try {
      if (!clusterGroupRef.current) return;
      clusterGroupRef.current.clearLayers();

      properties.forEach((prop) => {
        if (!prop.lat || !prop.lng) return;

        const isSelected = selectedPropertyId === prop.id;
        const nairaVal = prop.price_cents / 100;
        let shortPrice;
        if (nairaVal >= 1000000000) {
          shortPrice = `₦${(nairaVal / 1000000000).toFixed(2).replace(/\.00$/, '')}B`;
        } else if (nairaVal >= 1000000) {
          shortPrice = `₦${Math.round(nairaVal / 1000000)}M`;
        } else {
          shortPrice = `₦${Math.round(nairaVal / 1000)}k`;
        }

        const markerHtml = `
          <div class="custom-price-pin ${isSelected ? 'selected' : ''}">
            <span>${shortPrice}</span>
          </div>
        `;

        const customIcon = Leaflet.divIcon({
          className: 'price-pin-wrapper',
          html: markerHtml,
          iconSize: [68, 26],
          iconAnchor: [34, 13]
        });

        const marker = Leaflet.marker([prop.lat, prop.lng], { icon: customIcon });

        const popupContent = `
          <div style="font-family: Inter, sans-serif; width: 200px; color: #f1f5f9; padding: 2px;">
            <div style="width: 100%; height: 100px; border-radius: 8px; overflow: hidden; margin-bottom: 6px; background: #0f172a;">
              <img src="${prop.image_url || '/images/properties/prop-1-main.jpg'}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='/images/properties/prop-1-main.jpg'" />
            </div>
            <div style="font-weight: 800; font-size: 13px; color: #34d399; font-family: Outfit, sans-serif;">
              ₦${(prop.price_cents / 100).toLocaleString()}
            </div>
            <div style="font-size: 11px; font-weight: 700; color: #fff; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${prop.title}
            </div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">
              ${prop.bedrooms} bd • ${prop.bathrooms} ba • ${prop.square_feet ? prop.square_feet.toLocaleString() : ''} sqft
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          closeButton: false,
          className: 'custom-property-map-popup',
          offset: [0, -8]
        });

        marker.on('click', () => {
          onSelectProperty(prop);
        });

        marker.on('mouseover', function () {
          this.openPopup();
        });

        marker.on('mouseout', function () {
          this.closePopup();
        });

        clusterGroupRef.current.addLayer(marker);
      });
    } catch (err) {
      console.error('[MapCluster properties error]:', err);
    }
  }, [properties, selectedPropertyId, onSelectProperty, Leaflet]);

  // Update schools overlay markers
  useEffect(() => {
    if (!schoolsGroupRef.current) return;
    schoolsGroupRef.current.clearLayers();

    if (!showSchools) return;

    schools.forEach((school) => {
      if (!school.lat || !school.lng) return;

      const schoolHtml = `
        <div class="custom-school-pin">
          <span>★ ${school.rating} ${school.name.split(' ')[0]}</span>
        </div>
      `;

      const schoolIcon = Leaflet.divIcon({
        className: 'school-pin-wrapper',
        html: schoolHtml,
        iconSize: [75, 22],
        iconAnchor: [37, 11]
      });

      const marker = Leaflet.marker([school.lat, school.lng], { icon: schoolIcon });
      marker.bindPopup(`
        <div style="font-family: Inter, sans-serif; padding: 4px; color: #0f172a;">
          <strong style="color: #4338ca;">${school.name}</strong><br/>
          <span>Type: ${school.school_type}</span><br/>
          <span style="font-weight: 700; color: #16a34a;">Rating: ${school.rating} / 10.0</span>
        </div>
      `);
      schoolsGroupRef.current.addLayer(marker);
    });
  }, [schools, showSchools]);

  return null;
}
