import {
  Account,
  Address,
  Chain,
  Client,
  encodeFunctionData,
  zeroHash,
} from "viem";
import { Call } from ".";
import { GENERAL_ADAPTER_1, generalAdapter1Abi } from "../adapters/general";
import { Transport } from "wagmi";
import { doPermit } from "./permit";

export function doTransfer(
  token: Address,
  owner: Address,
  receiver: Address,
  amount: bigint,
): Call | Call[] {
  if (amount === 0n) return [];

  return {
    to: owner,
    data: encodeFunctionData({
      abi: generalAdapter1Abi,
      functionName: "erc20Transfer",
      args: [token, receiver, amount],
    }),
    value: 0n,
    skipRevert: false,
    callbackHash: zeroHash,
  };
}

export async function doTransferFrom(
  client: Client<Transport, Chain, Account>,
  token: Address,
  receiver: Address,
  amount: bigint,
): Promise<Call | Call[]> {
  if (amount === 0n) return [];

  const permit = await doPermit(client, token, GENERAL_ADAPTER_1, amount);

  return [
    permit,
    {
      to: GENERAL_ADAPTER_1,
      data: encodeFunctionData({
        abi: generalAdapter1Abi,
        functionName:
          !Array.isArray(permit) && permit.permit2
            ? "permit2TransferFrom"
            : "erc20TransferFrom",
        args: [token, receiver, amount],
      }),
      value: 0n,
      skipRevert: false,
      callbackHash: zeroHash,
    },
  ].flat();
}
