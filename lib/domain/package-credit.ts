/** Package lesson-credit tracking (02 §5, 10 §8). */

export interface PackageCreditState {
  purchasedCount: number;
  consumedCount: number;
}

export function remainingCredits(state: PackageCreditState): number {
  return Math.max(0, state.purchasedCount - state.consumedCount);
}

export function consumeCredit(state: PackageCreditState, count = 1): PackageCreditState {
  if (count < 1) throw new Error("count must be >= 1");
  if (remainingCredits(state) < count) {
    throw new Error("Not enough package credits remaining");
  }
  return { ...state, consumedCount: state.consumedCount + count };
}

export function restoreCredit(state: PackageCreditState, count = 1): PackageCreditState {
  if (count < 1) throw new Error("count must be >= 1");
  return { ...state, consumedCount: Math.max(0, state.consumedCount - count) };
}

export function packageProgress(state: PackageCreditState): number {
  if (state.purchasedCount === 0) return 0;
  return Math.min(1, state.consumedCount / state.purchasedCount);
}

export function isPackageComplete(state: PackageCreditState): boolean {
  return remainingCredits(state) === 0 && state.purchasedCount > 0;
}
