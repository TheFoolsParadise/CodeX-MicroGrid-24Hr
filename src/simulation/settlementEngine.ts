import { BlockSettlement } from './types';

export interface SettlementInput {
  clearedQuantityKw: number;
  clearedEnergyKwh: number;
  clearingPriceInr: number;
  imbalanceCostInr: number;
  residualGridImportKw: number;
}

export function calculateSettlement(input: SettlementInput): BlockSettlement {
  const { clearedQuantityKw, clearedEnergyKwh, clearingPriceInr, imbalanceCostInr, residualGridImportKw } = input;

  const prosumerRevenueInr = Number((clearedEnergyKwh * clearingPriceInr).toFixed(2));
  const consumerCostInr = Number((clearedEnergyKwh * clearingPriceInr).toFixed(2));
  
  // Residual grid import from TANGEDCO utility at standard commercial rate (?7.20/kWh)
  const gridImportKwh = residualGridImportKw * 0.25;
  const gridImportCostInr = Number((gridImportKwh * 7.20).toFixed(2));
  
  const penaltiesInr = imbalanceCostInr > 0 ? Number((imbalanceCostInr * 0.15).toFixed(2)) : 0;
  const netMarketValueInr = Number((prosumerRevenueInr + consumerCostInr).toFixed(2));

  // Benchmark comparison against traditional utility structure
  const withoutP2pProsumerExportRate = 2.50; // Feed-in tariff floor
  const withoutP2pConsumerImportRate = 7.20; // Grid import ceiling

  const withoutP2pProsumerRevenueInr = Number((clearedEnergyKwh * withoutP2pProsumerExportRate).toFixed(2));
  const withoutP2pConsumerCostInr = Number((clearedEnergyKwh * withoutP2pConsumerImportRate).toFixed(2));

  // Community savings retained in the local microgrid:
  // Prosumer added gain: (P* - 2.50) * E
  // Consumer saved cost: (7.20 - P*) * E
  // Total community savings = (7.20 - 2.50) * E = 4.70 * E
  const communitySavingsInr = Number((clearedEnergyKwh * (withoutP2pConsumerImportRate - withoutP2pProsumerExportRate)).toFixed(2));

  return {
    clearedEnergyKwh,
    clearingPriceInr,
    prosumerRevenueInr,
    consumerCostInr,
    gridImportCostInr,
    penaltiesInr,
    netMarketValueInr,
    withoutP2pProsumerExportRate,
    withoutP2pConsumerImportRate,
    withoutP2pProsumerRevenueInr,
    withoutP2pConsumerCostInr,
    communitySavingsInr
  };
}
