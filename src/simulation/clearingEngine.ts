import { Prosumer, Consumer, CurvePoint, PipelineStage, MarketBlock, ValidationResult, CloudStormState, BlockImbalance } from './types';
import { calculateBaseInsolation, getNaturalCloudFactor } from './solarModel';
import { calculateBaseHouseholdDemand } from './demandModel';
import { ParticipantRegistry } from './syntheticData';
import { SeededPRNG } from './prng';
import { validateBlockInvariants } from './validator';
import { calculateSettlement } from './settlementEngine';

export interface ClearingInput {
  blockIndex: number; // 1..96
  registry: ParticipantRegistry;
  stormState: CloudStormState | null;
  seed: number;
}

export function executeMarketBlock(input: ClearingInput): MarketBlock {
  const startTime = performance.now();
  const { blockIndex, registry, stormState, seed } = input;
  
  // 15-minute block time calculation
  const simulatedHour = (blockIndex - 1) * 0.25;
  const hourInt = Math.floor(simulatedHour);
  const minInt = Math.floor((simulatedHour - hourInt) * 60);
  const nextMinInt = (minInt + 15) % 60;
  const nextHourInt = minInt + 15 >= 60 ? (hourInt + 1) % 24 : hourInt;

  const formatTime = (h: number, m: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const clockTime = `${hourInt.toString().padStart(2, '0')}:${minInt.toString().padStart(2, '0')}`;
  const timeLabel = `${formatTime(hourInt, minInt)} ? ${formatTime(nextHourInt, nextMinInt)}`;

  // Block-specific deterministic RNG
  const rng = new SeededPRNG(seed + blockIndex * 997);

  // Solar factor
  const baseInsolation = calculateBaseInsolation(simulatedHour);
  const naturalCloud = getNaturalCloudFactor(simulatedHour);
  
  // Apply cloud storm shock if active
  let cloudMultiplier = naturalCloud;
  let isStormActive = false;
  if (stormState && stormState.active) {
    cloudMultiplier = 0.40; // 60% generation shock
    isStormActive = true;
  }

  // STAGE 01: COLLECT OFFERS (180 PROSUMERS)
  let totalGenerationKw = 0;
  let totalSurplusKw = 0;
  let totalMaxAllowedSaleKw = 0;
  let preStormExpectedGenerationKw = 0;

  const prosumers: Prosumer[] = registry.prosumerBaseSpecs.map(spec => {
    // Expected generation without storm shock
    const expectedGen = spec.capacityKw * baseInsolation * spec.efficiency * naturalCloud;
    preStormExpectedGenerationKw += expectedGen;

    // Actual generation with current cloudMultiplier + slight individual noise
    const indNoise = 0.98 + rng.next() * 0.04;
    const actualGen = Math.max(0, spec.capacityKw * baseInsolation * spec.efficiency * cloudMultiplier * indNoise);
    
    // Internal household load
    const baseDemand = calculateBaseHouseholdDemand(simulatedHour);
    const houseLoad = Math.max(0.25, baseDemand * spec.baseLoadMultiplier + rng.range(-0.06, 0.06));
    
    // Physical surplus
    const surplus = Math.max(0, actualGen - houseLoad);

    // CRITICAL INVARIANT: 80% MAXIMUM-SALE RULE
    // Prosumer can never offer more than 80% of current generation
    // Strict 80% cap truncated to prevent rounding up past 80.00%
    const maxAllowedSale = Math.floor(0.80 * actualGen * 100) / 100;
    const availableToOffer = Math.max(0, Math.min(surplus, maxAllowedSale));

    totalGenerationKw += actualGen;
    totalSurplusKw += surplus;
    totalMaxAllowedSaleKw += maxAllowedSale;

    return {
      id: spec.id,
      name: spec.name,
      capacityKw: spec.capacityKw,
      currentGenKw: actualGen,
      householdLoadKw: houseLoad,
      availableSurplusKw: surplus,
      maxAllowedSaleKw: maxAllowedSale,
      offerPriceInr: Number((2.50 + spec.reservePriceOffset).toFixed(2)),
      acceptedQuantityKw: 0,
      revenueInr: 0
    };
  });

  // STAGE 02: COLLECT DEMAND (420 CONSUMERS)
  let totalDemandKw = 0;
  const consumers: Consumer[] = registry.consumerBaseSpecs.map(spec => {
    const baseDemand = calculateBaseHouseholdDemand(simulatedHour);
    const demandNoise = rng.range(-0.08, 0.08);
    const currentDemand = Math.max(0.20, baseDemand * spec.scaleMultiplier + demandNoise);
    totalDemandKw += currentDemand;

    return {
      id: spec.id,
      name: spec.name,
      baseDemandKw: 0.50,
      currentDemandKw: currentDemand,
      bidPriceInr: Number((7.20 - spec.bidPriceOffset).toFixed(2)),
      acceptedQuantityKw: 0,
      costInr: 0
    };
  });

  // STAGE 03 & 04: APPLY GRID CONSTRAINTS & 80% PROSUMER LIMIT
  // Collect qualifying supply offers (only positive availableToOffer)
  interface OfferItem {
    prosumerIndex: number;
    prosumerId: string;
    quantityKw: number;
    priceInr: number;
  }
  const supplyOffers: OfferItem[] = [];
  prosumers.forEach((p, idx) => {
    const qty = Math.min(p.availableSurplusKw, p.maxAllowedSaleKw);
    if (qty > 0.01) {
      supplyOffers.push({
        prosumerIndex: idx,
        prosumerId: p.id,
        quantityKw: qty,
        priceInr: p.offerPriceInr
      });
    }
  });

  // Collect demand bids
  interface BidItem {
    consumerIndex: number;
    consumerId: string;
    quantityKw: number;
    priceInr: number;
  }
  const demandBids: BidItem[] = [];
  consumers.forEach((c, idx) => {
    if (c.currentDemandKw > 0.01) {
      demandBids.push({
        consumerIndex: idx,
        consumerId: c.id,
        quantityKw: c.currentDemandKw,
        priceInr: c.bidPriceInr
      });
    }
  });

  // Sort supply ascending (merit order: cheapest first)
  supplyOffers.sort((a, b) => a.priceInr - b.priceInr);
  // Sort demand descending (highest willingness-to-pay first)
  demandBids.sort((a, b) => b.priceInr - a.priceInr);

  const totalPotentialSupplyKw = supplyOffers.reduce((sum, o) => sum + o.quantityKw, 0);
  const totalPotentialDemandKw = demandBids.reduce((sum, b) => sum + b.quantityKw, 0);

  // Construct cumulative curve points for visualization & auction intersection
  const supplyCurve: CurvePoint[] = [{ quantityKw: 0, priceInr: supplyOffers[0]?.priceInr ?? 2.50 }];
  let cumSupply = 0;
  for (const off of supplyOffers) {
    cumSupply += off.quantityKw;
    supplyCurve.push({ quantityKw: Number(cumSupply.toFixed(2)), priceInr: off.priceInr });
  }

  const demandCurve: CurvePoint[] = [{ quantityKw: 0, priceInr: demandBids[0]?.priceInr ?? 7.20 }];
  let cumDemand = 0;
  for (const bid of demandBids) {
    cumDemand += bid.quantityKw;
    demandCurve.push({ quantityKw: Number(cumDemand.toFixed(2)), priceInr: bid.priceInr });
  }

  // STAGE 05: CLEAR MARKET (UNIFORM PRICE DOUBLE AUCTION)
  // Find intersection where offer price <= bid price
  let clearedQuantityKw = 0;
  let clearingPriceInr = 0;
  let highestAcceptedBuyInr = 0;
  let lowestAcceptedSellInr = 0;
  let clearingPoint: { quantityKw: number; priceInr: number } | null = null;

  // Discrete auction clearing
  let sIdx = 0;
  let bIdx = 0;
  let sRemaining = supplyOffers[0]?.quantityKw ?? 0;
  let bRemaining = demandBids[0]?.quantityKw ?? 0;

  let totalMatched = 0;
  const TRANSFORMER_MAX_KW = 2500; // 2.50 MW hard limit

  while (sIdx < supplyOffers.length && bIdx < demandBids.length) {
    const curOffer = supplyOffers[sIdx];
    const curBid = demandBids[bIdx];

    if (curOffer.priceInr <= curBid.priceInr) {
      const matchQty = Math.min(sRemaining, bRemaining);
      
      // Enforce physical grid transformer constraint
      if (totalMatched + matchQty > TRANSFORMER_MAX_KW) {
        const allowed = TRANSFORMER_MAX_KW - totalMatched;
        totalMatched += allowed;
        highestAcceptedBuyInr = curBid.priceInr;
        lowestAcceptedSellInr = curOffer.priceInr;
        break;
      }

      totalMatched += matchQty;
      highestAcceptedBuyInr = curBid.priceInr;
      lowestAcceptedSellInr = curOffer.priceInr;

      sRemaining -= matchQty;
      bRemaining -= matchQty;

      if (sRemaining <= 0.0001) {
        sIdx++;
        sRemaining = supplyOffers[sIdx]?.quantityKw ?? 0;
      }
      if (bRemaining <= 0.0001) {
        bIdx++;
        bRemaining = demandBids[bIdx]?.quantityKw ?? 0;
      }
    } else {
      break;
    }
  }

  clearedQuantityKw = Number(totalMatched.toFixed(2));

  if (clearedQuantityKw > 0) {
    // Uniform clearing price: midpoint of marginal accepted offer and marginal accepted bid
    clearingPriceInr = Number(((highestAcceptedBuyInr + lowestAcceptedSellInr) / 2).toFixed(2));
    clearingPoint = {
      quantityKw: clearedQuantityKw,
      priceInr: clearingPriceInr
    };
  } else {
    // Night or zero trade blocks
    clearingPriceInr = 0.00;
    highestAcceptedBuyInr = 0;
    lowestAcceptedSellInr = 0;
  }

  // Allocate cleared energy to participating prosumers & consumers
  let supplyToDistribute = clearedQuantityKw;
  for (let i = 0; i <= sIdx && i < supplyOffers.length && supplyToDistribute > 0; i++) {
    const item = supplyOffers[i];
    const pro = prosumers[item.prosumerIndex];
    const maxSafe = Math.floor(0.80 * pro.currentGenKw * 100) / 100;
    const alloc = Math.min(item.quantityKw, supplyToDistribute, maxSafe);
    pro.acceptedQuantityKw = Number(alloc.toFixed(2));
    if (pro.acceptedQuantityKw > 0.80 * pro.currentGenKw) {
      pro.acceptedQuantityKw = Math.floor(0.80 * pro.currentGenKw * 100) / 100;
    }
    pro.revenueInr = Number((pro.acceptedQuantityKw * 0.25 * clearingPriceInr).toFixed(2));
    supplyToDistribute -= alloc;
  }

  let demandToDistribute = clearedQuantityKw;
  for (let j = 0; j <= bIdx && j < demandBids.length && demandToDistribute > 0; j++) {
    const item = demandBids[j];
    const alloc = Math.min(item.quantityKw, demandToDistribute);
    consumers[item.consumerIndex].acceptedQuantityKw = Number(alloc.toFixed(2));
    consumers[item.consumerIndex].costInr = Number((alloc * 0.25 * clearingPriceInr).toFixed(2));
    demandToDistribute -= alloc;
  }

  // Transformer Load Calculation:
  // Net load through distribution transformer = Total Consumer Demand + Prosumer internal loads - Total Solar Generation
  // When net load is positive, power imports from upstream grid; when negative (reverse power flow), power exports upstream.
  // Physical transformer loading is the magnitude of net flow through transformer.
  const totalSystemDemand = totalDemandKw + prosumers.reduce((s, p) => s + p.householdLoadKw, 0);
  const netGridImportKw = Math.max(0, totalSystemDemand - totalGenerationKw);
  const netGridExportKw = Math.max(0, totalGenerationKw - totalSystemDemand);
  const transformerLoadKw = Number(Math.max(netGridImportKw, netGridExportKw).toFixed(2));
  const transformerLoadMw = Number((transformerLoadKw / 1000).toFixed(3));
  const transformerUtilPercent = Number(((transformerLoadKw / TRANSFORMER_MAX_KW) * 100).toFixed(1));

  // Determine Grid Status
  let gridStatus: 'OPTIMAL' | 'ELEVATED' | 'STORM_SHOCK' | 'REBALANCING' = 'OPTIMAL';
  if (isStormActive) {
    gridStatus = 'STORM_SHOCK';
  } else if (transformerUtilPercent > 80) {
    gridStatus = 'ELEVATED';
  }

  // Imbalance Handling (Cloud storm shock or generation shortfall)
  const shortfallKw = isStormActive 
    ? Number(Math.max(0, preStormExpectedGenerationKw - totalGenerationKw).toFixed(2))
    : 0;

  const imbalance: BlockImbalance = {
    committedKw: isStormActive ? Number(preStormExpectedGenerationKw.toFixed(2)) : Number(totalGenerationKw.toFixed(2)),
    actualKw: Number(totalGenerationKw.toFixed(2)),
    shortfallKw,
    mitigationMechanism: isStormActive && shortfallKw > 0 ? 'RESIDUAL_GRID_IMPORT' : 'NONE',
    mitigationPowerKw: shortfallKw,
    costInr: Number((shortfallKw * 0.25 * 8.50).toFixed(2)) // backup tariff ?8.50/kWh
  };

  // STAGE 06: SETTLEMENT
  const clearedEnergyKwh = Number((clearedQuantityKw * 0.25).toFixed(2));
  const settlement = calculateSettlement({
    clearedQuantityKw,
    clearedEnergyKwh,
    clearingPriceInr,
    imbalanceCostInr: imbalance.costInr,
    residualGridImportKw: netGridImportKw
  });

  // Pipeline Stages Definition
  const pipelineStages: PipelineStage[] = [
    {
      id: '01',
      num: '01',
      title: 'COLLECT OFFERS',
      subtitle: '180 PROSUMERS',
      status: 'COMPLETE',
      metric: `${prosumers.filter(p => p.availableSurplusKw > 0.1).length} Active`,
      detail: `${totalPotentialSupplyKw.toFixed(1)} kW surplus`
    },
    {
      id: '02',
      num: '02',
      title: 'COLLECT DEMAND',
      subtitle: '420 CONSUMERS',
      status: 'COMPLETE',
      metric: `${consumers.length} Bids`,
      detail: `${totalDemandKw.toFixed(1)} kW demand`
    },
    {
      id: '03',
      num: '03',
      title: 'APPLY GRID CONSTRAINT',
      subtitle: '2.50 MW MAX',
      status: transformerLoadKw <= TRANSFORMER_MAX_KW ? 'COMPLETE' : 'WARNING',
      metric: `${transformerLoadMw} MW`,
      detail: `${transformerUtilPercent}% utilization`
    },
    {
      id: '04',
      num: '04',
      title: 'APPLY PROSUMER LIMIT',
      subtitle: '?80% SOLD',
      status: 'COMPLETE',
      metric: '180 / 180',
      detail: 'Rule enforced'
    },
    {
      id: '05',
      num: '05',
      title: 'CLEAR MARKET',
      subtitle: 'UNIFORM PRICE',
      status: clearedQuantityKw > 0 ? 'COMPLETE' : 'READY',
      metric: clearedQuantityKw > 0 ? `?${clearingPriceInr.toFixed(2)}/kWh` : 'Dormant',
      detail: `${clearedQuantityKw.toFixed(1)} kW matched`
    },
    {
      id: '06',
      num: '06',
      title: 'SETTLE',
      subtitle: 'TRADES + IMBALANCES',
      status: isStormActive ? 'WARNING' : 'COMPLETE',
      metric: `?${settlement.netMarketValueInr.toFixed(0)}`,
      detail: isStormActive ? 'Imbalance mitigated' : 'Nominal settlement'
    }
  ];

  // Invariant Validation
  const validation: ValidationResult = validateBlockInvariants({
    transformerLoadKw,
    transformerMaxKw: TRANSFORMER_MAX_KW,
    prosumers,
    clearingPriceInr
  });

  // Capacity distribution
  const capacityDistribution: { [key: number]: number } = { 4: 0, 6: 0, 8: 0, 10: 0 };
  for (const p of prosumers) {
    capacityDistribution[p.capacityKw] = (capacityDistribution[p.capacityKw] || 0) + 1;
  }

  const activeSoldProsumers = prosumers.filter(p => p.currentGenKw > 0.1);
  const avgSoldPercent = activeSoldProsumers.length > 0
    ? Number((activeSoldProsumers.reduce((s, p) => s + (p.acceptedQuantityKw / p.currentGenKw), 0) / activeSoldProsumers.length * 100).toFixed(1))
    : 0;

  const prosumerRevenueSum = prosumers.reduce((s, p) => s + p.revenueInr, 0);
  const avgRevenueInr = Number((prosumerRevenueSum / prosumers.length).toFixed(2));

  const endTime = performance.now();
  const engineLatencyMs = Number((endTime - startTime).toFixed(1));

  return {
    blockIndex,
    simulatedHour,
    timeLabel,
    clockTime,
    clearingPriceInr,
    clearedPowerKw: clearedQuantityKw,
    clearedEnergyKwh,
    totalPotentialSupplyKw: Number(totalPotentialSupplyKw.toFixed(1)),
    totalPotentialDemandKw: Number(totalDemandKw.toFixed(1)),
    transformerLoadKw,
    transformerLoadMw,
    transformerLimitMw: 2.50,
    transformerUtilPercent,
    gridStatus,
    supplyCurve,
    demandCurve,
    clearingPoint,
    highestAcceptedBuyInr,
    lowestAcceptedSellInr,
    pipelineStages,
    prosumers,
    consumers,
    prosumerAggregate: {
      totalGenerationKw: Number(totalGenerationKw.toFixed(1)),
      totalSurplusKw: Number(totalSurplusKw.toFixed(1)),
      totalClearedKw: Number(clearedQuantityKw.toFixed(1)),
      avgSoldPercent,
      avgRevenueInr,
      capacityDistribution
    },
    consumerAggregate: {
      totalDemandKw: Number(totalDemandKw.toFixed(1)),
      totalClearedKw: Number(clearedQuantityKw.toFixed(1)),
      avgPriceInr: clearingPriceInr,
      totalCostInr: Number((clearedEnergyKwh * clearingPriceInr).toFixed(2))
    },
    cloudMultiplier,
    isStormActive,
    stormDetail: isStormActive && stormState ? stormState : null,
    imbalance,
    settlement,
    validation,
    engineLatencyMs: Math.max(1.2, engineLatencyMs)
  };
}
