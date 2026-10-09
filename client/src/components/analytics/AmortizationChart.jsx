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
import { DollarSign, Percent, Calendar, ShieldCheck, Plus, Minus, ArrowUpRight } from 'lucide-react';

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
        Calculating amortization curves...
      </div>
    );
  }

  const { summary, schedule, sensitivity } = amortizationData;

  // Downsample 360 months to annual data points (every 12 months)
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
        borderWidth: 2,
        pointRadius: 1,
        pointHoverRadius: 5
      },
      {
        label: 'Principal Paid ($)',
        data: yearlyData.map((s) => s.cumulativePrincipalUsd),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 1,
        pointHoverRadius: 5
      }
    ]
  };

  // Stacked Annual Principal vs Interest
  const principalInterestBars = {
    labels: labels.slice(0, 15),
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
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        labels: {
          color: '#cbd5e1',
          font: { family: 'Inter', size: 10 },
          boxWidth: 12
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#38bdf8',
        bodyColor: '#f1f5f9',
        borderColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        padding: 8,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: $${Math.round(context.raw).toLocaleString()}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 10 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 10 },
          callback: (value) => `$${(value / 1000).toFixed(0)}k`
        }
      }
    }
  };

  return (
    <div className="glass-panel p-4 sm:p-5 flex flex-col gap-4">
      {/* Header and Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white">
              Amortization Schedule
            </h3>
            <span className="badge-tag badge-emerald font-mono text-[10px]">
              Exact Math
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            PITI breakdown, 30-year paydown curve, and rate sensitivity
          </p>
        </div>

        {/* Responsive Tab Bar */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-white/10 text-xs w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('CURVE')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-semibold transition-all touch-active ${
              activeTab === 'CURVE'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Paydown Curve
          </button>
          <button
            onClick={() => setActiveTab('BREAKDOWN')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-semibold transition-all touch-active ${
              activeTab === 'BREAKDOWN'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Annual P & I
          </button>
          <button
            onClick={() => setActiveTab('SENSITIVITY')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-semibold transition-all touch-active ${
              activeTab === 'SENSITIVITY'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sensitivity
          </button>
        </div>
      </div>

      {/* Primary Payment Cards Grid (2x2 on mobile, 4x1 on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">
            Total Monthly Payment
          </span>
          <span className="text-lg sm:text-xl font-extrabold text-emerald-400 font-mono">
            ${Math.round(summary.totalMonthlyPaymentUsd).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block">PITI + HOA + PMI</span>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">
            Principal & Interest
          </span>
          <span className="text-lg sm:text-xl font-bold text-white font-mono">
            ${Math.round(summary.monthlyPrincipalInterestUsd).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block">Base Debt Service</span>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">
            Total Interest Paid
          </span>
          <span className="text-lg sm:text-xl font-bold text-rose-400 font-mono">
            ${Math.round(summary.totalInterestPaidUsd).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block">{loanYears} Years Life</span>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">
            Loan Principal
          </span>
          <span className="text-lg sm:text-xl font-bold text-cyan-400 font-mono">
            ${Math.round(summary.principalUsd).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block">{100 - downPaymentPercent}% LTV</span>
        </div>
      </div>

      {/* Interactive Controls Bar: Down Payment, Interest Rate, Term, Extra Monthly */}
      <div className="bg-slate-950/60 p-3.5 sm:p-4 rounded-xl border border-white/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Down Payment */}
        <div>
          <div className="flex justify-between text-slate-300 font-medium mb-1">
            <span>Down Payment:</span>
            <span className="text-emerald-400 font-mono font-bold">
              {downPaymentPercent}% (${Math.round((propertyPriceUsd * downPaymentPercent) / 100).toLocaleString()})
            </span>
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <button
              onClick={() => onParamChange('downPaymentPercent', Math.max(5, downPaymentPercent - 5))}
              className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 touch-active"
            >
              <Minus className="w-3 h-3" />
            </button>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={downPaymentPercent}
              onChange={(e) => onParamChange('downPaymentPercent', Number(e.target.value))}
              className="flex-1"
            />
            <button
              onClick={() => onParamChange('downPaymentPercent', Math.min(50, downPaymentPercent + 5))}
              className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 touch-active"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-1">
            {[10, 20, 30].map((pct) => (
              <button
                key={pct}
                onClick={() => onParamChange('downPaymentPercent', pct)}
                className={`flex-1 py-0.5 rounded text-[10px] font-medium border ${
                  downPaymentPercent === pct
                    ? 'border-emerald-500 text-emerald-300 bg-emerald-500/10'
                    : 'border-white/5 text-slate-400 bg-white/5 hover:bg-white/10'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Interest Rate */}
        <div>
          <div className="flex justify-between text-slate-300 font-medium mb-1">
            <span>Interest Rate:</span>
            <span className="text-emerald-400 font-mono font-bold">{annualRate}%</span>
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <button
              onClick={() => onParamChange('annualRate', Number(Math.max(3.0, annualRate - 0.25).toFixed(2)))}
              className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 touch-active"
            >
              <Minus className="w-3 h-3" />
            </button>
            <input
              type="range"
              min="3.0"
              max="11.0"
              step="0.125"
              value={annualRate}
              onChange={(e) => onParamChange('annualRate', Number(e.target.value))}
              className="flex-1"
            />
            <button
              onClick={() => onParamChange('annualRate', Number(Math.min(11.0, annualRate + 0.25).toFixed(2)))}
              className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 touch-active"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-1">
            {[5.5, 6.5, 7.5].map((rate) => (
              <button
                key={rate}
                onClick={() => onParamChange('annualRate', rate)}
                className={`flex-1 py-0.5 rounded text-[10px] font-medium border ${
                  annualRate === rate
                    ? 'border-emerald-500 text-emerald-300 bg-emerald-500/10'
                    : 'border-white/5 text-slate-400 bg-white/5 hover:bg-white/10'
                }`}
              >
                {rate}%
              </button>
            ))}
          </div>
        </div>

        {/* Loan Term */}
        <div>
          <div className="flex justify-between text-slate-300 font-medium mb-1">
            <span>Loan Term:</span>
            <span className="text-emerald-400 font-mono font-bold">{loanYears} Years</span>
          </div>
          <div className="grid grid-cols-3 gap-1 mt-1">
            {[15, 20, 30].map((term) => (
              <button
                key={term}
                onClick={() => onParamChange('loanYears', term)}
                className={`py-2 rounded-lg text-xs font-semibold transition-all touch-active ${
                  loanYears === term
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {term} yrs
              </button>
            ))}
          </div>
        </div>

        {/* Extra Principal Payment */}
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
            className="w-full mt-2"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>$0</span>
            <span>$1,000</span>
            <span>$2,000</span>
          </div>
        </div>
      </div>

      {/* Responsive Visualizer Area */}
      <div className="h-[240px] sm:h-[280px] w-full pt-1">
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
          <div className="h-full overflow-y-auto pr-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-[#0d121d] z-10">
                <tr className="border-b border-white/10 text-slate-400 font-medium">
                  <th className="py-2 px-2.5">Rate</th>
                  <th className="py-2 px-2.5">Monthly P&I</th>
                  <th className="py-2 px-2.5 hidden sm:table-cell">Total Interest</th>
                  <th className="py-2 px-2.5">Diff /mo</th>
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
                      <td className="py-2 px-2.5 font-mono">{item.rate}% {item.isCurrent && '★'}</td>
                      <td className="py-2 px-2.5 font-mono">${Math.round(item.monthlyPaymentUsd).toLocaleString()}</td>
                      <td className="py-2 px-2.5 font-mono hidden sm:table-cell">${Math.round(item.totalCostUsd - summary.principalUsd).toLocaleString()}</td>
                      <td className="py-2 px-2.5 font-mono">
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
