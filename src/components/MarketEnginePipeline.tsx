import React, { useState } from 'react';
import { MarketBlock } from '../simulation/types';
import { CheckCircle2, ChevronRight, HelpCircle, ChevronDown } from 'lucide-react';

interface Props {
  block: MarketBlock;
}

export const MarketEnginePipeline: React.FC<Props> = ({ block }) => {
  const [whyOnePriceOpen, setWhyOnePriceOpen] = useState(false);

  return (
    <div className="bg-grid-900 border border-grid-border rounded-xl p-5 flex flex-col">
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-slate-200">
            HOW THIS BLOCK CLEARED
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Step-by-step physical clearing pipeline executed for Block {block.blockIndex}
          </p>
        </div>

        <button
          onClick={() => setWhyOnePriceOpen(!whyOnePriceOpen)}
          className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono rounded-lg bg-grid-950 border border-grid-border hover:border-grid-border-bright text-slate-300 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 text-market-cyan" />
          <span>WHY ONE PRICE?</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${whyOnePriceOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expandable Explanation: WHY ONE PRICE? */}
      {whyOnePriceOpen && (
        <div className="mb-4 p-4 rounded-lg bg-grid-950/90 border border-market-cyan/30 text-xs font-mono space-y-2.5 text-slate-300 animate-fadeIn">
          <div className="flex items-center space-x-2 text-market-cyan font-bold">
            <span>UNIFORM MARGINAL CLEARING PRICE MECHANISM</span>
          </div>
          <p className="font-sans leading-relaxed text-slate-300">
            "All accepted trades in a 15-minute block settle at <strong>one uniform clearing price</strong> determined
            by the exact intersection of aggregated prosumer supply and consumer demand curves."
          </p>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-grid-border text-center">
            <div className="p-2 rounded bg-grid-900 border border-grid-border">
              <span className="text-[10px] text-slate-500 block uppercase">HIGHEST ACCEPTED BUY</span>
              <span className="text-market-cyan font-bold text-sm">?{block.highestAcceptedBuyInr.toFixed(2)}/kWh</span>
            </div>
            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/40">
              <span className="text-[10px] text-amber-400/80 block uppercase font-bold">CLEARING PRICE</span>
              <span className="text-amber-300 font-bold text-sm">?{block.clearingPriceInr.toFixed(2)}/kWh</span>
            </div>
            <div className="p-2 rounded bg-grid-900 border border-grid-border">
              <span className="text-[10px] text-slate-500 block uppercase">LOWEST ACCEPTED SELL</span>
              <span className="text-market-green font-bold text-sm">?{block.lowestAcceptedSellInr.toFixed(2)}/kWh</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-sans italic">
            Ensures truth-telling incentives: prosumers offer at their true marginal solar cost without gaming,
            and consumers bid their true willingness to pay.
          </p>
        </div>
      )}

      {/* 6-Stage Visual Pipeline */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {block.pipelineStages.map((stage, idx) => {
          const isComplete = stage.status === 'COMPLETE';
          const isWarning = stage.status === 'WARNING';

          return (
            <div
              key={stage.id}
              className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
                isWarning
                  ? 'bg-amber-500/10 border-amber-500/40'
                  : 'bg-grid-950/70 border-grid-border hover:border-grid-border-bright'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1.5">
                  <span className="font-bold text-slate-400">{stage.num}</span>
                  {isComplete ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-market-green" />
                  ) : isWarning ? (
                    <span className="w-2 h-2 rounded-full bg-market-amber animate-ping" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-600" />
                  )}
                </div>
                <div className="text-[11px] font-mono font-bold text-slate-200 uppercase tracking-tight">
                  {stage.title}
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {stage.subtitle}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-grid-border">
                <div className="text-xs font-mono font-semibold text-market-cyan">
                  {stage.metric}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {stage.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
