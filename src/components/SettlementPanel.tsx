import React from 'react';
import { MarketBlock } from '../simulation/types';
import { Landmark } from 'lucide-react';

interface Props {
  block: MarketBlock;
}

export const SettlementPanel: React.FC<Props> = ({ block }) => {
  const { settlement, clearedEnergyKwh, clearingPriceInr } = block;

  return (
    <div className="bg-grid-900 border border-grid-border rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Landmark className="w-4 h-4 text-market-green" />
            <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-slate-200">
              FINANCIAL SETTLEMENT & LOCAL VALUE
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            BLOCK {block.blockIndex} SETTLED
          </span>
        </div>

        {/* Financial Flow Breakdown */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
          <div className="p-3 rounded-lg bg-grid-950/70 border border-grid-border">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">PROSUMER REVENUE</span>
            <span className="text-base font-bold font-mono text-market-green">
              ?{settlement.prosumerRevenueInr.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-500 block font-mono mt-0.5">180 Households</span>
          </div>

          <div className="p-3 rounded-lg bg-grid-950/70 border border-grid-border">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">CONSUMER OUTLAY</span>
            <span className="text-base font-bold font-mono text-market-cyan">
              ?{settlement.consumerCostInr.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-500 block font-mono mt-0.5">420 Households</span>
          </div>

          <div className="p-3 rounded-lg bg-grid-950/70 border border-grid-border">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">GRID IMPORT COST</span>
            <span className="text-base font-bold font-mono text-slate-200">
              ?{settlement.gridImportCostInr.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-500 block font-mono mt-0.5">Residual Utility</span>
          </div>

          <div className="p-3 rounded-lg bg-grid-950/70 border border-grid-border">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">NET TRADED VALUE</span>
            <span className="text-base font-bold font-mono text-amber-300">
              ?{settlement.netMarketValueInr.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-500 block font-mono mt-0.5">{clearedEnergyKwh.toFixed(0)} kWh Cleared</span>
          </div>
        </div>

        {/* Economic Value Comparison */}
        <div className="p-4 rounded-lg bg-grid-950/90 border border-market-green/30">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-mono font-bold text-market-green uppercase tracking-wider">
              TOWNSHIP ECONOMIC ARBITRAGE
            </span>
            <span className="text-[11px] font-mono text-market-green font-bold">
              +?{settlement.communitySavingsInr.toLocaleString('en-IN')} KEPT LOCAL
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            {/* Without P2P */}
            <div className="p-2.5 rounded bg-grid-900 border border-grid-border">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold mb-1">
                WITHOUT CLEARINGHOUSE (TRADITIONAL GRID)
              </span>
              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span>Prosumer Feed-in Tariff:</span>
                  <span className="text-red-400 font-semibold">?2.50 / kWh</span>
                </div>
                <div className="flex justify-between">
                  <span>Consumer Retail Tariff:</span>
                  <span className="text-red-400 font-semibold">?7.20 / kWh</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-grid-border text-[11px] text-slate-400">
                  <span>DisCom Utility Margin:</span>
                  <span className="text-red-400">?4.70 / kWh</span>
                </div>
              </div>
            </div>

            {/* With Clearinghouse */}
            <div className="p-2.5 rounded bg-market-green/10 border border-market-green/30">
              <span className="text-[10px] text-market-green uppercase block font-bold mb-1">
                WITH MICROGRID CLEARINGHOUSE
              </span>
              <div className="space-y-1 text-slate-200">
                <div className="flex justify-between">
                  <span>Prosumers Earn:</span>
                  <span className="text-market-green font-bold">
                    +?{clearingPriceInr > 0 ? (clearingPriceInr - 2.50).toFixed(2) : '0.00'}/kWh MORE
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Consumers Pay:</span>
                  <span className="text-market-cyan font-bold">
                    -?{clearingPriceInr > 0 ? (7.20 - clearingPriceInr).toFixed(2) : '0.00'}/kWh LESS
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-market-green/20 text-[11px] font-bold text-market-green">
                  <span>Township Wealth Kept:</span>
                  <span>100% of Traded Spread</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
