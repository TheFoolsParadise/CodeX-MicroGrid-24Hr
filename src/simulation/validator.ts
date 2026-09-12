import { Prosumer, ValidationResult } from './types';

export interface ValidationInput {
  transformerLoadKw: number;
  transformerMaxKw: number;
  prosumers: Prosumer[];
  clearingPriceInr: number;
}

export function validateBlockInvariants(input: ValidationInput): ValidationResult {
  const { transformerLoadKw, transformerMaxKw, prosumers, clearingPriceInr } = input;
  const violations: string[] = [];

  // INVARIANT 1: Transformer load <= 2.5 MW (with floating point tolerance)
  const transformerSafe = transformerLoadKw <= (transformerMaxKw + 0.001);
  if (!transformerSafe) {
    violations.push(`Transformer overload: ${transformerLoadKw.toFixed(2)} kW exceeds max ${transformerMaxKw} kW`);
  }

  // INVARIANT 2: Every prosumer sold_energy <= 0.8 * generation (with 0.001 tolerance)
  let prosumerLimitSafe = true;
  for (const p of prosumers) {
    if (p.currentGenKw > 0) {
      const allowed = 0.80 * p.currentGenKw + 0.001;
      if (p.acceptedQuantityKw > allowed) {
        prosumerLimitSafe = false;
        violations.push(`Prosumer ${p.id} sold ${p.acceptedQuantityKw.toFixed(2)} kW, exceeding 80% limit (${allowed.toFixed(2)} kW)`);
        break;
      }
    } else if (p.acceptedQuantityKw > 0.001) {
      prosumerLimitSafe = false;
      violations.push(`Prosumer ${p.id} sold energy without generation`);
      break;
    }
  }

  // INVARIANT 3: Exactly one uniform clearing price per block (all accepted trades settle at same clearingPriceInr)
  let uniformPriceSafe = true;
  for (const p of prosumers) {
    if (p.acceptedQuantityKw > 0) {
      const expectedRevenue = p.acceptedQuantityKw * 0.25 * clearingPriceInr;
      if (Math.abs(p.revenueInr - expectedRevenue) > 0.05) {
        uniformPriceSafe = false;
        violations.push(`Prosumer ${p.id} settlement deviation from uniform price ?${clearingPriceInr}`);
        break;
      }
    }
  }

  return {
    transformerSafe,
    prosumerLimitSafe,
    uniformPriceSafe,
    violations
  };
}
