// components/analytics/YieldBreakdown.jsx
import React, { useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { TrendingUp, PieChart, DollarSign, ShieldAlert, Award } from 'lucide-react';

export default function YieldBreakdown({
  yieldData,
  onParamChange,
  estimatedRentUsd = 4500,
  appreciationPercent = 3.5,
  vacancyPercent = 5
}) {
  const [viewTab, setViewTab] = useState('EQUITY'); // 'EQUITY' | 'CASHFLOW'

  if (!yieldData || !yieldData.metrics) {
    return (
      <div className="glass-panel p-6 text-center text-slate-400">
        Loading investment yield metrics...
      </div>
    );
  }

  const { metrics, tenYearProjection } = yieldData;

  // Donut chart of Revenue allocation
  const doughnutData = {
    labels: ['Debt Service', 'Net Cash Flow', 'OpEx (Tax/HOA/Maint)'],
    datasets: [
      {
        data: [
          Math.max(0, metrics.annualDebtServiceUsd),
          Math.max(0, metrics.netAnnualCashFlowUsd),
          Math.max(0, metrics.annualGrossRentUsd - metrics.netOperatingIncomeUsd)
        ],
        backgroundColor: [
          'rgba(244, 63, 94, 0.8)',
          'rgba(16, 185, 129, 0.85)',
          'rgba(56, 189, 248, 0.75)'
        ],
        borderColor: '#0f172a',
        borderWidth: 2
      }
    ]
  };

  // 10-Year Equity & Property Value Growth Chart
  const projectionChartData = {
    labels: tenYearProjection.map((p) => `Yr ${p.year}`),
    datasets: [
      {
        type: 'line',
        label: 'Property Value ($)',
        data: tenYearProjection.map((p) => p.propertyValueUsd),
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        tension: 0.3,
        borderWidth: 2
      },
      {
        type: 'bar',
        label: 'Accumulated Equity ($)',
        data: tenYearProjection.map((p) => p.accumulatedEquityUsd),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderRadius: 4
      },
      {
        type: 'bar',
        label: 'Remaining Mortgage ($)',
        data: tenYearProjection.map((p) => p.remainingMortgageUsd),
        backgroundColor: 'rgba(244, 63, 94, 0.4)',
        borderRadius: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#cbd5e1', font: { family: 'Inter', size: 11 } }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        callbacks: {
          label: (context) => ` ${context.dataset.label}: $${Math.round(context.raw).toLocaleString()}`
        }
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: '#94a3b8',
          callback: (value) => `$${(value / 1000).toFixed(0)}k`
        }
      }
    }
  };

  return (
    <div className="glass-panel p-5 flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Investment Yield & Cap Rate</span>
            <span className="badge-tag badge-cyan font-mono">Real Estate Investor</span>
          </h3>
          <p className="text-xs text-slate-400">
            Cash-flow modeling, capitalization rates, and 10-year equity accumulation
          </p>
        </div>

        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setViewTab('EQUITY')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewTab === 'EQUITY'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            10-Yr Equity Growth
          </button>
          <button
            onClick={() => setViewTab('CASHFLOW')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewTab === 'CASHFLOW'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Revenue Breakdown
          </button>
        </div>
      </div>

      {/* Yield Metrics Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
            Gross Rental Yield
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-cyan-400 font-mono">
            {metrics.grossRentalYieldPercent}%
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Annual Rent / Price</span>
        </div>

        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
            Net Cap Rate
          </span>
          <span className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">
            {metrics.capRatePercent}%
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">NOI / Asset Price</span>
        </div>

        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
            Cash-on-Cash Return
          </span>
          <span className={`text-xl sm:text-2xl font-bold font-mono ${metrics.cashOnCashReturnPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {metrics.cashOnCashReturnPercent}%
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Net Cash Flow / Down + Fees</span>
        </div>

        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
            Monthly Net Cash Flow
          </span>
          <span className={`text-xl sm:text-2xl font-bold font-mono ${metrics.monthlyCashFlowUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {metrics.monthlyCashFlowUsd >= 0 ? `+$${Math.round(metrics.monthlyCashFlowUsd)}` : `-$${Math.round(Math.abs(metrics.monthlyCashFlowUsd))}`}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">After Debt & Expenses</span>
        </div>
      </div>

      {/* Investor Assumptions Controls */}
      <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <div className="flex justify-between text-slate-300 font-medium mb-1">
            <span>Estimated Monthly Rent:</span>
            <span className="text-cyan-400 font-mono font-bold">${Math.round(estimatedRentUsd).toLocaleString()}/mo</span>
          </div>
          <input
            type="range"
            min="1500"
            max="12000"
            step="100"
            value={estimatedRentUsd}
            onChange={(e) => onParamChange('estimatedRentUsd', Number(e.target.value))}
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-300 font-medium mb-1">
            <span>Annual Appreciation:</span>
            <span className="text-cyan-400 font-mono font-bold">{appreciationPercent}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={appreciationPercent}
            onChange={(e) => onParamChange('appreciationPercent', Number(e.target.value))}
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-300 font-medium mb-1">
            <span>Vacancy Rate Allowance:</span>
            <span className="text-cyan-400 font-mono font-bold">{vacancyPercent}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            step="1"
            value={vacancyPercent}
            onChange={(e) => onParamChange('vacancyPercent', Number(e.target.value))}
          />
        </div>
      </div>

      {/* Chart Display */}
      <div className="h-[280px] w-full pt-2 flex items-center justify-center">
        {viewTab === 'EQUITY' ? (
          <Bar data={projectionChartData} options={chartOptions} />
        ) : (
          <div className="h-[240px] w-[240px]">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { color: '#cbd5e1', font: { family: 'Inter', size: 10 } } }
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
