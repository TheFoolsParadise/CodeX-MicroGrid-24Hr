import React from 'react';
import { MarketBlock } from '../simulation/types';
import { Terminal, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  block: MarketBlock;
  seed: number;
}

export const DebugDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  block,
  seed
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-grid-950 border-l border-grid-border p-5 shadow-2xl flex flex-col font-mono text-xs overflow-auto">
      <div className="flex items-center justify-between pb-3 border-b border-grid-border mb-4">
        <div className="flex items-center space-x-2 text-market-cyan font-bold">
          <Terminal className="w-4 h-4" />
          <span>ENGINE DIAGNOSTIC DRAWER</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-grid-900"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 flex-1">
        <div className="p-3 rounded bg-grid-900 border border-grid-border">
          <span className="text-slate-500 block uppercase text-[10px]">CURRENT BLOCK</span>
          <span className="text-slate-200 font-bold">{block.blockIndex} / 96 ({block.timeLabel})</span>
        </div>

        <div className="p-3 rounded bg-grid-900 border border-grid-border">
          <span className="text-slate-500 block uppercase text-[10px]">EXECUTION LATENCY</span>
          <span className="text-emerald-400 font-bold">{block.engineLatencyMs} ms</span>
        </div>

        <div className="p-3 rounded bg-grid-900 border border-grid-border">
          <span className="text-slate-500 block uppercase text-[10px]">ATMOSPHERIC CLOUD FACTOR</span>
          <span className="text-slate-200 font-bold">{block.cloudMultiplier.toFixed(2)} {block.isStormActive ? '(STORM SHOCK -60%)' : '(NOMINAL)'}</span>
        </div>

        <div className="p-3 rounded bg-grid-900 border border-grid-border">
          <span className="text-slate-500 block uppercase text-[10px]">TOTAL GENERATION & DEMAND</span>
          <div className="mt-1 space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span>Gen:</span>
              <span className="text-market-green">{block.prosumerAggregate.totalGenerationKw.toFixed(1)} kW</span>
            </div>
            <div className="flex justify-between">
              <span>Demand:</span>
              <span className="text-market-cyan">{block.consumerAggregate.totalDemandKw.toFixed(1)} kW</span>
            </div>
            <div className="flex justify-between">
              <span>Cleared Power:</span>
              <span className="text-amber-300">{block.clearedPowerKw.toFixed(1)} kW</span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded bg-grid-900 border border-grid-border">
          <span className="text-slate-500 block uppercase text-[10px]">INVARIANT VALIDATION</span>
          <div className="mt-1 space-y-1">
            <div className="flex justify-between text-market-green">
              <span>Transformer &le; 2.50 MW:</span>
              <span>{block.validation.transformerSafe ? 'PASS' : 'FAIL'}</span>
            </div>
            <div className="flex justify-between text-market-green">
              <span>Prosumer &le; 80% Rule:</span>
              <span>{block.validation.prosumerLimitSafe ? 'PASS' : 'FAIL'}</span>
            </div>
            <div className="flex justify-between text-market-green">
              <span>Single Clearing Price:</span>
              <span>{block.validation.uniformPriceSafe ? 'PASS' : 'FAIL'}</span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded bg-grid-900 border border-grid-border">
          <span className="text-slate-500 block uppercase text-[10px]">DETERMINISTIC SEED</span>
          <span className="text-slate-400">{seed}</span>
        </div>
      </div>
    </div>
  );
};
