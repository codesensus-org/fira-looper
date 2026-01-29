import {
  Account,
  Address,
  Chain,
  Client,
  encodeFunctionData,
  erc20Abi,
  parseSignature,
  serializeSignature,
  Transport,
  zeroAddress,
  zeroHash,
} from "viem";
import { Call } from ".";
import { multicall, signTypedData } from "viem/actions";
import { permit2Abi } from "@morpho-org/blue-sdk-viem";

const TTL = 24n * 60n * 60n;
const PERMIT2 = "0x000000000022D473030F116dDEE9F6B43aC78BA3";

export async function doPermit(
  client: Client<Transport, Chain, Account>,
  token: Address,
  spender: Address,
  value: bigint,
): Promise<(Call & { permit2: boolean }) | []> {
  if (value === 0n) return [];

  const owner = client.account.address;

  const [allowance, name, version, salt, nonce, permit2Allowance] =
    await multicall(client, {
      contracts: [
        {
          address: token,
          abi: erc20Abi,
          functionName: "allowance",
          args: [owner, spender],
        },
        {
          address: token,
          abi: erc20Abi,
          functionName: "name",
        },
        {
          address: token,
          abi: [
            {
              type: "function",
              stateMutability: "view",
              name: "version",
              inputs: [],
              outputs: [{ name: "", type: "string" }],
            },
          ],
          functionName: "version",
          args: [],
        },
        {
          address: token,
          abi: [
            {
              type: "function",
              stateMutability: "view",
              name: "salt",
              inputs: [],
              outputs: [{ name: "", type: "bytes32" }],
            },
          ],
          functionName: "salt",
          args: [],
        },
        {
          address: token,
          abi: [
            {
              type: "function",
              stateMutability: "view",
              name: "nonces",
              inputs: [{ name: "owner", type: "address" }],
              outputs: [{ name: "", type: "uint256" }],
            },
          ],
          functionName: "nonces",
          args: [owner],
        },
        {
          address: PERMIT2,
          abi: permit2Abi,
          functionName: "allowance",
          args: [owner, token, spender],
        },
      ],
    });

  if (allowance.error !== undefined) throw allowance.error;
  if (allowance.result >= value) return [];

  if (name.error !== undefined) throw name.error;
  if (nonce.error !== undefined) {
    if (permit2Allowance.error !== undefined) throw permit2Allowance.error;

    return {
      ...(await doPermit2(
        client,
        token,
        spender,
        value,
        permit2Allowance.result[2],
      )),
      permit2: true,
    };
  }

  const deadline = BigInt(Date.now()) / 1000n + TTL;

  const signature = await signTypedData(client, {
    types: {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "Permit",
    domain: {
      chainId: 1,
      name: name.result,
      version: version.result ?? "1",
      verifyingContract: token,
      salt: salt.result,
    },
    message: {
      owner,
      spender,
      value,
      nonce: nonce.result,
      deadline,
    },
  });

  const { r, s, yParity } = parseSignature(signature);

  return {
    to: token,
    data: encodeFunctionData({
      abi: [
        {
          inputs: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
            { name: "deadline", type: "uint256" },
            { name: "v", type: "uint8" },
            { name: "r", type: "bytes32" },
            { name: "s", type: "bytes32" },
          ],
          name: "permit",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      functionName: "permit",
      args: [owner, spender, value, deadline, 27 + yParity, r, s],
    }),
    value: 0n,
    skipRevert: false,
    callbackHash: zeroHash,
    permit2: false,
  };
}

async function doPermit2(
  client: Client<Transport, Chain, Account>,
  token: Address,
  spender: Address,
  amount: bigint,
  nonce: number,
): Promise<Call> {
  const owner = client.account.address;

  const deadline = BigInt(Date.now()) / 1000n + TTL;

  const message = {
    details: {
      token,
      amount,
      expiration: Number(deadline),
      nonce,
    },
    spender,
    sigDeadline: deadline,
  };

  const signature = await signTypedData(client, {
    types: {
      PermitSingle: [
        { name: "details", type: "PermitDetails" },
        { name: "spender", type: "address" },
        { name: "sigDeadline", type: "uint256" },
      ],
      PermitDetails: [
        { name: "token", type: "address" },
        { name: "amount", type: "uint160" },
        { name: "expiration", type: "uint48" },
        { name: "nonce", type: "uint48" },
      ],
    },
    primaryType: "PermitSingle",
    domain: {
      chainId: 1,
      name: "Permit2",
      verifyingContract: PERMIT2,
    },
    message,
  });

  // TODO: Approval tx if first time

  return {
    to: PERMIT2 ?? zeroAddress,
    data: encodeFunctionData({
      abi: permit2Abi,
      functionName: "permit",
      args: [owner, message, serializeSignature(parseSignature(signature))],
    }),
    value: 0n,
    skipRevert: false,
    callbackHash: zeroHash,
  };
}
