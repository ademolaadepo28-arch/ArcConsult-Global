// components/analytics/AmortizationChart.jsx
import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { DollarSign, Percent, Calendar, ShieldCheck, ArrowUpRight } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AmortizationChart({
  amortizationData,
  onParamChange,
  propertyPriceUsd = 895000,
  downPaymentPercent = 20,
  annualRate = 6.5,
  loanYears = 30,
  extraMonthlyPrincipalUsd = 0
}) {
  const [activeTab, setActiveTab] = useState('CURVE'); // 'CURVE' | 'BREAKDOWN' | 'SENSITIVITY'

  if (!amortizationData || !amortizationData.schedule) {
    return (
      <div className="glass-panel p-6 text-center text-slate-400">
        Loading amortization curves...
      </div>
    );
  }

  const { summary, schedule, sensitivity } = amortizationData;

  // Downsample 360 months to annual data points (every 12 months) for clean rendering
  const yearlyData = schedule.filter((s) => s.month % 12 === 0 || s.month === 1);
  const labels = yearlyData.map((s) => `Yr ${Math.ceil(s.month / 12)}`);

  // Remaining Balance & Principal Growth Chart
  const balanceChartData = {
    labels,
    datasets: [
      {
        label: 'Remaining Balance ($)',
        data: yearlyData.map((s) => s.remainingBalanceUsd),
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.12)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 2,
        pointHoverRadius: 6
      },
      {
        label: 'Cumulative Principal Paid ($)',
        data: yearlyData.map((s) => s.cumulativePrincipalUsd),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 2,
        pointHoverRadius: 6
      }
    ]
  };

  // Stacked Annual Principal vs Interest
  const principalInterestBars = {
    labels: labels.slice(0, 15), // First 15 years
    datasets: [
      {
        label: 'Principal ($)',
        data: yearlyData.slice(0, 15).map((s) => s.principalUsd * 12),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 4
      },
      {
        label: 'Interest ($)',
        data: yearlyData.slice(0, 15).map((s) => s.interestUsd * 12),
        backgroundColor: 'rgba(244, 63, 94, 0.75)',
        borderRadius: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#cbd5e1',
          font: { family: 'Inter', size: 12 }
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#38bdf8',
        bodyColor: '#f1f5f9',
        borderColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: $${Math.round(context.raw).toLocaleString()}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 11 },
          callback: (value) => `$${(value / 1000).toFixed(0)}k`
        }
      }
    }
  };

  return (
    <div className="glass-panel p-5 flex flex-col gap-5">
      {/* Header and Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Amortization Schedule</span>
            <span className="badge-tag badge-emerald font-mono">Integer Precision</span>
          </h3>
          <p className="text-xs text-slate-400">
            Compound interest modeling (PITI breakdown, 30-year paydown curve, rate sensitivity)
          </p>
        </div>

        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('CURVE')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'CURVE'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Paydown Curve
          </button>
          <button
            onClick={() => setActiveTab('BREAKDOWN')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'BREAKDOWN'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Annual P vs I
          </button>
          <button
            onClick={() => setActiveTab('SENSITIVITY')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'SENSITIVITY'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Rate Sensitivity
          </button>
        </div>
      </div>

      {/* Primary Monthly Payment Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
            Total Monthly Payment
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono">
            ${Math.round(summary.totalMonthlyPaymentUsd).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">PITI + HOA + PMI</span>
        </div>

        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
            Principal & Interest
          </span>
          <span className="text-xl sm:text-2xl font-bold text-white font-mono">
            ${Math.round(summary.monthlyPrincipalInterestUsd).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Base Loan Amortization</span>
        </div>

        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
            Total Lifetime Interest
          </span>
          <span className="text-xl sm:text-2xl font-bold text-rose-400 font-mono">
            ${Math.round(summary.totalInterestPaidUsd).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">{loanYears} Years Cumulative</span>
        </div>

        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
            Loan Principal
          </span>
          <span className="text-xl sm:text-2xl font-bold text-cyan-400 font-mono">
            ${Math.round(summary.principalUsd).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">{100 - downPaymentPercent}% LTV</span>
        </div>
      </div>

      {/* Interactive Controls Bar: Down Payment, Interest Rate, Term, Extra Monthly */}
      <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <div className="flex justify-between text-slate-300 font-medium mb-1">
            <span>Down Payment:</span>
            <span className="text-emerald-400 font-mono font-bold">{downPaymentPercent}% (${Math.round((propertyPriceUsd * downPaymentPercent) / 100).toLocaleString()})</span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            step="1"
            value={downPaymentPercent}
            onChange={(e) => onParamChange('downPaymentPercent', Number(e.target.value))}
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-300 font-medium mb-1">
            <span>Interest Rate:</span>
            <span className="text-emerald-400 font-mono font-bold">{annualRate}%</span>
          </div>
          <input
            type="range"
            min="3.0"
            max="12.0"
            step="0.125"
            value={annualRate}
            onChange={(e) => onParamChange('annualRate', Number(e.target.value))}
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-300 font-medium mb-1">
            <span>Term Length:</span>
            <span className="text-emerald-400 font-mono font-bold">{loanYears} Years</span>
          </div>
          <div className="flex gap-2 mt-1">
            {[15, 20, 30].map((term) => (
              <button
                key={term}
                onClick={() => onParamChange('loanYears', term)}
                className={`flex-1 py-1 rounded text-xs font-semibold ${
                  loanYears === term
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {term}y
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-slate-300 font-medium mb-1">
            <span>Extra Principal /mo:</span>
            <span className="text-emerald-400 font-mono font-bold">+${extraMonthlyPrincipalUsd}</span>
          </div>
          <input
            type="range"
            min="0"
            max="2000"
            step="50"
            value={extraMonthlyPrincipalUsd}
            onChange={(e) => onParamChange('extraMonthlyPrincipalUsd', Number(e.target.value))}
          />
        </div>
      </div>

      {/* Active Chart Display */}
      <div className="h-[280px] w-full pt-2">
        {activeTab === 'CURVE' && <Line data={balanceChartData} options={chartOptions} />}

        {activeTab === 'BREAKDOWN' && (
          <Bar
            data={principalInterestBars}
            options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                x: { ...chartOptions.scales.x, stacked: true },
                y: { ...chartOptions.scales.y, stacked: true }
              }
            }}
          />
        )}

        {activeTab === 'SENSITIVITY' && (
          <div className="h-full overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-medium">
                  <th className="py-2 px-3">Interest Rate</th>
                  <th className="py-2 px-3">Monthly Principal & Int</th>
                  <th className="py-2 px-3">Total Lifetime Interest</th>
                  <th className="py-2 px-3">Monthly Difference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sensitivity?.map((item) => {
                  const diff = item.monthlyPaymentUsd - summary.monthlyPrincipalInterestUsd;
                  return (
                    <tr
                      key={item.rate}
                      className={`hover:bg-white/5 ${
                        item.isCurrent ? 'bg-emerald-500/10 font-bold text-emerald-300' : 'text-slate-300'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono">{item.rate}% {item.isCurrent && '(Selected)'}</td>
                      <td className="py-2.5 px-3 font-mono">${Math.round(item.monthlyPaymentUsd).toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono">${Math.round(item.totalCostUsd - summary.principalUsd).toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono">
                        {diff === 0 ? '—' : (diff > 0 ? `+$${Math.round(diff)}` : `-$${Math.round(Math.abs(diff))}`)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
