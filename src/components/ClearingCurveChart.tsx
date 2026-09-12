import React, { useState } from 'react';
import { MarketBlock } from '../simulation/types';
import { Info, HelpCircle } from 'lucide-react';

interface Props {
  block: MarketBlock;
}

export const ClearingCurveChart: React.FC<Props> = ({ block }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number; q: number; p: number; type: 'supply' | 'demand' } | null>(null);

  const { supplyCurve, demandCurve, clearingPoint, clearingPriceInr, clearedPowerKw } = block;

  // Chart coordinate space
  const svgWidth = 640;
  const svgHeight = 320;
  const padding = { top: 30, right: 40, bottom: 45, left: 60 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Axis scales: Quantity (kW) from 0 to max Q (at least 1500 kW), Price (?/kWh) from 0 to 8.00
  const maxQ = Math.max(
    1400,
    supplyCurve[supplyCurve.length - 1]?.quantityKw || 1200,
    demandCurve[demandCurve.length - 1]?.quantityKw || 1200
  );
  const maxP = 8.0;

  const scaleX = (q: number) => padding.left + (q / maxQ) * chartWidth;
  const scaleY = (p: number) => padding.top + chartHeight - (p / maxP) * chartHeight;

  // Generate SVG path for stepped supply curve
  let supplyPath = '';
  if (supplyCurve.length > 0) {
    supplyPath = `M ${scaleX(supplyCurve[0].quantityKw)} ${scaleY(supplyCurve[0].priceInr)}`;
    for (let i = 1; i < supplyCurve.length; i++) {
      const prev = supplyCurve[i - 1];
      const curr = supplyCurve[i];
      // Stepped: horizontal to curr.quantityKw, then vertical to curr.priceInr
      supplyPath += ` H ${scaleX(curr.quantityKw)} V ${scaleY(curr.priceInr)}`;
    }
  }

  // Generate SVG path for stepped demand curve
  let demandPath = '';
  if (demandCurve.length > 0) {
    demandPath = `M ${scaleX(demandCurve[0].quantityKw)} ${scaleY(demandCurve[0].priceInr)}`;
    for (let i = 1; i < demandCurve.length; i++) {
      const curr = demandCurve[i];
      // Stepped: horizontal to curr.quantityKw, then vertical to curr.priceInr
      demandPath += ` H ${scaleX(curr.quantityKw)} V ${scaleY(curr.priceInr)}`;
    }
  }

  const hasIntersection = clearingPoint && clearingPoint.quantityKw > 0 && clearingPoint.priceInr > 0;
  const crosshairX = hasIntersection ? scaleX(clearingPoint.quantityKw) : 0;
  const crosshairY = hasIntersection ? scaleY(clearingPoint.priceInr) : 0;

  // Price ticks
  const priceTicks = [0, 2, 4, 6, 8];
  // Quantity ticks
  const qTicks = [0, Math.round(maxQ * 0.25), Math.round(maxQ * 0.5), Math.round(maxQ * 0.75), Math.round(maxQ)];

  return (
    <div className="bg-grid-900 border border-grid-border rounded-xl p-5 flex flex-col relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-market-green animate-pulse" />
            <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-slate-200">
              SUPPLY / DEMAND CLEARING CURVE
            </h3>
            <span className="text-xs font-mono text-slate-500">DOUBLE AUCTION MERIT ORDER</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Aggregated prosumer supply offers (ascending) vs consumer demand bids (descending)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-1 bg-market-green rounded-sm" />
            <span className="text-slate-300">Supply Offers (180 Prosumers)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-1 bg-market-cyan rounded-sm" />
            <span className="text-slate-300">Demand Bids (420 Consumers)</span>
          </div>
          {hasIntersection && (
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 ring-4 ring-amber-400/20" />
              <span className="text-amber-300 font-semibold">Clearing Point</span>
            </div>
          )}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full aspect-[2/1] min-h-[260px] max-h-[340px] bg-grid-950/80 rounded-lg border border-grid-border overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Consumer Surplus Pattern */}
            <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
            </pattern>
            {/* Clearing point glow */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Grid Background */}
          <rect x={padding.left} y={padding.top} width={chartWidth} height={chartHeight} fill="url(#gridPattern)" />

          {/* Horizontal Price Gridlines */}
          {priceTicks.map(p => {
            const y = scaleY(p);
            return (
              <g key={`p-${p}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke={p === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}
                  strokeDasharray={p === 0 ? undefined : '3,3'}
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-500 text-[10px] font-mono"
                >
                  ?{p.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Vertical Quantity Gridlines */}
          {qTicks.map(q => {
            const x = scaleX(q);
            return (
              <g key={`q-${q}`}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + chartHeight}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="3,3"
                />
                <text
                  x={x}
                  y={padding.top + chartHeight + 20}
                  textAnchor="middle"
                  className="fill-slate-500 text-[10px] font-mono"
                >
                  {q >= 1000 ? `${(q / 1000).toFixed(1)} MW` : `${q} kW`}
                </text>
              </g>
            );
          })}

          {/* Supply Curve */}
          {supplyPath && (
            <path
              d={supplyPath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />
          )}

          {/* Demand Curve */}
          {demandPath && (
            <path
              d={demandPath}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />
          )}

          {/* Highlight Clearing Crosshairs */}
          {hasIntersection && (
            <g className="transition-all duration-300">
              {/* Dashed line to Y axis */}
              <line
                x1={padding.left}
                y1={crosshairY}
                x2={crosshairX}
                y2={crosshairY}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
              {/* Dashed line to X axis */}
              <line
                x1={crosshairX}
                y1={crosshairY}
                x2={crosshairX}
                y2={padding.top + chartHeight}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />

              {/* Price badge on Y axis */}
              <rect
                x={padding.left - 48}
                y={crosshairY - 10}
                width={42}
                height={20}
                rx={3}
                fill="#f59e0b"
              />
              <text
                x={padding.left - 27}
                y={crosshairY + 4}
                textAnchor="middle"
                className="fill-slate-950 text-[10px] font-mono font-bold"
              >
                ?{clearingPriceInr.toFixed(2)}
              </text>

              {/* Quantity badge on X axis */}
              <rect
                x={crosshairX - 32}
                y={padding.top + chartHeight + 4}
                width={64}
                height={18}
                rx={3}
                fill="#f59e0b"
              />
              <text
                x={crosshairX}
                y={padding.top + chartHeight + 17}
                textAnchor="middle"
                className="fill-slate-950 text-[9px] font-mono font-bold"
              >
                {clearedPowerKw >= 1000 ? `${(clearedPowerKw / 1000).toFixed(2)} MW` : `${clearedPowerKw.toFixed(0)} kW`}
              </text>

              {/* Pulsing Target Point */}
              <circle
                cx={crosshairX}
                cy={crosshairY}
                r="10"
                fill="rgba(245, 158, 11, 0.25)"
                className="animate-ping"
              />
              <circle
                cx={crosshairX}
                cy={crosshairY}
                r="5"
                fill="#f59e0b"
                stroke="#ffffff"
                strokeWidth="2"
                filter="url(#glow)"
              />
            </g>
          )}

          {/* If dormant/night time */}
          {!hasIntersection && (
            <text
              x={padding.left + chartWidth / 2}
              y={padding.top + chartHeight / 2}
              textAnchor="middle"
              className="fill-slate-500 text-sm font-mono tracking-widest uppercase"
            >
              [ NIGHT OFF-PEAK: NO SOLAR TRADES CLEARED ]
            </text>
          )}
        </svg>

        {/* Floating Clearing Callout Overlay */}
        {hasIntersection && (
          <div className="absolute top-3 right-3 bg-grid-900/90 backdrop-blur border border-amber-500/30 rounded-lg px-3 py-2 text-xs font-mono shadow-lg flex items-center space-x-3">
            <div>
              <span className="text-[10px] text-amber-400/80 block uppercase tracking-wider">CLEARING POINT</span>
              <span className="text-base font-bold text-amber-300">
                ?{clearingPriceInr.toFixed(2)}
                <span className="text-xs text-slate-400 font-normal"> / kWh</span>
              </span>
            </div>
            <div className="border-l border-white/10 pl-3">
              <span className="text-[10px] text-slate-400 block uppercase">MATCHED POWER</span>
              <span className="text-sm font-semibold text-slate-200">
                {clearedPowerKw >= 1000 ? `${(clearedPowerKw / 1000).toFixed(2)} MW` : `${clearedPowerKw.toFixed(0)} kW`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Details */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-grid-border text-xs font-mono">
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-grid-950/60 rounded border border-grid-border">
          <span className="text-slate-400">Highest Accepted Buy:</span>
          <span className="text-market-cyan font-semibold">?{block.highestAcceptedBuyInr.toFixed(2)}/kWh</span>
        </div>
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-grid-950/60 rounded border border-grid-border">
          <span className="text-slate-400">Uniform Clearing Price:</span>
          <span className="text-amber-400 font-bold">?{block.clearingPriceInr.toFixed(2)}/kWh</span>
        </div>
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-grid-950/60 rounded border border-grid-border">
          <span className="text-slate-400">Lowest Accepted Sell:</span>
          <span className="text-market-green font-semibold">?{block.lowestAcceptedSellInr.toFixed(2)}/kWh</span>
        </div>
      </div>
    </div>
  );
};
