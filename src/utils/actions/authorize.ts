import {
  Account,
  Address,
  Chain,
  Client,
  encodeFunctionData,
  parseSignature,
  zeroHash,
} from "viem";
import { Call } from ".";
import { blueAbi } from "@morpho-org/blue-sdk-viem";
import { Transport } from "wagmi";
import { multicall, signTypedData } from "viem/actions";

const TTL = 24n * 60n * 60n;
export const FIRA = "0xa428723eE8ffD87088C36121d72100B43F11fb6A";

export async function doAuthorize(
  client: Client<Transport, Chain, Account>,
  authorized: Address,
  isAuthorized: boolean,
): Promise<Call | Call[]> {
  const authorizer = client.account.address;

  const [status, nonce] = await multicall(client, {
    contracts: [
      {
        address: FIRA,
        abi: blueAbi,
        functionName: "isAuthorized",
        args: [authorizer, authorized],
      },
      {
        address: FIRA,
        abi: blueAbi,
        functionName: "nonce",
        args: [authorizer],
      },
    ],
    allowFailure: false,
  });

  if (status === isAuthorized) return [];

  const deadline = BigInt(Date.now()) / 1000n + TTL;

  const message = {
    authorizer,
    authorized,
    isAuthorized,
    nonce,
    deadline,
  } as const;

  const signature = await signTypedData(client, {
    types: {
      Authorization: [
        { name: "authorizer", type: "address" },
        { name: "authorized", type: "address" },
        { name: "isAuthorized", type: "bool" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "Authorization",
    domain: {
      chainId: 1,
      verifyingContract: FIRA,
    },
    message,
  });

  const { r, s, yParity } = parseSignature(signature);

  return {
    to: FIRA,
    data: encodeFunctionData({
      abi: blueAbi,
      functionName: "setAuthorizationWithSig",
      args: [
        message,
        {
          v: 27 + yParity,
          r,
          s,
        },
      ],
    }),
    value: 0n,
    skipRevert: false,
    callbackHash: zeroHash,
  };
}
