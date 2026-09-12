import React, { useState, useEffect, useRef } from 'react';
import { SimulationManager } from './simulation/simulationManager';
import { MarketBlock, CumulativeMarketReport } from './simulation/types';
import { MarketPulse } from './components/MarketPulse';
import { MetricsStrip } from './components/MetricsStrip';
import { ClearingCurveChart } from './components/ClearingCurveChart';
import { MarketEnginePipeline } from './components/MarketEnginePipeline';
import { GridHealthPanel } from './components/GridHealthPanel';
import { CloudStormBanner } from './components/CloudStormBanner';
import { SettlementPanel } from './components/SettlementPanel';
import { ParticipantsPanel } from './components/ParticipantsPanel';
import { FullDayChart } from './components/FullDayChart';
import { SimulationControls } from './components/SimulationControls';
import { DaySummaryModal } from './components/DaySummaryModal';
import { DebugDrawer } from './components/DebugDrawer';
import { ToastFeed, ToastMessage } from './components/ToastFeed';
import { FileText, Terminal } from 'lucide-react';

const SEED = 42819;

export default function App() {
  const simRef = useRef<SimulationManager | null>(null);
  if (!simRef.current) {
    simRef.current = new SimulationManager(SEED);
  }
  const sim = simRef.current;

  // React state mirroring the simulation manager
  const [, setTick] = useState(0);
  const [currentBlock, setCurrentBlock] = useState<MarketBlock>(() => sim.getCurrentBlock());
  const [allBlocks, setAllBlocks] = useState<MarketBlock[]>(() => sim.getAllBlocks());
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(() => sim.getCurrentBlockIndex());
  const [isRunning, setIsRunning] = useState<boolean>(() => sim.getIsRunning());
  const [speedMs, setSpeedMs] = useState<number>(() => sim.getSpeedMs());
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'info' | 'success' | 'warning', title: string, message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev.slice(-3), { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Subscribe to simulation changes
  useEffect(() => {
    const unsubscribe = sim.subscribe(() => {
      const blk = sim.getCurrentBlock();
      const idx = sim.getCurrentBlockIndex();
      setCurrentBlock(blk);
      setAllBlocks([...sim.getAllBlocks()]);
      setCurrentBlockIndex(idx);
      setIsRunning(sim.getIsRunning());
      setSpeedMs(sim.getSpeedMs());
      setTick(t => t + 1);

      // Trigger Day Summary modal at block 96
      if (idx === 96 && !sim.getIsRunning()) {
        setSummaryOpen(true);
        addToast('success', 'Market Day Complete', 'All 96 blocks cleared with zero constraint violations.');
      }
    });

    // Start running simulation automatically upon load
    sim.start();
    addToast('info', 'Market Open', 'Tamil Nadu Microgrid Clearinghouse operating (2s per 15-min block).');

    return () => {
      unsubscribe();
      sim.pause();
    };
  }, [sim]);

  // Handlers
  const handleTogglePlay = () => {
    if (isRunning) {
      sim.pause();
      addToast('info', 'Simulation Paused', `Paused at Block ${currentBlockIndex} (${currentBlock.timeLabel}).`);
    } else {
      if (currentBlockIndex >= 96) {
        sim.reset();
      }
      sim.start();
    }
  };

  const handleStepForward = () => {
    sim.stepForward();
  };

  const handleReset = () => {
    sim.reset();
    setSummaryOpen(false);
    addToast('info', 'Market Reset', 'Simulation reset to Block 01 (00:00 AM).');
  };

  const handleSetSpeed = (ms: number) => {
    sim.setSpeed(ms);
  };

  const handleSeekBlock = (idx: number) => {
    sim.seekToBlock(idx);
  };

  const handleInjectCloudStorm = () => {
    sim.injectCloudStorm();
    addToast('warning', '? Cloud Storm Shock Injected', 'Solar generation dropped by 60% for 4 blocks.');
  };

  const cumulativeReport: CumulativeMarketReport = sim.getCumulativeReport();

  return (
    <div className="min-h-screen bg-grid-950 text-slate-100 flex flex-col font-sans pb-24 selection:bg-market-cyan/30">
      {/* 1. TOP HEADER & TIMELINE */}
      <MarketPulse
        block={currentBlock}
        currentBlockIndex={currentBlockIndex}
        allBlocks={allBlocks}
        onSeekBlock={handleSeekBlock}
        isRunning={isRunning}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 py-4 space-y-4">
        {/* Floating Utility Actions (Report & Debug) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-slate-400">
              TAMIL NADU 600-HOUSEHOLD P2P CLEARINGHOUSE ? 24H MARKET RUN
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSummaryOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1 text-xs font-mono rounded-lg bg-grid-900 border border-grid-border hover:border-market-green/40 hover:text-market-green text-slate-300 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-market-green" />
              <span>24H REPORT</span>
            </button>

            <button
              onClick={() => setDebugOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1 text-xs font-mono rounded-lg bg-grid-900 border border-grid-border hover:border-market-cyan/40 hover:text-market-cyan text-slate-300 transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 text-market-cyan" />
              <span>ENGINE DIAGNOSTICS</span>
            </button>
          </div>
        </div>

        {/* 2. CLOUD STORM INCIDENT BANNER (The Money Shot) */}
        <CloudStormBanner
          block={currentBlock}
          stormState={sim.getStormState()}
        />

        {/* 3. PROMINENT METRICS STRIP */}
        <MetricsStrip block={currentBlock} />

        {/* 4. PRIMARY OPERATIONAL GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* LEFT: Core Market Clearing & Curves (7 of 12 columns) */}
          <div className="lg:col-span-7 space-y-4">
            {/* The Most Important Visual: Supply / Demand Curve */}
            <ClearingCurveChart block={currentBlock} />

            {/* How This Block Cleared: 6-Stage Pipeline */}
            <MarketEnginePipeline block={currentBlock} />

            {/* 24-Hour Market Chart */}
            <FullDayChart
              blocks={allBlocks}
              currentBlockIndex={currentBlockIndex}
              onSeekBlock={handleSeekBlock}
            />
          </div>

          {/* RIGHT: Physical Grid, Financial Settlement & Participants (5 of 12 columns) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Physical Transformer & Grid Health */}
            <GridHealthPanel block={currentBlock} />

            {/* Financial Settlement & Value Arbitrage */}
            <SettlementPanel block={currentBlock} />

            {/* 180 Prosumers & 420 Consumers Activity */}
            <ParticipantsPanel block={currentBlock} />
          </div>
        </div>
      </main>

      {/* 5. STICKY SIMULATION CONTROLS */}
      <SimulationControls
        isRunning={isRunning}
        onTogglePlay={handleTogglePlay}
        onStepForward={handleStepForward}
        onReset={handleReset}
        speedMs={speedMs}
        onSetSpeed={handleSetSpeed}
        onInjectCloudStorm={handleInjectCloudStorm}
        stormState={sim.getStormState()}
        currentBlockIndex={currentBlockIndex}
        onSeekBlock={handleSeekBlock}
      />

      {/* 6. MODALS & DRAWERS */}
      <DaySummaryModal
        report={cumulativeReport}
        isOpen={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        onRestart={handleReset}
      />

      <DebugDrawer
        isOpen={debugOpen}
        onClose={() => setDebugOpen(false)}
        block={currentBlock}
        seed={SEED}
      />

      {/* 7. LIVE TOAST NOTIFICATIONS */}
      <ToastFeed toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
