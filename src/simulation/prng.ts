// Seeded Pseudo-Random Number Generator (Mulberry32)
// Ensures reproducible deterministic simulations

export class SeededPRNG {
  private state: number;

  constructor(seed: number = 42819) {
    this.state = seed >>> 0;
  }

  // Returns pseudo-random float in [0, 1)
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Float in [min, max)
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  // Integer in [min, max]
  rangeInt(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  // Standard normal distribution via Box-Muller transform
  normal(mean: number = 0, stdDev: number = 1): number {
    let u = 0, v = 0;
    while (u === 0) u = this.next();
    while (v === 0) v = this.next();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + z * stdDev;
  }
}
