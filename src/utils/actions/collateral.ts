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

export function doSupplyCollateral(
  market: MarketParams,
  assets: bigint,
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
      functionName: "firaSupplyCollateral",
      args: [market, assets, onBehalf, data],
    }),
    value: 0n,
    skipRevert: false,
    callbackHash: bundle !== undefined ? keccak256(data) : zeroHash,
  };
}

export function doWithdrawCollateral(
  market: MarketParams,
  assets: bigint,
  receiver: Address,
): Call {
  return {
    to: FIRA_ADAPTER,
    data: encodeFunctionData({
      abi: firaAdapterAbi,
      functionName: "firaWithdrawCollateral",
      args: [market, assets, receiver],
    }),
    value: 0n,
    skipRevert: false,
    callbackHash: zeroHash,
  };
}
