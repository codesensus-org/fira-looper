import { formatEther } from "viem";

export function round(value: bigint, decimals: number) {
  return Number(formatEther(value)).toFixed(decimals);
}
