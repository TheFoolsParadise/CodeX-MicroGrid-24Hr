import React from 'react';
import { MarketBlock } from '../simulation/types';
import { Activity, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';

interface Props {
  block: MarketBlock;
  currentBlockIndex: number;
  allBlocks: MarketBlock[];
  onSeekBlock: (index: number) => void;
  isRunning: boolean;
}

export const MarketPulse: React.FC<Props> = ({
  block,
  currentBlockIndex,
  allBlocks,
  onSeekBlock,
  isRunning
}) => {
  return (
    <header className="bg-grid-900 border-b border-grid-border sticky top-0 z-30 backdrop-blur-md bg-grid-900/95">
      <div className="max-w-[1600px] mx-auto px-4 py-3">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* LEFT: Market Identity */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-market-green/10 border border-market-green/30 text-market-green">
              <Zap className="w-5 h-5 fill-market-green/20" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold font-mono tracking-wider text-base text-white">
                  MICROGRID CLEARINGHOUSE
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-market-green/20 text-market-green border border-market-green/30 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-market-green animate-pulse" />
                  MARKET OPEN
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Tamil Nadu 600-Household Residential Microgrid ? 2.50 MW Substation
              </p>
            </div>
          </div>

          {/* CENTER: Current Market Block & Time */}
          <div className="flex items-center space-x-6 bg-grid-950/80 px-4 py-1.5 rounded-lg border border-grid-border">
            <div className="text-center">
              <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider block">
                CURRENT BLOCK
              </span>
              <span className="text-base font-mono font-bold text-market-cyan">
                {block.clockTime}
                <span className="text-xs font-normal text-slate-400 ml-1.5 font-sans">
                  ({block.timeLabel})
                </span>
              </span>
            </div>

            <div className="h-7 w-[1px] bg-grid-border" />

            <div className="text-center">
              <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider block">
                BLOCK PROGRESS
              </span>
              <span className="text-base font-mono font-bold text-white">
                {currentBlockIndex}
                <span className="text-xs font-normal text-slate-400"> / 96</span>
              </span>
            </div>

            <div className="h-7 w-[1px] bg-grid-border" />

            <div className="text-center">
              <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider block">
                LATENCY
              </span>
              <span className="text-xs font-mono font-semibold text-emerald-400">
                {block.engineLatencyMs} ms
              </span>
            </div>
          </div>

          {/* RIGHT: Market Status & Physical Constraint Badge */}
          <div className="flex items-center space-x-3">
            {block.isStormActive ? (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-market-amber/15 border border-market-amber/40 text-market-amber animate-pulse">
                <AlertTriangle className="w-4 h-4" />
                <div className="text-left">
                  <span className="text-[10px] font-mono tracking-wider block leading-tight">GRID EVENT</span>
                  <span className="text-xs font-bold font-mono">CLOUD SHOCK ACTIVE</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-grid-950/80 border border-grid-border">
                <span className="w-2 h-2 rounded-full bg-market-green animate-ping" />
                <div className="text-left">
                  <span className="text-[10px] font-mono text-slate-400 tracking-wider block leading-tight">STATUS</span>
                  <span className="text-xs font-mono font-semibold text-slate-200">CLEARING NOMINAL</span>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-grid-950/80 border border-grid-border">
              <ShieldCheck className="w-4 h-4 text-market-green" />
              <div className="text-left">
                <span className="text-[10px] font-mono text-slate-400 tracking-wider block leading-tight">CONSTRAINTS</span>
                <span className="text-xs font-mono font-bold text-market-green">3 / 3 SAFE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal 96-Block Timeline */}
        <div className="mt-3 pt-2 border-t border-grid-border">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
            <span>00:00 (Block 01)</span>
            <span>06:00 (Sunrise)</span>
            <span className="text-amber-400/80">12:30 (Solar Peak)</span>
            <span>18:30 (Sunset)</span>
            <span>24:00 (Block 96)</span>
          </div>
          
          <div className="grid grid-cols-96 gap-[2px] h-3.5 bg-grid-950 p-[2px] rounded border border-grid-border">
            {allBlocks.map(b => {
              const idx = b.blockIndex;
              const isCurrent = idx === currentBlockIndex;
              const isPast = idx < currentBlockIndex;
              const isStorm = b.isStormActive;

              let cellColor = 'bg-slate-800/40 hover:bg-slate-700'; // Future
              if (isStorm) {
                cellColor = isCurrent ? 'bg-market-amber ring-2 ring-market-amber shadow-lg shadow-market-amber/40 animate-pulse' : 'bg-market-amber/60';
              } else if (isCurrent) {
                cellColor = 'bg-market-green ring-2 ring-market-green shadow-lg shadow-market-green/40 animate-pulse';
              } else if (isPast) {
                cellColor = b.clearedPowerKw > 0 ? 'bg-market-green/40 hover:bg-market-green/70' : 'bg-slate-700/50 hover:bg-slate-600';
              }

              return (
                <button
                  key={`timeline-block-${idx}`}
                  onClick={() => onSeekBlock(idx)}
                  title={`Block ${idx}: ${b.timeLabel} | Price: ?${b.clearingPriceInr.toFixed(2)}/kWh | Traded: ${b.clearedPowerKw.toFixed(0)} kW`}
                  className={`w-full h-full rounded-[1px] transition-colors cursor-pointer ${cellColor}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
