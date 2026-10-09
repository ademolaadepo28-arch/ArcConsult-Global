// components/modals/ArchitectureModal.jsx
import React, { useState } from 'react';
import {
  X,
  Cpu,
  Database,
  Layers,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  Zap,
  Activity,
  Calculator,
  Compass,
  FileCode2
} from 'lucide-react';
import api from '../../services/api';

export default function ArchitectureModal({
  isOpen,
  onClose,
  engineInfo = 'In-Memory PostGIS Spatial Engine',
  executionTimeMs = 0,
  totalProperties = 8,
  totalSchools = 6
}) {
  const [demoToken, setDemoToken] = useState(localStorage.getItem('arcconsult_auth_token') || '');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('SPEC'); // 'SPEC' | 'GEOSPATIAL' | 'MATH' | 'AUTH'

  if (!isOpen) return null;

  const handleGenerateToken = async () => {
    setGenerating(true);
    try {
      const res = await api.get('/auth/demo-token');
      if (res.data && res.data.token) {
        localStorage.setItem('arcconsult_auth_token', res.data.token);
        setDemoToken(res.data.token);
      }
    } catch (err) {
      console.error('Failed to get demo token:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyToken = () => {
    if (!demoToken) return;
    navigator.clipboard.writeText(demoToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[2100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#090d15]/95 border border-white/20 shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-[#090d15] rounded-[10px] flex items-center justify-center text-emerald-400">
                <Cpu className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                  Architecture Spec #05
                </h3>
                <span className="badge-tag badge-emerald text-[10px]">Production Spec</span>
              </div>
              <p className="text-xs text-slate-400">
                PostGIS Spatial Vector Engine • 30-Year Integer Precision Amortization
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-slate-950/80 px-4 pt-2 gap-2 text-xs overflow-x-auto">
          {[
            { id: 'SPEC', label: 'Overview & Stack', icon: Layers },
            { id: 'GEOSPATIAL', label: 'PostGIS Spatial Engine', icon: Compass },
            { id: 'MATH', label: 'Financial Mathematics', icon: Calculator },
            { id: 'AUTH', label: 'JWT Authentication', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-3 border-b-2 font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs text-slate-300 leading-relaxed">
          {activeTab === 'SPEC' && (
            <div className="space-y-4">
              {/* Live HUD Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-900/70 p-3 rounded-xl border border-white/10">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Engine Status</span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Active & Healthy
                  </span>
                </div>
                <div className="bg-slate-900/70 p-3 rounded-xl border border-white/10">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Execution Latency</span>
                  <span className="text-xs sm:text-sm font-extrabold text-cyan-400 font-mono">
                    {executionTimeMs} ms
                  </span>
                </div>
                <div className="bg-slate-900/70 p-3 rounded-xl border border-white/10">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Spatial Listings</span>
                  <span className="text-xs sm:text-sm font-extrabold text-white font-mono">
                    {totalProperties} Available
                  </span>
                </div>
                <div className="bg-slate-900/70 p-3 rounded-xl border border-white/10">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Ranked Schools</span>
                  <span className="text-xs sm:text-sm font-extrabold text-indigo-400 font-mono">
                    {totalSchools} Geocoded
                  </span>
                </div>
              </div>

              {/* Three-Tier Architecture Summary */}
              <div className="bg-slate-900/50 p-4 rounded-xl border border-white/10 space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Full-Stack Architecture Spec #05
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-white/5 space-y-1.5">
                    <span className="badge-tag badge-cyan text-[9px]">Frontend Tier</span>
                    <h5 className="font-bold text-white text-xs">React 18 + Leaflet</h5>
                    <p className="text-[11px] text-slate-400">
                      Leaflet clustering, Chart.js financial projections, viewport bounding-box synchronization.
                    </p>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-white/5 space-y-1.5">
                    <span className="badge-tag badge-emerald text-[9px]">API Tier</span>
                    <h5 className="font-bold text-white text-xs">Express + Node.js</h5>
                    <p className="text-[11px] text-slate-400">
                      Sub-100ms geospatial routing, integer-cents compound interest computation, JWT auth.
                    </p>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-white/5 space-y-1.5">
                    <span className="badge-tag badge-indigo text-[9px]">Database Tier</span>
                    <h5 className="font-bold text-white text-xs">PostGIS Vector Engine</h5>
                    <p className="text-[11px] text-slate-400">
                      GEOMETRY(Point, 4326) columns, GiST spatial indexing, ST_DWithin and ST_MakeEnvelope.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'GEOSPATIAL' && (
            <div className="space-y-4">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-white/10 space-y-2">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5 text-emerald-400">
                  <Compass className="w-4 h-4" />
                  1. Viewport Bounding Box (ST_MakeEnvelope)
                </h4>
                <p className="text-slate-300 text-xs">
                  Whenever the user pans or zooms the map, debounced map bounds (<code className="text-emerald-300 bg-black/40 px-1 py-0.5 rounded">minLng, minLat, maxLng, maxLat</code>) are sent to <code className="text-cyan-300 bg-black/40 px-1 py-0.5 rounded">/api/properties?bbox=...</code>.
                </p>
                <pre className="bg-black/60 p-3 rounded-lg text-emerald-300 font-mono text-[11px] overflow-x-auto border border-white/5">
{`SELECT id, title, price_cents, ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat
FROM properties
WHERE location && ST_MakeEnvelope($1, $2, $3, $4, 4326);`}
                </pre>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-white/10 space-y-2">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5 text-cyan-400">
                  <Zap className="w-4 h-4" />
                  2. Radius Proximity Search (ST_DWithin)
                </h4>
                <p className="text-slate-300 text-xs">
                  Radial distance queries use spherical geography mathematics on the WGS 84 ellipsoid with meters radius.
                </p>
                <pre className="bg-black/60 p-3 rounded-lg text-cyan-300 font-mono text-[11px] overflow-x-auto border border-white/5">
{`SELECT id, title, price_cents,
  ST_Distance(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) as distance_meters
FROM properties
WHERE ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
ORDER BY distance_meters ASC;`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'MATH' && (
            <div className="space-y-4">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-white/10 space-y-3">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5 text-emerald-400">
                  <Calculator className="w-4 h-4" />
                  Compound Interest Formula
                </h4>
                <div className="bg-black/40 p-3 rounded-lg border border-white/5 text-center font-mono text-sm text-emerald-300">
                  M = P × [ i(1 + i)^n ] ÷ [ (1 + i)^n - 1 ]
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  <li><strong className="text-white">P:</strong> Principal Loan Amount (Purchase Price minus Down Payment)</li>
                  <li><strong className="text-white">i:</strong> Monthly interest rate (<code className="text-cyan-300">annualRate / 12 / 100</code>)</li>
                  <li><strong className="text-white">n:</strong> Total number of amortization payments (<code className="text-cyan-300">loanYears × 12</code>)</li>
                  <li><strong className="text-emerald-400">Zero Floating-Point Drift:</strong> All calculations are executed strictly in integer cents using <code className="text-white bg-black/40 px-1 py-0.5 rounded">Math.round()</code>.</li>
                </ul>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-white/10 space-y-2">
                <h4 className="font-bold text-white text-xs text-indigo-400">
                  Investor Capitalization & Return Metrics
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                    <strong className="text-white block mb-0.5">Net Operating Income (NOI):</strong>
                    <span className="text-slate-400 font-mono">Gross Rent × (1 - Vacancy) - Property Taxes - HOA - OpEx</span>
                  </div>
                  <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                    <strong className="text-white block mb-0.5">Net Cap Rate (%):</strong>
                    <span className="text-slate-400 font-mono">(Annual NOI ÷ Purchase Price) × 100</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'AUTH' && (
            <div className="space-y-4">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs flex items-center gap-1.5 text-cyan-400">
                      <ShieldCheck className="w-4 h-4" />
                      JWT Authentication & Demo User
                    </h4>
                    <p className="text-slate-400 text-xs">
                      Active User: <strong className="text-white">Alexander Wright</strong> (investor@arcconsult.com)
                    </p>
                  </div>

                  <button
                    onClick={handleGenerateToken}
                    disabled={generating}
                    className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{generating ? 'Requesting...' : 'Generate New Token'}</span>
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    readOnly
                    rows={3}
                    value={demoToken || 'No token generated yet. Click "Generate New Token" above.'}
                    className="w-full bg-black/60 p-3 pr-20 rounded-lg text-emerald-300 font-mono text-[11px] border border-white/10 resize-none outline-none"
                  />
                  {demoToken && (
                    <button
                      onClick={handleCopyToken}
                      className="absolute right-2 top-2 btn-secondary text-[11px] py-1 px-2 flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-slate-950 flex items-center justify-between text-xs">
          <span className="text-slate-400">ArcConsult Global — Architecture Spec #05</span>
          <button
            onClick={onClose}
            className="btn-secondary text-xs py-1.5 px-4"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
