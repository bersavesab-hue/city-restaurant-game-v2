import { gameState } from "./GameState.js";
import { eventBus } from "./EventBus.js";

const UINT32_MAX_PLUS_ONE = 4294967296;

function hashString(value) {
  let hash = 2166136261;

  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function normalizeSeed(seed) {
  let value;

  if (typeof seed === "string") {
    value = hashString(seed);
  } else if (Number.isFinite(seed)) {
    value = Math.trunc(seed) >>> 0;
  } else {
    throw new TypeError("Seed must be a finite number or string");
  }

  return value === 0 ? 0x6d2b79f5 : value;
}

class RandomSystem {
  ensureState() {
    let randomState = gameState.getSection("random");

    if (!randomState) {
      const seed = normalizeSeed(Date.now());

      randomState = {
        seed,
        state: seed,
        calls: 0
      };

      gameState.setSection(
        "random",
        randomState,
        "random:initialize"
      );
    }

    return randomState;
  }

  setSeed(seed) {
    const normalized = normalizeSeed(seed);

    const randomState = {
      seed: normalized,
      state: normalized,
      calls: 0
    };

    gameState.setSection(
      "random",
      randomState,
      "random:setSeed"
    );

    eventBus.emit("random:seedChanged", {
      seed: normalized
    });

    return normalized;
  }

  getSeed() {
    return this.ensureState().seed;
  }

  getState() {
    return structuredClone(this.ensureState());
  }

  nextUint32() {
    const randomState = this.ensureState();

    let x = randomState.state >>> 0;

    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;

    x >>>= 0;

    randomState.state = x;
    randomState.calls += 1;

    gameState.setSection(
      "random",
      randomState,
      "random:next"
    );

    return x;
  }

  float() {
    return this.nextUint32() / UINT32_MAX_PLUS_ONE;
  }

  int(min, max) {
    if (!Number.isInteger(min) || !Number.isInteger(max)) {
      throw new TypeError("Random integer bounds must be integers");
    }

    if (max < min) {
      throw new RangeError("Maximum must be greater than or equal to minimum");
    }

    return min + Math.floor(
      this.float() * (max - min + 1)
    );
  }

  chance(probability) {
    if (
      typeof probability !== "number" ||
      probability < 0 ||
      probability > 1
    ) {
      throw new RangeError(
        "Probability must be between 0 and 1"
      );
    }

    return this.float() < probability;
  }

  pick(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Cannot pick from an empty array");
    }

    return items[this.int(0, items.length - 1)];
  }

  weightedPick(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Weighted items must be a non-empty array");
    }

    let totalWeight = 0;

    for (const item of items) {
      if (
        !item ||
        typeof item.weight !== "number" ||
        item.weight < 0
      ) {
        throw new Error(
          "Every weighted item must contain a non-negative weight"
        );
      }

      totalWeight += item.weight;
    }

    if (totalWeight <= 0) {
      throw new Error("Total weight must be greater than zero");
    }

    let roll = this.float() * totalWeight;

    for (const item of items) {
      roll -= item.weight;

      if (roll < 0) {
        return item.value;
      }
    }

    return items[items.length - 1].value;
  }

  shuffle(items) {
    if (!Array.isArray(items)) {
      throw new TypeError("Shuffle input must be an array");
    }

    const result = structuredClone(items);

    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = this.int(0, i);

      [result[i], result[j]] = [
        result[j],
        result[i]
      ];
    }

    return result;
  }
}

export const randomSystem = new RandomSystem();
export { RandomSystem };
