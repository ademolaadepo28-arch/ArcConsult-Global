// components/schools/SchoolMetricsBadge.jsx
import React from 'react';
import { GraduationCap, Award, MapPin, ExternalLink } from 'lucide-react';

export default function SchoolMetricsBadge({ schools = [], onSelectSchool }) {
  if (!schools || schools.length === 0) {
    return (
      <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 text-xs text-slate-400 text-center">
        No assigned schools found within 5km radius of this property.
      </div>
    );
  }

  // Calculate average rating
  const avgRating = (
    schools.reduce((acc, s) => acc + Number(s.rating), 0) / schools.length
  ).toFixed(1);

  return (
    <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-indigo-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Neighborhood Schools (Spatial Join)
          </h4>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400">Avg Rating:</span>
          <span className="badge-tag badge-indigo font-mono font-bold text-xs">
            ★ {avgRating} / 10
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {schools.map((school) => {
          const ratingColor =
            Number(school.rating) >= 9.0
              ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
              : Number(school.rating) >= 8.0
              ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
              : 'text-amber-400 border-amber-500/30 bg-amber-500/10';

          const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            school.name + ', Austin, TX'
          )}`;

          return (
            <div
              key={school.id || school.name}
              onClick={() => onSelectSchool && onSelectSchool(school)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 hover:border-indigo-500/40 border border-transparent transition-all text-xs cursor-pointer group select-none"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectSchool) onSelectSchool(school);
                  }}
                  className="w-7 h-7 rounded-lg bg-indigo-500/15 group-hover:bg-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0 transition-colors"
                  title="Locate school on map"
                >
                  <MapPin className="w-3.5 h-3.5" />
                </button>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-slate-200 group-hover:text-white truncate">
                    {school.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {school.school_type} School •{' '}
                    {school.distance_meters
                      ? `${(school.distance_meters / 1000).toFixed(2)} km away`
                      : 'Nearby'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/10 transition-colors"
                  title="View on Google Maps"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div
                  className={`px-2 py-0.5 rounded-md border font-mono font-bold text-xs ${ratingColor}`}
                >
                  ★ {Number(school.rating).toFixed(1)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
