// Microgrid Clearinghouse Core Types

export interface Prosumer {
  id: string;
  name: string;
  capacityKw: number; // 4, 6, 8, 10 kW
  currentGenKw: number;
  householdLoadKw: number;
  availableSurplusKw: number;
  maxAllowedSaleKw: number; // <= 80% of generation
  offerPriceInr: number; // Reserve offer price (?/kWh)
  acceptedQuantityKw: number;
  revenueInr: number;
}

export interface Consumer {
  id: string;
  name: string;
  baseDemandKw: number;
  currentDemandKw: number;
  bidPriceInr: number; // Willingness to pay (?/kWh)
  acceptedQuantityKw: number;
  costInr: number;
}

export interface CurvePoint {
  quantityKw: number;
  priceInr: number;
}

export interface PipelineStage {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  status: 'READY' | 'ACTIVE' | 'COMPLETE' | 'WARNING';
  metric: string;
  detail: string;
}

export interface BlockImbalance {
  committedKw: number;
  actualKw: number;
  shortfallKw: number;
  mitigationMechanism: 'RESIDUAL_GRID_IMPORT' | 'DEMAND_CURTAILMENT' | 'NONE';
  mitigationPowerKw: number;
  costInr: number;
}

export interface BlockSettlement {
  clearedEnergyKwh: number;
  clearingPriceInr: number;
  prosumerRevenueInr: number;
  consumerCostInr: number;
  gridImportCostInr: number;
  penaltiesInr: number;
  netMarketValueInr: number;
  
  // Benchmark comparison
  withoutP2pProsumerExportRate: number; // ?2.50
  withoutP2pConsumerImportRate: number; // ?7.20
  withoutP2pProsumerRevenueInr: number;
  withoutP2pConsumerCostInr: number;
  communitySavingsInr: number; // Total savings retained in township
}

export interface ValidationResult {
  transformerSafe: boolean;
  prosumerLimitSafe: boolean;
  uniformPriceSafe: boolean;
  violations: string[];
}

export interface CloudStormState {
  active: boolean;
  startBlock: number;
  durationBlocks: number;
  currentBlockOffset: number; // 0, 1, 2, 3
  remainingBlocks: number;
  expectedSolarKw: number;
  availableSolarKw: number;
  shortfallKw: number;
}

export interface MarketBlock {
  blockIndex: number; // 1 to 96
  simulatedHour: number; // 0.00 to 23.75
  timeLabel: string; // e.g. "12:45 PM ? 01:00 PM"
  clockTime: string; // e.g. "12:45"
  
  // High-level Market Metrics
  clearingPriceInr: number;
  clearedPowerKw: number;
  clearedEnergyKwh: number;
  totalPotentialSupplyKw: number;
  totalPotentialDemandKw: number;
  
  // Grid & Transformer Metrics
  transformerLoadKw: number;
  transformerLoadMw: number;
  transformerLimitMw: number; // 2.50 MW
  transformerUtilPercent: number;
  gridStatus: 'OPTIMAL' | 'ELEVATED' | 'STORM_SHOCK' | 'REBALANCING';
  
  // Curve data for chart
  supplyCurve: CurvePoint[];
  demandCurve: CurvePoint[];
  clearingPoint: { quantityKw: number; priceInr: number } | null;
  highestAcceptedBuyInr: number;
  lowestAcceptedSellInr: number;
  
  // Pipeline & Explanations
  pipelineStages: PipelineStage[];
  
  // Details & Aggregates
  prosumers: Prosumer[];
  consumers: Consumer[];
  prosumerAggregate: {
    totalGenerationKw: number;
    totalSurplusKw: number;
    totalClearedKw: number;
    avgSoldPercent: number;
    avgRevenueInr: number;
    capacityDistribution: { [key: number]: number };
  };
  consumerAggregate: {
    totalDemandKw: number;
    totalClearedKw: number;
    avgPriceInr: number;
    totalCostInr: number;
  };
  
  // Event & Safety
  cloudMultiplier: number; // 1.0 normal, 0.40 storm
  isStormActive: boolean;
  stormDetail: CloudStormState | null;
  imbalance: BlockImbalance;
  settlement: BlockSettlement;
  validation: ValidationResult;
  engineLatencyMs: number;
}

export interface CumulativeMarketReport {
  totalBlocksCleared: number;
  totalEnergyTradedMwh: number;
  totalEnergyGeneratedMwh: number;
  averageClearingPriceInr: number;
  totalProsumerRevenueInr: number;
  totalConsumerCostInr: number;
  totalCommunitySavingsInr: number;
  peakTransformerMw: number;
  maxProsumerSalePct: number;
  totalImbalanceKwh: number;
  totalPenaltiesInr: number;
  constraintViolationsCount: number;
  cloudStormBlocksHandled: number;
  averageClearingLatencyMs: number;
  maxClearingLatencyMs: number;
  constraintsHeld: {
    transformerLimit: boolean;
    prosumer80PercentRule: boolean;
    uniformClearingPrice: boolean;
  };
}
