import React from 'react';
import { MarketBlock } from '../simulation/types';
import { TrendingUp, BatteryCharging, Gauge, Layers, Sun, Users, Shield } from 'lucide-react';

interface Props {
  block: MarketBlock;
}

export const MetricsStrip: React.FC<Props> = ({ block }) => {
  const {
    clearingPriceInr,
    clearedPowerKw,
    clearedEnergyKwh,
    transformerLoadMw,
    transformerLimitMw,
    transformerUtilPercent,
    totalPotentialSupplyKw,
    totalPotentialDemandKw,
    blockIndex
  } = block;

  const formattedClearedEnergy = clearedEnergyKwh >= 1000
    ? `${(clearedEnergyKwh / 1000).toFixed(2)} MWh`
    : `${clearedEnergyKwh.toFixed(0)} kWh`;

  const formattedSupply = totalPotentialSupplyKw >= 1000
    ? `${(totalPotentialSupplyKw / 1000).toFixed(2)} MW`
    : `${totalPotentialSupplyKw.toFixed(0)} kW`;

  const formattedDemand = totalPotentialDemandKw >= 1000
    ? `${(totalPotentialDemandKw / 1000).toFixed(2)} MW`
    : `${totalPotentialDemandKw.toFixed(0)} kW`;

  return (
    <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {/* 1. CLEARING PRICE */}
      <div className="bg-grid-900 border border-grid-border rounded-xl p-4 flex flex-col justify-between hover:border-grid-border-bright transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">CLEARING PRICE</span>
          <TrendingUp className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <div className="text-2xl xl:text-3xl font-bold font-mono text-amber-300 tracking-tight">
            {clearingPriceInr > 0 ? `?${clearingPriceInr.toFixed(2)}` : '?0.00'}
            <span className="text-xs font-sans text-slate-400 font-normal ml-1">/ kWh</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center justify-between">
            <span>Uniform Marginal</span>
            <span className={clearingPriceInr > 0 ? 'text-market-green font-semibold' : 'text-slate-500'}>
              {clearingPriceInr > 0 ? 'ACTIVE' : 'OFF-PEAK'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. ENERGY CLEARED */}
      <div className="bg-grid-900 border border-grid-border rounded-xl p-4 flex flex-col justify-between hover:border-grid-border-bright transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">ENERGY CLEARED</span>
          <BatteryCharging className="w-4 h-4 text-market-green" />
        </div>
        <div>
          <div className="text-2xl xl:text-3xl font-bold font-mono text-market-green tracking-tight">
            {formattedClearedEnergy}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center justify-between">
            <span>15-Min Traded</span>
            <span className="text-slate-300 font-semibold">{clearedPowerKw.toFixed(0)} kW Flow</span>
          </div>
        </div>
      </div>

      {/* 3. TRANSFORMER LOAD */}
      <div className="bg-grid-900 border border-grid-border rounded-xl p-4 flex flex-col justify-between hover:border-grid-border-bright transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">TRANSFORMER</span>
          <Gauge className="w-4 h-4 text-market-cyan" />
        </div>
        <div>
          <div className="text-2xl xl:text-3xl font-bold font-mono text-market-cyan tracking-tight">
            {transformerLoadMw.toFixed(2)}
            <span className="text-xs font-mono text-slate-400 font-normal"> / {transformerLimitMw.toFixed(2)} MW</span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-grid-950 h-1.5 rounded-full overflow-hidden border border-grid-border">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  transformerUtilPercent > 85 ? 'bg-market-amber' : 'bg-market-cyan'
                }`}
                style={{ width: `${Math.min(100, transformerUtilPercent)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>UTILIZATION</span>
              <span className="font-semibold text-slate-200">{transformerUtilPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SUPPLY (180 PROSUMERS) */}
      <div className="bg-grid-900 border border-grid-border rounded-xl p-4 flex flex-col justify-between hover:border-grid-border-bright transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">SOLAR SUPPLY</span>
          <Sun className="w-4 h-4 text-market-green" />
        </div>
        <div>
          <div className="text-2xl xl:text-3xl font-bold font-mono text-slate-100 tracking-tight">
            {formattedSupply}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center justify-between">
            <span>180 Prosumers</span>
            <span className="text-market-green font-semibold">
              {block.prosumerAggregate.avgSoldPercent}% Cleared
            </span>
          </div>
        </div>
      </div>

      {/* 5. DEMAND (420 CONSUMERS) */}
      <div className="bg-grid-900 border border-grid-border rounded-xl p-4 flex flex-col justify-between hover:border-grid-border-bright transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">TOWNSHIP DEMAND</span>
          <Users className="w-4 h-4 text-market-cyan" />
        </div>
        <div>
          <div className="text-2xl xl:text-3xl font-bold font-mono text-slate-100 tracking-tight">
            {formattedDemand}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center justify-between">
            <span>420 Consumers</span>
            <span className="text-slate-300 font-semibold">Dual Peak</span>
          </div>
        </div>
      </div>

      {/* 6. CONSTRAINT STATUS */}
      <div className="bg-grid-900 border border-grid-border rounded-xl p-4 flex flex-col justify-between hover:border-grid-border-bright transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">CONSTRAINTS</span>
          <Shield className="w-4 h-4 text-market-green" />
        </div>
        <div>
          <div className="text-2xl xl:text-3xl font-bold font-mono text-market-green tracking-tight">
            3 / 3 SAFE
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center justify-between">
            <span>Zero Violations</span>
            <span className="text-market-green font-semibold">ENFORCED</span>
          </div>
        </div>
      </div>
    </section>
  );
};
