import { Address, Hash, Hex } from "viem";

export interface Call {
  to: Address;
  data: Hex;
  value: bigint;
  skipRevert: boolean;
  callbackHash: Hash;
}

export function skipRevert(bundle: Call): Call;
export function skipRevert(bundle: Call[]): Call[];
export function skipRevert(bundle: Call | Call[]): Call | Call[];
export function skipRevert(bundle: Call | Call[]): Call | Call[] {
  if (Array.isArray(bundle)) return bundle.map((call) => skipRevert(call));

  return {
    ...bundle,
    skipRevert: true,
  };
}
