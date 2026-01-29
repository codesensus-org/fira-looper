import { Address, encodeFunctionData, zeroHash } from "viem";
import { Call } from ".";
import { GENERAL_ADAPTER_1, generalAdapter1Abi } from "../adapters/general";
import { InputMarketParams } from "@morpho-org/blue-sdk";

export function doBorrow(
  market: InputMarketParams,
  assets: bigint,
  shares: bigint,
  minSharePriceE27: bigint,
  receiver: Address,
): Call {
  return {
    to: GENERAL_ADAPTER_1,
    data: encodeFunctionData({
      abi: generalAdapter1Abi,
      functionName: "morphoBorrow",
      args: [market, assets, shares, minSharePriceE27, receiver],
    }),
    value: 0n,
    skipRevert: false,
    callbackHash: zeroHash,
  };
}

export function doRepay(
  market: InputMarketParams,
  assets: bigint,
  shares: bigint,
  maxSharePriceE27: bigint,
  onBehalf: Address,
): Call {
  return {
    to: GENERAL_ADAPTER_1,
    data: encodeFunctionData({
      abi: generalAdapter1Abi,
      functionName: "morphoRepay",
      args: [market, assets, shares, maxSharePriceE27, onBehalf, "0x"],
    }),
    value: 0n,
    skipRevert: false,
    callbackHash: zeroHash,
  };
}
