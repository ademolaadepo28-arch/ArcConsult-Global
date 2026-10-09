// components/portfolio/PortfolioComparisonModal.jsx
import React from 'react';
import { X, Download, BookmarkCheck, ArrowRight, DollarSign, Layers } from 'lucide-react';

export default function PortfolioComparisonModal({
  isOpen,
  onClose,
  comparisons = [],
  onSelectProperty
}) {
  if (!isOpen) return null;

  const handleExportCSV = () => {
    if (comparisons.length === 0) return;

    const headers = [
      'Property Title',
      'Address',
      'Property Type',
      'Price (USD)',
      'Beds',
      'Baths',
      'Square Feet',
      'Price/SqFt',
      'Monthly Payment',
      'Gross Rental Yield (%)',
      'Net Cap Rate (%)',
      'Cash-on-Cash Return (%)',
      'Monthly Cash Flow'
    ];

    const rows = comparisons.map((p) => [
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.street_address}"`,
      p.property_type,
      p.priceUsd,
      p.bedrooms,
      p.bathrooms,
      p.square_feet,
      p.pricePerSqFtUsd,
      Math.round(p.monthlyPaymentUsd),
      p.grossYieldPercent,
      p.capRatePercent,
      p.cashOnCashReturnPercent,
      Math.round(p.monthlyCashFlowUsd)
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
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-5xl max-h-[90vh] flex flex-col bg-slate-950/95 border border-white/20 shadow-2xl overflow-hidden rounded-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Side-by-Side Financial Comparison</h2>
              <p className="text-xs text-slate-400">
                Comparative analysis across {comparisons.length} portfolio properties
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
              title="Export as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comparison Matrix Table */}
        <div className="flex-1 overflow-auto p-5">
          {comparisons.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No properties selected for comparison. Bookmark properties from the map to compare.
            </div>
          ) : (
            <div className="min-w-[650px] overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 px-4 font-semibold text-slate-400 w-1/4">Metric</th>
                    {comparisons.map((item) => (
                      <th key={item.id} className="py-3 px-4 font-bold text-white">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-bold text-emerald-400">{item.title}</span>
                          <span className="text-[11px] text-slate-400 font-normal">{item.street_address}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="hover:bg-white/5">
                    <td className="py-3 px-4 font-medium text-slate-400">Listing Price</td>
                    {comparisons.map((c) => (
                      <td key={c.id} className="py-3 px-4 font-mono font-bold text-emerald-300 text-sm">
                        ${c.priceUsd.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-3 px-4 font-medium text-slate-400">Property Type</td>
                    {comparisons.map((c) => (
                      <td key={c.id} className="py-3 px-4">
                        <span className="badge-tag badge-cyan">{c.property_type.replace('_', ' ')}</span>
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-3 px-4 font-medium text-slate-400">Beds / Baths</td>
                    {comparisons.map((c) => (
                      <td key={c.id} className="py-3 px-4 font-mono text-slate-200">
                        {c.bedrooms} Beds • {c.bathrooms} Baths
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-3 px-4 font-medium text-slate-400">Living Area & $/SqFt</td>
                    {comparisons.map((c) => (
                      <td key={c.id} className="py-3 px-4 font-mono text-slate-200">
                        {c.square_feet.toLocaleString()} sqft (${c.pricePerSqFtUsd}/sqft)
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-white/5 bg-slate-900/30">
                    <td className="py-3 px-4 font-medium text-slate-300">Est. Monthly Payment (PITI)</td>
                    {comparisons.map((c) => (
                      <td key={c.id} className="py-3 px-4 font-mono font-extrabold text-white text-sm">
                        ${Math.round(c.monthlyPaymentUsd).toLocaleString()}/mo
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-3 px-4 font-medium text-slate-400">Gross Rental Yield</td>
                    {comparisons.map((c) => (
                      <td key={c.id} className="py-3 px-4 font-mono font-bold text-cyan-400">
                        {c.grossYieldPercent}%
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-3 px-4 font-medium text-slate-400">Net Cap Rate</td>
                    {comparisons.map((c) => (
                      <td key={c.id} className="py-3 px-4 font-mono font-bold text-emerald-400">
                        {c.capRatePercent}%
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-3 px-4 font-medium text-slate-400">Cash-on-Cash Return</td>
                    {comparisons.map((c) => (
                      <td key={c.id} className="py-3 px-4 font-mono font-bold text-indigo-400">
                        {c.cashOnCashReturnPercent}%
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-3 px-4 font-medium text-slate-400">Monthly Net Cash Flow</td>
                    {comparisons.map((c) => (
                      <td key={c.id} className="py-3 px-4 font-mono font-bold text-emerald-400">
                        ${Math.round(c.monthlyCashFlowUsd).toLocaleString()}/mo
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium text-slate-400">Inspect Property</td>
                    {comparisons.map((c) => (
                      <td key={c.id} className="py-4 px-4">
                        <button
                          onClick={() => {
                            onSelectProperty(c);
                            onClose();
                          }}
                          className="btn-primary text-xs py-1.5 px-3"
                        >
                          View Analytics
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
