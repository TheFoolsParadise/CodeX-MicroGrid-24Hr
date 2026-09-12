import React from 'react';
import { MarketBlock, CloudStormState } from '../simulation/types';
import { CloudRain, ArrowDownRight } from 'lucide-react';

interface Props {
  block: MarketBlock;
  stormState: CloudStormState | null;
}

export const CloudStormBanner: React.FC<Props> = ({ block, stormState }) => {
  if (!block.isStormActive && !stormState?.active) {
    return null;
  }

  const { stormDetail } = block;
  const expectedMw = stormDetail ? (stormDetail.expectedSolarKw / 1000).toFixed(2) : '1.42';
  const availableMw = stormDetail ? (stormDetail.availableSolarKw / 1000).toFixed(2) : '0.57';
  const shortfallMw = stormDetail ? (stormDetail.shortfallKw / 1000).toFixed(2) : '0.85';
  const remainingBlocks = stormDetail?.remainingBlocks ?? 4;

  return (
    <div className="bg-amber-500/10 border-2 border-amber-500/50 rounded-xl p-4 relative overflow-hidden shadow-2xl shadow-amber-950/40">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Shock Badge & Alert Title */}
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 animate-pulse">
            <CloudRain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-amber-500 text-slate-950">
                CRITICAL EVENT
              </span>
              <h2 className="text-base font-mono font-bold text-amber-300 tracking-wide">
                CLOUD STORM DETECTED
              </h2>
            </div>
            <p className="text-xs text-amber-200/80 font-sans mt-0.5">
              Solar generation instantaneously dropped by <strong className="text-white">60%</strong> across all 180 rooftops.
            </p>
          </div>
        </div>

        {/* Shock Numbers */}
        <div className="grid grid-cols-3 gap-3 bg-grid-950/80 px-4 py-2 rounded-lg border border-amber-500/30 font-mono">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">EXPECTED SUPPLY</span>
            <span className="text-sm font-bold text-slate-200">{expectedMw} MW</span>
          </div>
          <div className="border-l border-white/10 pl-3">
            <span className="text-[10px] text-amber-400/80 block uppercase">AVAILABLE SUPPLY</span>
            <span className="text-sm font-bold text-amber-300 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
              {availableMw} MW
            </span>
          </div>
          <div className="border-l border-white/10 pl-3">
            <span className="text-[10px] text-red-400 block uppercase">SHORTFALL</span>
            <span className="text-sm font-bold text-red-400">{shortfallMw} MW</span>
          </div>
        </div>

        {/* Countdown & Resolution Mechanism */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">EVENT DURATION</span>
            <div className="flex items-center space-x-1.5 justify-end">
              <span className="text-base font-mono font-bold text-amber-400">
                {remainingBlocks}
              </span>
              <span className="text-xs font-mono text-slate-400">BLOCKS REMAINING</span>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded bg-grid-950/90 border border-grid-border text-right font-mono">
            <span className="text-[10px] text-market-cyan block font-semibold">AUTOMATED MITIGATION</span>
            <span className="text-xs font-bold text-slate-200">RESIDUAL GRID IMPORT</span>
            <span className="text-[10px] text-slate-400 block">Backup Tariff: ?8.50/kWh</span>
          </div>
        </div>
      </div>
    </div>
  );
};
