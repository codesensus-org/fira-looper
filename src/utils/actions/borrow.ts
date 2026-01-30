import {
  Address,
  encodeFunctionData,
  keccak256,
  sliceHex,
  zeroHash,
} from "viem";
import { Call } from ".";
import { FIRA_ADAPTER, firaAdapterAbi } from "../adapters/fira";
import { MarketParams } from "../params";
import { bundlerAbi } from "../adapters/bundler";

export function doBorrow(
  market: MarketParams,
  assets: bigint,
  shares: bigint,
  minSharePriceE27: bigint,
  receiver: Address,
): Call {
  return {
    to: FIRA_ADAPTER,
    data: encodeFunctionData({
      abi: firaAdapterAbi,
      functionName: "firaBorrow",
      args: [market, assets, shares, minSharePriceE27, receiver],
    }),
    value: 0n,
    skipRevert: false,
    callbackHash: zeroHash,
  };
}

export function doRepay(
  market: MarketParams,
  assets: bigint,
  shares: bigint,
  maxSharePriceE27: bigint,
  onBehalf: Address,
  bundle?: Call[],
): Call {
  const data =
    bundle !== undefined
      ? sliceHex(
          encodeFunctionData({
            abi: bundlerAbi,
            functionName: "reenter",
            args: [bundle],
          }),
          4,
        )
      : "0x";

  return {
    to: FIRA_ADAPTER,
    data: encodeFunctionData({
      abi: firaAdapterAbi,
      functionName: "firaRepay",
      args: [market, assets, shares, maxSharePriceE27, onBehalf, data],
    }),
    value: 0n,
    skipRevert: false,
    callbackHash: bundle !== undefined ? keccak256(data) : zeroHash,
  };
}
