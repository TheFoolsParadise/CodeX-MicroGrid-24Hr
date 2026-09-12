import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, Zap, CloudLightning, FastForward } from 'lucide-react';
import { CloudStormState } from '../simulation/types';

interface Props {
  isRunning: boolean;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onReset: () => void;
  speedMs: number;
  onSetSpeed: (speedMs: number) => void;
  onInjectCloudStorm: () => void;
  stormState: CloudStormState | null;
  currentBlockIndex: number;
  onSeekBlock: (index: number) => void;
}

export const SimulationControls: React.FC<Props> = ({
  isRunning,
  onTogglePlay,
  onStepForward,
  onReset,
  speedMs,
  onSetSpeed,
  onInjectCloudStorm,
  stormState,
  currentBlockIndex,
  onSeekBlock
}) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-grid-900/95 border-t border-grid-border backdrop-blur-md px-4 py-2.5 shadow-2xl">
      <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Playback Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onTogglePlay}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all shadow-md ${
              isRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-market-green text-slate-950 hover:bg-market-green/90 shadow-market-green/20'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4 fill-amber-300" /> : <Play className="w-4 h-4 fill-slate-950" />}
            <span>{isRunning ? 'PAUSE' : 'RUN MARKET'}</span>
          </button>

          <button
            onClick={onStepForward}
            disabled={currentBlockIndex >= 96}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-grid-950 border border-grid-border text-slate-300 hover:text-white hover:border-grid-border-bright disabled:opacity-40 text-xs font-mono transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>STEP</span>
          </button>

          <button
            onClick={onReset}
            className="p-2 rounded-lg bg-grid-950 border border-grid-border text-slate-400 hover:text-white hover:border-grid-border-bright text-xs font-mono transition-colors"
            title="Reset Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Speed Presets */}
          <div className="flex items-center bg-grid-950 rounded-lg border border-grid-border p-0.5 text-xs font-mono ml-2">
            <button
              onClick={() => onSetSpeed(2000)}
              className={`px-2 py-1 rounded transition-colors ${
                speedMs === 2000 ? 'bg-grid-800 text-market-cyan font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1x (2s)
            </button>
            <button
              onClick={() => onSetSpeed(800)}
              className={`px-2 py-1 rounded transition-colors ${
                speedMs === 800 ? 'bg-grid-800 text-market-cyan font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2.5x (0.8s)
            </button>
            <button
              onClick={() => onSetSpeed(200)}
              className={`px-2 py-1 rounded transition-colors ${
                speedMs === 200 ? 'bg-grid-800 text-market-cyan font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              10x Turbo
            </button>
          </div>
        </div>

        {/* Scrubber slider */}
        <div className="flex-1 max-w-md hidden md:flex items-center space-x-3 text-xs font-mono text-slate-400">
          <span className="w-12 text-right">Blk {currentBlockIndex}</span>
          <input
            type="range"
            min={1}
            max={96}
            value={currentBlockIndex}
            onChange={e => onSeekBlock(Number(e.target.value))}
            className="flex-1 accent-market-cyan cursor-pointer h-1.5 bg-grid-950 rounded-lg"
          />
          <span className="w-12">Blk 96</span>
        </div>

        {/* ? INJECT CLOUD STORM BUTTON (The Money Shot) */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onInjectCloudStorm}
            disabled={stormState?.active}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all shadow-lg ${
              stormState?.active
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-not-allowed opacity-90'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 active:scale-95'
            }`}
          >
            <CloudLightning className="w-4 h-4 fill-current" />
            <span>
              {stormState?.active ? `STORM ACTIVE (${stormState.remainingBlocks} BLK)` : '? INJECT CLOUD STORM'}
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
};
