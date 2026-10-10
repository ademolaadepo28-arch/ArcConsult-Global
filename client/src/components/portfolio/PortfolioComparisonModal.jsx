// components/portfolio/PortfolioComparisonModal.jsx
import React, { useState } from 'react';
import { X, Download, BookmarkCheck, ArrowRight, DollarSign, Layers, Table, Grid } from 'lucide-react';

export default function PortfolioComparisonModal({
  isOpen,
  onClose,
  comparisons = [],
  onSelectProperty
}) {
  const [mobileView, setMobileView] = useState('CARDS'); // 'TABLE' | 'CARDS' for mobile

  if (!isOpen) return null;

  const handleExportCSV = () => {
    if (comparisons.length === 0) return;

    const headers = [
      'Property Title',
      'Address',
      'Property Type',
      'Price (NGN)',
      'Beds',
      'Baths',
      'Square Feet',
      'Price/SqFt (NGN)',
      'Monthly Payment',
      'Gross Rental Yield (%)',
      'Net Cap Rate (%)',
      'Cash-on-Cash Return (%)',
      'Monthly Cash Flow'
    ];

    const rows = comparisons.map((p) => [
      `"${(p.title || 'Property').replace(/"/g, '""')}"`,
      `"${(p.street_address || '').replace(/"/g, '""')}"`,
      p.property_type || '',
      p.priceUsd || 0,
      p.bedrooms ?? '',
      p.bathrooms ?? '',
      p.square_feet || 0,
      p.pricePerSqFtUsd || 0,
      Math.round(p.monthlyPaymentUsd || 0),
      p.grossYieldPercent ?? 0,
      p.capRatePercent ?? 0,
      p.cashOnCashReturnPercent ?? 0,
      Math.round(p.monthlyCashFlowUsd || 0)
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `arcconsult-portfolio-comparison-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-5xl h-full sm:h-auto sm:max-h-[90vh] flex flex-col bg-slate-950/95 border-0 sm:border sm:border-white/20 shadow-2xl overflow-hidden rounded-none sm:rounded-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-white/10 bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 mr-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-white truncate">Side-by-Side Comparison</h2>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                Comparing {comparisons.length} portfolio listings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* View Mode Toggle for Small Screens */}
            <div className="flex sm:hidden bg-slate-900 p-0.5 rounded-lg border border-white/10 text-xs">
              <button
                onClick={() => setMobileView('CARDS')}
                className={`p-1.5 rounded ${mobileView === 'CARDS' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                title="Card View"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setMobileView('TABLE')}
                className={`p-1.5 rounded ${mobileView === 'TABLE' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                title="Table View"
              >
                <Table className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="btn-secondary text-xs py-1.5 px-2 sm:py-2 sm:px-3 flex items-center gap-1.5 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
              title="Export as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comparison Content */}
        <div className="flex-1 overflow-auto touch-scroll p-3 sm:p-5 safe-bottom-pad">
          {comparisons.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              No properties selected for comparison. Bookmark properties from the map to compare.
            </div>
          ) : (
            <>
              {/* Mobile Card Carousel View (Default on Small Screens) */}
              <div className={`sm:hidden flex flex-col gap-4 ${mobileView === 'TABLE' ? 'hidden' : 'block'}`}>
                {comparisons.map((c) => (
                  <div key={c.id} className="glass-panel p-3.5 flex flex-col gap-2.5 border border-white/10">
                    {/* Property Thumbnail */}
                    <div className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-900">
                      <img
                        src={c.image_url || '/images/properties/prop-1-main.jpg'}
                        alt={c.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/properties/prop-1-main.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute top-2 left-2">
                        <span className="badge-tag badge-cyan text-[9px] bg-slate-950/80 backdrop-blur-md">
                          {(c.property_type || '').replace('_', ' ')}
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <span className="text-sm font-extrabold text-emerald-400 font-mono">
                          ₦{(c.priceUsd || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white">{c.title}</h4>
                        <p className="text-[11px] text-slate-400">{c.street_address}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">₦{(c.pricePerSqFtUsd || 0).toLocaleString()}/sqft</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-2.5 rounded-xl border border-white/5 font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Monthly P&I</span>
                        <span className="text-white font-bold">₦{Math.round(c.monthlyPaymentUsd || 0).toLocaleString()}/mo</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Gross Yield</span>
                        <span className="text-cyan-400 font-bold">{c.grossYieldPercent}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Net Cap Rate</span>
                        <span className="text-emerald-400 font-bold">{c.capRatePercent}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Cash-on-Cash</span>
                        <span className="text-indigo-400 font-bold">{c.cashOnCashReturnPercent}%</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectProperty(c);
                        onClose();
                      }}
                      className="btn-primary text-xs py-2 w-full mt-1"
                    >
                      Inspect Financial Model
                    </button>
                  </div>
                ))}
              </div>

              {/* Table View (Default on Desktop, Optional on Mobile) */}
              <div className={`overflow-x-auto touch-scroll ${mobileView === 'CARDS' ? 'hidden sm:block' : 'block'}`}>
                <table className="w-full text-left text-xs border-collapse min-w-[620px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-3 px-3.5 font-semibold text-slate-400 w-1/4">Metric</th>
                      {comparisons.map((item) => (
                        <th key={item.id} className="py-3 px-3.5 font-bold text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-900 border border-white/10 shrink-0">
                              <img
                                src={item.image_url || '/images/properties/prop-1-main.jpg'}
                                alt={item.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/images/properties/prop-1-main.jpg';
                                }}
                              />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs sm:text-sm font-bold text-emerald-400 line-clamp-1">{item.title}</span>
                              <span className="text-[10px] text-slate-400 font-normal line-clamp-1">{item.street_address}</span>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr className="hover:bg-white/5">
                      <td className="py-2.5 px-3.5 font-medium text-slate-400">Listing Price</td>
                      {comparisons.map((c) => (
                        <td key={c.id} className="py-2.5 px-3.5 font-mono font-bold text-emerald-300 text-sm">
                          ₦{(c.priceUsd || 0).toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-white/5">
                      <td className="py-2.5 px-3.5 font-medium text-slate-400">Property Type</td>
                      {comparisons.map((c) => (
                        <td key={c.id} className="py-2.5 px-3.5">
                          <span className="badge-tag badge-cyan">{(c.property_type || '').replace('_', ' ')}</span>
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-white/5">
                      <td className="py-2.5 px-3.5 font-medium text-slate-400">Beds / Baths</td>
                      {comparisons.map((c) => (
                        <td key={c.id} className="py-2.5 px-3.5 font-mono text-slate-200">
                          {c.bedrooms ?? '—'} bd • {c.bathrooms ?? '—'} ba
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-white/5">
                      <td className="py-2.5 px-3.5 font-medium text-slate-400">Living Area & ₦/SqFt</td>
                      {comparisons.map((c) => (
                        <td key={c.id} className="py-2.5 px-3.5 font-mono text-slate-200">
                          {(c.square_feet || 0).toLocaleString()} sqft (₦{(c.pricePerSqFtUsd || 0).toLocaleString()}/sqft)
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-white/5 bg-slate-900/30">
                      <td className="py-2.5 px-3.5 font-medium text-slate-300">Est. Monthly Payment</td>
                      {comparisons.map((c) => (
                        <td key={c.id} className="py-2.5 px-3.5 font-mono font-extrabold text-white text-sm">
                          ₦{Math.round(c.monthlyPaymentUsd || 0).toLocaleString()}/mo
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-white/5">
                      <td className="py-2.5 px-3.5 font-medium text-slate-400">Gross Rental Yield</td>
                      {comparisons.map((c) => (
                        <td key={c.id} className="py-2.5 px-3.5 font-mono font-bold text-cyan-400">
                          {c.grossYieldPercent ?? 0}%
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-white/5">
                      <td className="py-2.5 px-3.5 font-medium text-slate-400">Net Cap Rate</td>
                      {comparisons.map((c) => (
                        <td key={c.id} className="py-2.5 px-3.5 font-mono font-bold text-emerald-400">
                          {c.capRatePercent ?? 0}%
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-white/5">
                      <td className="py-2.5 px-3.5 font-medium text-slate-400">Cash-on-Cash Return</td>
                      {comparisons.map((c) => (
                        <td key={c.id} className="py-2.5 px-3.5 font-mono font-bold text-indigo-400">
                          {c.cashOnCashReturnPercent ?? 0}%
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-white/5">
                      <td className="py-2.5 px-3.5 font-medium text-slate-400">Monthly Net Cash Flow</td>
                      {comparisons.map((c) => (
                        <td key={c.id} className="py-2.5 px-3.5 font-mono font-bold text-emerald-400">
                          ₦{Math.round(c.monthlyCashFlowUsd || 0).toLocaleString()}/mo
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-3.5 font-medium text-slate-400">Action</td>
                      {comparisons.map((c) => (
                        <td key={c.id} className="py-3 px-3.5">
                          <button
                            onClick={() => {
                              onSelectProperty(c);
                              onClose();
                            }}
                            className="btn-primary text-xs py-1.5 px-3"
                          >
                            Select
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
