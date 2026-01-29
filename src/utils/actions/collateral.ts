import { Address, encodeFunctionData, zeroHash } from "viem";
import { Call } from ".";
import { GENERAL_ADAPTER_1, generalAdapter1Abi } from "../adapters/general";
import { InputMarketParams } from "@morpho-org/blue-sdk";

export function doSupplyCollateral(
  market: InputMarketParams,
  assets: bigint,
  onBehalf: Address,
): Call {
  return {
    to: GENERAL_ADAPTER_1,
    data: encodeFunctionData({
      abi: generalAdapter1Abi,
      functionName: "morphoSupplyCollateral",
      args: [market, assets, onBehalf, "0x"],
    }),
    value: 0n,
    skipRevert: false,
    callbackHash: zeroHash,
  };
}

export function doWithdrawCollateral(
  market: InputMarketParams,
  assets: bigint,
  receiver: Address,
): Call {
  return {
    to: GENERAL_ADAPTER_1,
    data: encodeFunctionData({
      abi: generalAdapter1Abi,
      functionName: "morphoWithdrawCollateral",
      args: [market, assets, receiver],
    }),
    value: 0n,
    skipRevert: false,
    callbackHash: zeroHash,
  };
}
