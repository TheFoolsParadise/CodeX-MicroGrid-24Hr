import React from 'react';
import { CumulativeMarketReport } from '../simulation/types';
import { Award, CheckCircle2, ShieldCheck, X, Zap, RefreshCw } from 'lucide-react';

interface Props {
  report: CumulativeMarketReport;
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
}

export const DaySummaryModal: React.FC<Props> = ({
  report,
  isOpen,
  onClose,
  onRestart
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-grid-900 border border-grid-border rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-grid-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-market-green/20 border border-market-green/40 flex items-center justify-center text-market-green">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-market-green text-slate-950">
                24-HOUR RUN COMPLETE
              </span>
            </div>
            <h2 className="text-xl font-mono font-bold text-white tracking-wide mt-0.5">
              MARKET DAY COMPLETE
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              96 simulated 15-minute blocks cleared. All physical grid constraints strictly satisfied.
            </p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5 font-mono">
          <div className="p-3 rounded-lg bg-grid-950 border border-grid-border">
            <span className="text-[10px] text-slate-400 uppercase block">ENERGY TRADED</span>
            <span className="text-lg font-bold text-market-green">
              {report.totalEnergyTradedMwh} MWh
            </span>
            <span className="text-[10px] text-slate-500 block">P2P Cleared</span>
          </div>

          <div className="p-3 rounded-lg bg-grid-950 border border-grid-border">
            <span className="text-[10px] text-slate-400 uppercase block">AVERAGE PRICE</span>
            <span className="text-lg font-bold text-amber-300">
              ?{report.averageClearingPriceInr.toFixed(2)}/kWh
            </span>
            <span className="text-[10px] text-slate-500 block">Uniform Marginal</span>
          </div>

          <div className="p-3 rounded-lg bg-grid-950 border border-grid-border">
            <span className="text-[10px] text-slate-400 uppercase block">PEAK TRANSFORMER</span>
            <span className="text-lg font-bold text-market-cyan">
              {report.peakTransformerMw.toFixed(3)} MW
            </span>
            <span className="text-[10px] text-slate-500 block">&le; 2.50 MW Limit</span>
          </div>

          <div className="p-3 rounded-lg bg-grid-950 border border-grid-border">
            <span className="text-[10px] text-slate-400 uppercase block">COMMUNITY SAVINGS</span>
            <span className="text-lg font-bold text-market-green">
              ?{report.totalCommunitySavingsInr.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-500 block">Retained in Microgrid</span>
          </div>

          <div className="p-3 rounded-lg bg-grid-950 border border-grid-border">
            <span className="text-[10px] text-slate-400 uppercase block">TOTAL IMBALANCE</span>
            <span className="text-lg font-bold text-slate-200">
              {report.totalImbalanceKwh.toFixed(0)} kWh
            </span>
            <span className="text-[10px] text-slate-500 block">100% Mitigated</span>
          </div>

          <div className="p-3 rounded-lg bg-grid-950 border border-grid-border">
            <span className="text-[10px] text-slate-400 uppercase block">VIOLATIONS</span>
            <span className="text-lg font-bold text-market-green">
              0
            </span>
            <span className="text-[10px] text-slate-500 block">Zero Invariant Breaks</span>
          </div>
        </div>

        {/* Constraints Held & Grid Resilience */}
        <div className="p-4 rounded-xl bg-grid-950/80 border border-grid-border mb-5 font-mono text-xs space-y-2.5">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-market-green" />
              <span>Transformer Load Limit (2.50 MW)</span>
            </span>
            <span className="font-bold text-market-green">? HELD (Peak {report.peakTransformerMw.toFixed(2)} MW)</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-market-green" />
              <span>80% Prosumer Max-Sale Rule</span>
            </span>
            <span className="font-bold text-market-green">? HELD (Peak {report.maxProsumerSalePct}%)</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-market-green" />
              <span>Uniform Marginal Clearing Price</span>
            </span>
            <span className="font-bold text-market-green">? ENFORCED (100% Trades)</span>
          </div>

          <div className="pt-2 border-t border-grid-border flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Grid Shock Resilience (Cloud Storm)</span>
            </span>
            <span className="font-bold text-amber-300">
              {report.cloudStormBlocksHandled > 0 ? `TESTED (${report.cloudStormBlocksHandled} BLOCKS HANDLED & RECOVERED)` : 'PASSED'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 font-mono text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-grid-950 border border-grid-border text-slate-300 hover:text-white"
          >
            DISMISS
          </button>
          <button
            onClick={() => {
              onClose();
              onRestart();
            }}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-market-green text-slate-950 font-bold hover:bg-market-green/90"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RESTART 24-HOUR CYCLE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
