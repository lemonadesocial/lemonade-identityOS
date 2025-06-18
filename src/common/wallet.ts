/**
 * return an invalid wallet address with the timestamp postfix to prevent uniqueness violation
 * if being updated multiple times
 */
export function getDiscardedWalletAddress(wallet: string) {
  return `_${wallet}:${Date.now()}`;
}

export function isValidWalletAddress(wallet?: string) {
  return !!wallet && !wallet.startsWith("_");
}
