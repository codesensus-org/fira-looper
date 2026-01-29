import { Address, encodeFunctionData, keccak256, sliceHex } from "viem";
import { Call } from ".";
import { GENERAL_ADAPTER_1, generalAdapter1Abi } from "../adapters/general";
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
    to: GENERAL_ADAPTER_1,
    data: encodeFunctionData({
      abi: generalAdapter1Abi,
      functionName: "morphoFlashLoan",
      args: [token, amount, data],
    }),
    value: 0n,
    skipRevert: false,
    callbackHash: keccak256(data),
  };
}
