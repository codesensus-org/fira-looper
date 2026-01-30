import { Address, encodeFunctionData, keccak256, sliceHex } from "viem";
import { Call } from ".";
import { FIRA_ADAPTER, firaAdapterAbi } from "../adapters/fira";
import { bundlerAbi } from "../adapters/bundler";

export function doFlashLoan(
  token: Address,
  amount: bigint,
  bundle: Call[],
): Call {
  const data = sliceHex(
    encodeFunctionData({
      abi: bundlerAbi,
      functionName: "reenter",
      args: [bundle],
    }),
    4,
  );

  return {
    to: FIRA_ADAPTER,
    data: encodeFunctionData({
      abi: firaAdapterAbi,
      functionName: "firaFlashLoan",
      args: [token, amount, data],
    }),
    value: 0n,
    skipRevert: false,
    callbackHash: keccak256(data),
  };
}
