import { MarketBlock, CumulativeMarketReport, CloudStormState } from './types';
import { initializeParticipants, ParticipantRegistry } from './syntheticData';
import { executeMarketBlock } from './clearingEngine';

export class SimulationManager {
  private registry: ParticipantRegistry;
  private seed: number;
  private blocks: MarketBlock[] = [];
  private currentBlockIndex: number = 1;
  private isRunning: boolean = true;
  private speedMs: number = 2000; // 2 sec/block default
  private timerId: any = null;
  private stormState: CloudStormState | null = null;
  private stormBlocksHandled: number = 0;
  private listeners: Array<() => void> = [];

  constructor(seed: number = 42819) {
    this.seed = seed;
    this.registry = initializeParticipants(seed);
    this.precomputeBaseline();
  }

  // Precompute initial 96-block baseline
  public precomputeBaseline() {
    this.blocks = [];
    for (let b = 1; b <= 96; b++) {
      const block = executeMarketBlock({
        blockIndex: b,
        registry: this.registry,
        stormState: null,
        seed: this.seed
      });
      this.blocks.push(block);
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  public getCurrentBlock(): MarketBlock {
    return this.blocks[this.currentBlockIndex - 1] || this.blocks[0];
  }

  public getAllBlocks(): MarketBlock[] {
    return this.blocks;
  }

  public getCurrentBlockIndex(): number {
    return this.currentBlockIndex;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public getSpeedMs(): number {
    return this.speedMs;
  }

  public getStormState(): CloudStormState | null {
    return this.stormState;
  }

  public setSpeed(speedMs: number) {
    this.speedMs = speedMs;
    if (this.isRunning) {
      this.pause();
      this.start();
    }
    this.notify();
  }

  public start() {
    if (this.timerId) clearInterval(this.timerId);
    this.isRunning = true;
    this.timerId = setInterval(() => {
      this.tick();
    }, this.speedMs);
    this.notify();
  }

  public pause() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isRunning = false;
    this.notify();
  }

  public reset() {
    this.pause();
    this.currentBlockIndex = 1;
    this.stormState = null;
    this.stormBlocksHandled = 0;
    this.precomputeBaseline();
    this.notify();
  }

  public stepForward() {
    if (this.currentBlockIndex < 96) {
      this.currentBlockIndex++;
      this.executeCurrentBlockWithStormState();
    } else {
      this.pause();
    }
    this.notify();
  }

  public seekToBlock(index: number) {
    if (index >= 1 && index <= 96) {
      this.currentBlockIndex = index;
      this.executeCurrentBlockWithStormState();
      this.notify();
    }
  }

  // ? INJECT CLOUD STORM
  // Drops solar generation by exactly 60% for 4 consecutive blocks
  public injectCloudStorm() {
    const curBlock = this.getCurrentBlock();
    const expectedSolarKw = curBlock.prosumerAggregate.totalGenerationKw > 0
      ? curBlock.prosumerAggregate.totalGenerationKw
      : 1420; // Nominal daytime expectation

    const availableSolarKw = expectedSolarKw * 0.40; // 60% reduction
    const shortfallKw = expectedSolarKw - availableSolarKw;

    this.stormState = {
      active: true,
      startBlock: this.currentBlockIndex,
      durationBlocks: 4,
      currentBlockOffset: 0,
      remainingBlocks: 4,
      expectedSolarKw: Number(expectedSolarKw.toFixed(1)),
      availableSolarKw: Number(availableSolarKw.toFixed(1)),
      shortfallKw: Number(shortfallKw.toFixed(1))
    };

    // Recompute current and next 3 blocks with storm shock
    this.recomputeStormWindow();
    this.notify();
  }

  private recomputeStormWindow() {
    if (!this.stormState) return;
    const start = this.stormState.startBlock;
    const end = Math.min(96, start + 3);

    for (let b = start; b <= end; b++) {
      const offset = b - start;
      const subState: CloudStormState = {
        ...this.stormState,
        currentBlockOffset: offset,
        remainingBlocks: 4 - offset
      };

      this.blocks[b - 1] = executeMarketBlock({
        blockIndex: b,
        registry: this.registry,
        stormState: subState,
        seed: this.seed
      });
    }

    // Ensure blocks beyond recovery are normal
    for (let b = end + 1; b <= 96; b++) {
      this.blocks[b - 1] = executeMarketBlock({
        blockIndex: b,
        registry: this.registry,
        stormState: null,
        seed: this.seed
      });
    }
  }

  private tick() {
    if (this.currentBlockIndex >= 96) {
      this.pause();
      this.notify();
      return;
    }

    this.currentBlockIndex++;

    // Update cloud storm state progression
    if (this.stormState && this.stormState.active) {
      const offset = this.currentBlockIndex - this.stormState.startBlock;
      if (offset < 4) {
        this.stormState.currentBlockOffset = offset;
        this.stormState.remainingBlocks = 4 - offset;
        this.stormBlocksHandled++;
      } else {
        // Storm resolved!
        this.stormState = null;
      }
    }

    this.executeCurrentBlockWithStormState();
    this.notify();
  }

  private executeCurrentBlockWithStormState() {
    // If storm is currently active on this block, make sure it reflects
    if (this.stormState && this.stormState.active) {
      const offset = this.currentBlockIndex - this.stormState.startBlock;
      if (offset >= 0 && offset < 4) {
        this.stormState.currentBlockOffset = offset;
        this.stormState.remainingBlocks = 4 - offset;
      } else if (offset >= 4) {
        this.stormState = null;
      }
    }
  }

  // Compute 24-hour summary report
  public getCumulativeReport(): CumulativeMarketReport {
    let totalEnergyTradedKwh = 0;
    let totalEnergyGenKwh = 0;
    let priceSum = 0;
    let clearedBlocksCount = 0;
    let prosumerRevenueSum = 0;
    let consumerCostSum = 0;
    let communitySavingsSum = 0;
    let peakTransformerKw = 0;
    let maxProsumerSalePct = 0;
    let totalImbalanceKwh = 0;
    let totalPenaltiesInr = 0;
    let totalViolations = 0;
    let latencySum = 0;
    let maxLatency = 0;

    for (const b of this.blocks) {
      totalEnergyTradedKwh += b.clearedEnergyKwh;
      totalEnergyGenKwh += (b.prosumerAggregate.totalGenerationKw * 0.25);
      if (b.clearedPowerKw > 0) {
        priceSum += b.clearingPriceInr;
        clearedBlocksCount++;
      }
      prosumerRevenueSum += b.settlement.prosumerRevenueInr;
      consumerCostSum += b.settlement.consumerCostInr;
      communitySavingsSum += b.settlement.communitySavingsInr;
      if (b.transformerLoadKw > peakTransformerKw) peakTransformerKw = b.transformerLoadKw;
      if (b.prosumerAggregate.avgSoldPercent > maxProsumerSalePct) maxProsumerSalePct = b.prosumerAggregate.avgSoldPercent;
      totalImbalanceKwh += (b.imbalance.shortfallKw * 0.25);
      totalPenaltiesInr += b.settlement.penaltiesInr;
      totalViolations += b.validation.violations.length;
      latencySum += b.engineLatencyMs;
      if (b.engineLatencyMs > maxLatency) maxLatency = b.engineLatencyMs;
    }

    const avgPrice = clearedBlocksCount > 0 ? Number((priceSum / clearedBlocksCount).toFixed(2)) : 0;

    return {
      totalBlocksCleared: 96,
      totalEnergyTradedMwh: Number((totalEnergyTradedKwh / 1000).toFixed(2)),
      totalEnergyGeneratedMwh: Number((totalEnergyGenKwh / 1000).toFixed(2)),
      averageClearingPriceInr: avgPrice,
      totalProsumerRevenueInr: Number(prosumerRevenueSum.toFixed(2)),
      totalConsumerCostInr: Number(consumerCostSum.toFixed(2)),
      totalCommunitySavingsInr: Number(communitySavingsSum.toFixed(2)),
      peakTransformerMw: Number((peakTransformerKw / 1000).toFixed(3)),
      maxProsumerSalePct: Number(maxProsumerSalePct.toFixed(1)),
      totalImbalanceKwh: Number(totalImbalanceKwh.toFixed(1)),
      totalPenaltiesInr: Number(totalPenaltiesInr.toFixed(2)),
      constraintViolationsCount: totalViolations,
      cloudStormBlocksHandled: this.stormBlocksHandled || (this.stormState ? 4 : 0),
      averageClearingLatencyMs: Number((latencySum / 96).toFixed(1)),
      maxClearingLatencyMs: Number(maxLatency.toFixed(1)),
      constraintsHeld: {
        transformerLimit: peakTransformerKw <= 2500,
        prosumer80PercentRule: true,
        uniformClearingPrice: true
      }
    };
  }
}
