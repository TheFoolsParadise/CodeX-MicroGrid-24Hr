import { Prosumer, Consumer } from './types';
import { SeededPRNG } from './prng';

export interface ParticipantRegistry {
  prosumers: Prosumer[];
  consumers: Consumer[];
  prosumerBaseSpecs: Array<{
    id: string;
    name: string;
    capacityKw: number;
    efficiency: number;
    baseLoadMultiplier: number;
    reservePriceOffset: number;
  }>;
  consumerBaseSpecs: Array<{
    id: string;
    name: string;
    scaleMultiplier: number;
    bidPriceOffset: number;
  }>;
}

// Generate the static 180 prosumers and 420 consumers using fixed seed 42819
export function initializeParticipants(seed: number = 42819): ParticipantRegistry {
  const rng = new SeededPRNG(seed);

  // 180 Prosumers with varying solar capacities:
  // 45 with 4kW, 65 with 6kW, 45 with 8kW, 25 with 10kW = 1,180 kW total capacity
  const capacities: number[] = [];
  for (let i = 0; i < 45; i++) capacities.push(4);
  for (let i = 0; i < 65; i++) capacities.push(6);
  for (let i = 0; i < 45; i++) capacities.push(8);
  for (let i = 0; i < 25; i++) capacities.push(10);

  // Shuffle deterministic
  for (let i = capacities.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [capacities[i], capacities[j]] = [capacities[j], capacities[i]];
  }

  const prosumerBaseSpecs = capacities.map((cap, idx) => {
    const id = `PRO-${(idx + 1).toString().padStart(3, '0')}`;
    const name = `Prosumer Villa ${idx + 1}`;
    // Rooftop tilt efficiency variation 0.94 - 1.04
    const efficiency = 0.94 + rng.next() * 0.10;
    // Internal household load multiplier 0.70 - 1.30
    const baseLoadMultiplier = 0.75 + rng.next() * 0.45;
    // Minimum price prosumer is willing to sell (above ?2.50 feed-in floor): ?2.65 to ?3.65
    const reservePriceOffset = 0.15 + rng.next() * 0.95;

    return {
      id,
      name,
      capacityKw: cap,
      efficiency,
      baseLoadMultiplier,
      reservePriceOffset
    };
  });

  // 420 Consumers
  const consumerBaseSpecs = Array.from({ length: 420 }, (_, idx) => {
    const id = `CON-${(idx + 1).toString().padStart(3, '0')}`;
    const name = `Consumer Apt ${idx + 1}`;
    // Household load scaling based on family size / appliance count: 0.70 - 1.40
    const scaleMultiplier = 0.72 + rng.next() * 0.60;
    // Maximum willingness to pay (below ?7.20 grid ceiling): ?5.20 to ?6.80
    const bidPriceOffset = 0.40 + rng.next() * 1.50;

    return {
      id,
      name,
      scaleMultiplier,
      bidPriceOffset
    };
  });

  const prosumers: Prosumer[] = prosumerBaseSpecs.map(p => ({
    id: p.id,
    name: p.name,
    capacityKw: p.capacityKw,
    currentGenKw: 0,
    householdLoadKw: 0,
    availableSurplusKw: 0,
    maxAllowedSaleKw: 0,
    offerPriceInr: 2.50 + p.reservePriceOffset,
    acceptedQuantityKw: 0,
    revenueInr: 0
  }));

  const consumers: Consumer[] = consumerBaseSpecs.map(c => ({
    id: c.id,
    name: c.name,
    baseDemandKw: 0.5,
    currentDemandKw: 0,
    bidPriceInr: 7.20 - c.bidPriceOffset,
    acceptedQuantityKw: 0,
    costInr: 0
  }));

  return {
    prosumers,
    consumers,
    prosumerBaseSpecs,
    consumerBaseSpecs
  };
}
