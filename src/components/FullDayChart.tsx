import React, { useState } from 'react';
import { MarketBlock } from '../simulation/types';
import { LineChart } from 'lucide-react';

interface Props {
  blocks: MarketBlock[];
  currentBlockIndex: number;
  onSeekBlock: (index: number) => void;
}

export const FullDayChart: React.FC<Props> = ({
  blocks,
  currentBlockIndex,
  onSeekBlock
}) => {
  const [showPrice, setShowPrice] = useState(true);
  const [showEnergy, setShowEnergy] = useState(true);
  const [showTransformer, setShowTransformer] = useState(true);
  const [showSupply, setShowSupply] = useState(true);
  const [showDemand, setShowDemand] = useState(true);

  const svgWidth = 1000;
  const svgHeight = 280;
  const padding = { top: 25, right: 30, bottom: 40, left: 60 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  const maxKw = 2500;
  const maxPrice = 8.0;

  const scaleX = (bIdx: number) => padding.left + ((bIdx - 1) / 95) * chartWidth;
  const scaleYPower = (kw: number) => padding.top + chartHeight - (Math.min(maxKw, kw) / maxKw) * chartHeight;
  const scaleYPrice = (p: number) => padding.top + chartHeight - (Math.min(maxPrice, p) / maxPrice) * chartHeight;

  const supplyPath = blocks.map((b, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(b.blockIndex)} ${scaleYPower(b.prosumerAggregate.totalGenerationKw)}`).join(' ');
  const demandPath = blocks.map((b, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(b.blockIndex)} ${scaleYPower(b.consumerAggregate.totalDemandKw)}`).join(' ');
  const transformerPath = blocks.map((b, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(b.blockIndex)} ${scaleYPower(b.transformerLoadKw)}`).join(' ');
  const energyTradedPath = blocks.map((b, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(b.blockIndex)} ${scaleYPower(b.clearedPowerKw)}`).join(' ');
  const pricePath = blocks.map((b, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(b.blockIndex)} ${scaleYPrice(b.clearingPriceInr)}`).join(' ');

  const currentX = scaleX(currentBlockIndex);

  return (
    <div className="bg-grid-900 border border-grid-border rounded-xl p-5 flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
        <div className="flex items-center space-x-2">
          <LineChart className="w-4 h-4 text-market-cyan" />
          <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-slate-200">
            24-HOUR MARKET TIMELINE (96 BLOCKS)
          </h3>
        </div>

        {/* Toggle Layers */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          <button
            onClick={() => setShowPrice(!showPrice)}
            className={`flex items-center space-x-1.5 px-2 py-1 rounded border transition-colors ${
              showPrice ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' : 'bg-grid-950 border-grid-border text-slate-500'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
            <span>Clearing Price</span>
          </button>

          <button
            onClick={() => setShowEnergy(!showEnergy)}
            className={`flex items-center space-x-1.5 px-2 py-1 rounded border transition-colors ${
              showEnergy ? 'bg-market-green/15 border-market-green/40 text-market-green' : 'bg-grid-950 border-grid-border text-slate-500'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-market-green" />
            <span>Energy Cleared</span>
          </button>

          <button
            onClick={() => setShowTransformer(!showTransformer)}
            className={`flex items-center space-x-1.5 px-2 py-1 rounded border transition-colors ${
              showTransformer ? 'bg-red-500/15 border-red-500/40 text-red-300' : 'bg-grid-950 border-grid-border text-slate-500'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-red-400" />
            <span>Transformer Load</span>
          </button>

          <button
            onClick={() => setShowSupply(!showSupply)}
            className={`flex items-center space-x-1.5 px-2 py-1 rounded border transition-colors ${
              showSupply ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-grid-950 border-grid-border text-slate-500'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
            <span>Solar Gen</span>
          </button>

          <button
            onClick={() => setShowDemand(!showDemand)}
            className={`flex items-center space-x-1.5 px-2 py-1 rounded border transition-colors ${
              showDemand ? 'bg-market-cyan/15 border-market-cyan/40 text-market-cyan' : 'bg-grid-950 border-grid-border text-slate-500'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-market-cyan" />
            <span>Township Demand</span>
          </button>
        </div>
      </div>

      <div className="relative w-full aspect-[3/1] min-h-[220px] max-h-[280px] bg-grid-950/80 rounded-lg border border-grid-border overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full cursor-crosshair"
          preserveAspectRatio="none"
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const ratio = clickX / rect.width;
            const targetBlock = Math.max(1, Math.min(96, Math.round(ratio * 96)));
            onSeekBlock(targetBlock);
          }}
        >
          {/* Horizontal gridlines */}
          {[0, 500, 1000, 1500, 2000, 2500].map(kw => {
            const y = scaleYPower(kw);
            return (
              <g key={`y-${kw}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke={kw === 2500 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.05)'}
                  strokeDasharray={kw === 2500 ? '4,4' : '2,2'}
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className={`text-[10px] font-mono ${kw === 2500 ? 'fill-red-400' : 'fill-slate-500'}`}
                >
                  {(kw / 1000).toFixed(1)} MW
                </text>
              </g>
            );
          })}

          {/* Time ticks on X axis */}
          {[1, 25, 49, 73, 96].map(b => {
            const x = scaleX(b);
            const labels: { [key: number]: string } = { 1: '00:00', 25: '06:00', 49: '12:00', 73: '18:00', 96: '24:00' };
            return (
              <g key={`x-${b}`}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + chartHeight}
                  stroke="rgba(255,255,255,0.05)"
                  strokeDasharray="2,2"
                />
                <text
                  x={x}
                  y={padding.top + chartHeight + 20}
                  textAnchor="middle"
                  className="fill-slate-500 text-[10px] font-mono"
                >
                  {labels[b]}
                </text>
              </g>
            );
          })}

          {/* Lines */}
          {showSupply && (
            <path d={supplyPath} fill="none" stroke="#34d399" strokeWidth="1.8" opacity="0.85" />
          )}
          {showDemand && (
            <path d={demandPath} fill="none" stroke="#06b6d4" strokeWidth="1.8" opacity="0.85" />
          )}
          {showTransformer && (
            <path d={transformerPath} fill="none" stroke="#f87171" strokeWidth="1.8" opacity="0.75" />
          )}
          {showEnergy && (
            <path d={energyTradedPath} fill="none" stroke="#10b981" strokeWidth="2.2" />
          )}
          {showPrice && (
            <path d={pricePath} fill="none" stroke="#f59e0b" strokeWidth="2.2" />
          )}

          {/* Current Block Tracking Cursor */}
          <line
            x1={currentX}
            y1={padding.top}
            x2={currentX}
            y2={padding.top + chartHeight}
            stroke="#ffffff"
            strokeWidth="2"
            strokeDasharray="3,3"
          />
          <circle
            cx={currentX}
            cy={padding.top + 6}
            r="4"
            fill="#ffffff"
            className="animate-pulse"
          />
        </svg>

        <div
          className="absolute top-2 pointer-events-none -translate-x-1/2 bg-grid-900 border border-white/20 px-2 py-0.5 rounded text-[10px] font-mono text-white shadow"
          style={{ left: `${(currentX / svgWidth) * 100}%` }}
        >
          {blocks[currentBlockIndex - 1]?.clockTime}
        </div>
      </div>
    </div>
  );
};
