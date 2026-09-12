import React, { useState } from 'react';
import { MarketBlock } from '../simulation/types';
import { Users, Sun, Home, Search, Eye, X } from 'lucide-react';

interface Props {
  block: MarketBlock;
}

export const ParticipantsPanel: React.FC<Props> = ({ block }) => {
  const [activeTab, setActiveTab] = useState<'prosumers' | 'consumers'>('prosumers');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectorOpen, setInspectorOpen] = useState(false);

  const { prosumerAggregate, consumerAggregate, prosumers, consumers } = block;

  const filteredProsumers = prosumers.filter(p =>
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredConsumers = consumers.filter(c =>
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-grid-900 border border-grid-border rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-market-cyan" />
            <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-slate-200">
              PARTICIPANTS & AGGREGATE ACTIVITY
            </h3>
          </div>
          <button
            onClick={() => setInspectorOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono rounded-lg bg-grid-950 border border-grid-border hover:border-grid-border-bright text-slate-300 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-market-cyan" />
            <span>INSPECT ALL 600</span>
          </button>
        </div>

        {/* Split Cards: Prosumers vs Consumers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {/* Prosumers Summary */}
          <div className="p-4 rounded-lg bg-grid-950/80 border border-market-green/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Sun className="w-4 h-4 text-market-green" />
                <span className="text-xs font-mono font-bold text-market-green uppercase">
                  180 ROOFTOP PROSUMERS
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-200">
                {(prosumerAggregate.totalGenerationKw / 1000).toFixed(2)} MW Total Gen
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono mt-3">
              <div className="p-2 rounded bg-grid-900 border border-grid-border">
                <span className="text-[10px] text-slate-400 block uppercase">AVAILABLE SURPLUS</span>
                <span className="text-slate-200 font-bold">
                  {(prosumerAggregate.totalSurplusKw / 1000).toFixed(2)} MW
                </span>
              </div>
              <div className="p-2 rounded bg-grid-900 border border-grid-border">
                <span className="text-[10px] text-slate-400 block uppercase">AVG SOLD RATIO</span>
                <span className="text-market-green font-bold">
                  {prosumerAggregate.avgSoldPercent}%
                </span>
              </div>
              <div className="p-2 rounded bg-grid-900 border border-grid-border">
                <span className="text-[10px] text-slate-400 block uppercase">AVG REVENUE</span>
                <span className="text-slate-200 font-bold">
                  ?{prosumerAggregate.avgRevenueInr.toFixed(0)}
                </span>
              </div>
            </div>

            {/* Capacity Distribution Breakdown */}
            <div className="mt-3 pt-2.5 border-t border-grid-border">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                INSTALLED CAPACITY DISTRIBUTION
              </span>
              <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
                <div className="p-1 rounded bg-grid-900 border border-grid-border">
                  <span className="text-slate-400 block">4 kW</span>
                  <span className="font-bold text-slate-200">{prosumerAggregate.capacityDistribution[4]} homes</span>
                </div>
                <div className="p-1 rounded bg-grid-900 border border-grid-border">
                  <span className="text-slate-400 block">6 kW</span>
                  <span className="font-bold text-slate-200">{prosumerAggregate.capacityDistribution[6]} homes</span>
                </div>
                <div className="p-1 rounded bg-grid-900 border border-grid-border">
                  <span className="text-slate-400 block">8 kW</span>
                  <span className="font-bold text-slate-200">{prosumerAggregate.capacityDistribution[8]} homes</span>
                </div>
                <div className="p-1 rounded bg-grid-900 border border-grid-border">
                  <span className="text-slate-400 block">10 kW</span>
                  <span className="font-bold text-slate-200">{prosumerAggregate.capacityDistribution[10]} homes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Consumers Summary */}
          <div className="p-4 rounded-lg bg-grid-950/80 border border-market-cyan/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Home className="w-4 h-4 text-market-cyan" />
                <span className="text-xs font-mono font-bold text-market-cyan uppercase">
                  420 CONSUMER HOUSEHOLDS
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-200">
                {(consumerAggregate.totalDemandKw / 1000).toFixed(2)} MW Demand
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono mt-3">
              <div className="p-2 rounded bg-grid-900 border border-grid-border">
                <span className="text-[10px] text-slate-400 block uppercase">MATCHED POWER</span>
                <span className="text-market-cyan font-bold">
                  {(consumerAggregate.totalClearedKw / 1000).toFixed(2)} MW
                </span>
              </div>
              <div className="p-2 rounded bg-grid-900 border border-grid-border">
                <span className="text-[10px] text-slate-400 block uppercase">EFFECTIVE TARIFF</span>
                <span className="text-amber-300 font-bold">
                  ?{consumerAggregate.avgPriceInr.toFixed(2)}/kWh
                </span>
              </div>
              <div className="p-2 rounded bg-grid-900 border border-grid-border">
                <span className="text-[10px] text-slate-400 block uppercase">TOTAL BLOCK COST</span>
                <span className="text-slate-200 font-bold">
                  ?{consumerAggregate.totalCostInr.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-grid-border text-xs font-mono text-slate-400 flex items-center justify-between">
              <span>Grid Reliability:</span>
              <span className="text-market-green font-bold">100% Continuous (Zero Load Shed)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Participant Inspector Modal */}
      {inspectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-grid-900 border border-grid-border rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-grid-border">
              <div className="flex items-center space-x-3">
                <h3 className="text-base font-mono font-bold text-white">
                  PARTICIPANT REGISTRY INSPECTOR
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Block {block.blockIndex} ({block.timeLabel})
                </span>
              </div>
              <button
                onClick={() => setInspectorOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-grid-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="p-4 border-b border-grid-border flex flex-wrap items-center justify-between gap-3 bg-grid-950">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('prosumers')}
                  className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg transition-colors ${
                    activeTab === 'prosumers'
                      ? 'bg-market-green text-slate-950 font-bold'
                      : 'bg-grid-900 text-slate-400 hover:text-white border border-grid-border'
                  }`}
                >
                  PROSUMERS (180)
                </button>
                <button
                  onClick={() => setActiveTab('consumers')}
                  className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg transition-colors ${
                    activeTab === 'consumers'
                      ? 'bg-market-cyan text-slate-950 font-bold'
                      : 'bg-grid-900 text-slate-400 hover:text-white border border-grid-border'
                  }`}
                >
                  CONSUMERS (420)
                </button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search ID or Name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs font-mono bg-grid-900 border border-grid-border rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-market-cyan w-56"
                />
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto p-4">
              {activeTab === 'prosumers' ? (
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-grid-border text-slate-400 text-left">
                      <th className="pb-2">ID</th>
                      <th className="pb-2">Capacity</th>
                      <th className="pb-2">Generation</th>
                      <th className="pb-2">Load</th>
                      <th className="pb-2">Surplus</th>
                      <th className="pb-2">80% Cap</th>
                      <th className="pb-2">Offer Price</th>
                      <th className="pb-2">Accepted</th>
                      <th className="pb-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-grid-border/40">
                    {filteredProsumers.slice(0, 100).map(p => (
                      <tr key={p.id} className="hover:bg-grid-800/40">
                        <td className="py-2 text-market-green font-semibold">{p.id}</td>
                        <td className="py-2 text-slate-400">{p.capacityKw} kW</td>
                        <td className="py-2 text-slate-200">{p.currentGenKw.toFixed(2)} kW</td>
                        <td className="py-2 text-slate-400">{p.householdLoadKw.toFixed(2)} kW</td>
                        <td className="py-2 text-slate-200">{p.availableSurplusKw.toFixed(2)} kW</td>
                        <td className="py-2 text-slate-400">{p.maxAllowedSaleKw.toFixed(2)} kW</td>
                        <td className="py-2 text-slate-300">?{p.offerPriceInr.toFixed(2)}</td>
                        <td className="py-2 text-market-green font-bold">{p.acceptedQuantityKw.toFixed(2)} kW</td>
                        <td className="py-2 text-amber-300">?{p.revenueInr.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-grid-border text-slate-400 text-left">
                      <th className="pb-2">ID</th>
                      <th className="pb-2">Demand</th>
                      <th className="pb-2">Bid Price</th>
                      <th className="pb-2">Accepted Cleared</th>
                      <th className="pb-2">Block Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-grid-border/40">
                    {filteredConsumers.slice(0, 100).map(c => (
                      <tr key={c.id} className="hover:bg-grid-800/40">
                        <td className="py-2 text-market-cyan font-semibold">{c.id}</td>
                        <td className="py-2 text-slate-200">{c.currentDemandKw.toFixed(2)} kW</td>
                        <td className="py-2 text-slate-300">?{c.bidPriceInr.toFixed(2)}</td>
                        <td className="py-2 text-market-cyan font-bold">{c.acceptedQuantityKw.toFixed(2)} kW</td>
                        <td className="py-2 text-amber-300">?{c.costInr.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-3 border-t border-grid-border text-[11px] font-mono text-slate-500 flex justify-between bg-grid-950">
              <span>Showing up to 100 active participant records</span>
              <span>All 600 participants deterministically seeded</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
