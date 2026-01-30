import { Address, encodeFunctionData, zeroHash } from "viem";
import { Call } from ".";
import { FIRA_ADAPTER, firaAdapterAbi } from "../adapters/fira";
import { MarketParams } from "../params";

export function doSupplyCollateral(
  market: MarketParams,
  assets: bigint,
  onBehalf: Address,
): Call {
  return {
    to: FIRA_ADAPTER,
    data: encodeFunctionData({
      abi: firaAdapterAbi,
      functionName: "firaSupplyCollateral",
      args: [market, assets, onBehalf, "0x"],
    }),
    value: 0n,
    skipRevert: false,
    callbackHash: zeroHash,
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
