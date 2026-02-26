export class SecureRandom {
  private pool: Uint8Array;
  private cursor: number = 0;

  constructor(pool: Uint8Array) {
    this.pool = pool;
  }

  private getByte(): number {
    if (this.cursor >= this.pool.length) {
      const arr = new Uint8Array(1);
      window.crypto.getRandomValues(arr);
      return arr[0];
    }
    return this.pool[this.cursor++];
  }

  nextInt(min: number, max: number): number {
    const range = max - min;
    if (range <= 0) return min;

    let bytesNeeded = 1;
    let maxNum = 256;
    while (maxNum < range) {
      bytesNeeded++;
      maxNum *= 256;
    }

    const maxValid = maxNum - (maxNum % range);

    let randomValue: number;
    do {
      randomValue = 0;
      for (let i = 0; i < bytesNeeded; i++) {
        randomValue = (randomValue << 8) + this.getByte();
      }
    } while (randomValue >= maxValid);

    return min + (randomValue % range);
  }

  nextBoolean(): boolean {
    return (this.getByte() & 1) === 1;
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

export async function createSecureRandom(question: string, bytesNeeded: number = 2048): Promise<SecureRandom> {
  const randomBytes = new Uint8Array(bytesNeeded);
  window.crypto.getRandomValues(randomBytes);

  if (question.trim()) {
    const encoder = new TextEncoder();
    const questionBytes = encoder.encode(question.trim());
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', questionBytes);
    const hashArray = new Uint8Array(hashBuffer);

    // XOR the secure random bytes with the question hash.
    // This incorporates the question into the randomness while maintaining
    // cryptographic security (XORing true random with deterministic data is still true random).
    for (let i = 0; i < bytesNeeded; i++) {
      randomBytes[i] ^= hashArray[i % hashArray.length];
    }
  }

  return new SecureRandom(randomBytes);
}

// Keep the old synchronous functions for backwards compatibility if needed,
// but we will migrate to createSecureRandom.
export function secureRandomInt(min: number, max: number): number {
  const range = max - min;
  if (range <= 0) return min;

  let bytesNeeded = 1;
  let maxNum = 256;
  while (maxNum < range) {
    bytesNeeded++;
    maxNum *= 256;
  }

  const array = new Uint8Array(bytesNeeded);
  const maxValid = maxNum - (maxNum % range);

  let randomValue: number;
  do {
    window.crypto.getRandomValues(array);
    randomValue = 0;
    for (let i = 0; i < bytesNeeded; i++) {
      randomValue = (randomValue << 8) + array[i];
    }
  } while (randomValue >= maxValid);

  return min + (randomValue % range);
}

export function secureShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomInt(0, i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function secureCoinFlip(): boolean {
  const array = new Uint8Array(1);
  window.crypto.getRandomValues(array);
  return (array[0] & 1) === 1;
}
