import {
  Account,
  Address,
  Chain,
  Client,
  encodeFunctionData,
  erc20Abi,
  Hex,
  sliceHex,
  Transport,
  zeroHash,
} from "viem";
import { Call } from ".";
import { PARASWAP_ADAPTER, paraswapAdapterAbi } from "../adapters/paraswap";
import { constructSimpleSDK } from "@paraswap/sdk";
import { multicall } from "viem/actions";
import { round } from "../numbers";

// From https://paraswap.notion.site/d23ad8f05e4f402aa906ab3f59763a87
const CALLDATA_OFFSETS: Record<
  string,
  { src: number; dest: number; quoted?: number }
> = {
  swapExactAmountIn: { src: 100, dest: 132 },
  swapExactAmountInOnBalancerV2: { src: 4, dest: 36 },
  swapExactAmountInOnCurveV1: { src: 132, dest: 164 },
  swapExactAmountInOnCurveV2: { src: 196, dest: 228 },
  swapExactAmountInOnUniswapV2: { src: 164, dest: 196 },
  swapExactAmountInOnUniswapV3: { src: 164, dest: 196 },
  swapExactAmountInOutOnMakerPSM: { src: 68, dest: 100 },
  swapExactAmountOut: { src: 100, dest: 132, quoted: 164 },
  swapExactAmountOutOnBalancerV2: { src: 4, dest: 36, quoted: 68 },
  swapExactAmountOutOnUniswapV2: { src: 164, dest: 196, quoted: 228 },
  swapExactAmountOutOnUniswapV3: { src: 164, dest: 196, quoted: 228 },
  swapOnAugustusRFQTryBatchFill: { src: 4, dest: 36 },
};

const paraswap = constructSimpleSDK({ chainId: 1, fetch });

interface ParaSwapCall extends Call {
  quotedAmount: bigint;
  limitAmount: bigint;
}

export async function doSell(
  client: Client<Transport, Chain, Account>,
  srcToken: Address,
  destToken: Address,
  receiver: Address,
  amount: bigint,
  slippage: bigint,
): Promise<ParaSwapCall | []> {
  if (amount === 0n || srcToken === destToken) return [];

  const [srcDecimals, destDecimals] = await multicall(client, {
    contracts: [
      {
        address: srcToken,
        abi: erc20Abi,
        functionName: "decimals",
      },
      {
        address: destToken,
        abi: erc20Abi,
        functionName: "decimals",
      },
    ],
    allowFailure: false,
  });

  const {
    txParams: { to: augustus, data: callData },
    priceRoute: { destAmount, contractMethod },
  } = await paraswap.swap.getSwapTxData({
    srcToken,
    srcDecimals,
    destToken,
    destDecimals,
    amount: amount.toString(),
    side: "SELL",
    userAddress: PARASWAP_ADAPTER,
    slippage: Number(slippage),
    options: {
      partnerAddress: client.account.address,
      takeSurplus: true,
      isSurplusToUser: true,
      isCapSurplus: false,
    },
  });

  const cost =
    ((amount * 10n ** BigInt(destDecimals) -
      BigInt(destAmount) * 10n ** BigInt(srcDecimals)) *
      10n ** 18n) /
    10n ** BigInt(srcDecimals + destDecimals);

  console.log(
    `Swap cost: ${round(cost, 2)} (${round((100n * cost * 10n ** BigInt(srcDecimals)) / amount, 5)}%)`,
  );
  console.log(
    `Exchange rate: ${round((BigInt(destAmount) * 10n ** 18n) / amount, 4)} (${round((amount * 10n ** 18n) / BigInt(destAmount), 4)})`,
  );

  const offsets = CALLDATA_OFFSETS[contractMethod];
  const limitAmount = BigInt(
    sliceHex(callData as Hex, offsets.dest, offsets.dest + 32),
  );

  return {
    to: PARASWAP_ADAPTER,
    data: encodeFunctionData({
      abi: paraswapAdapterAbi,
      functionName: "sell",
      args: [
        augustus as Address,
        callData as Hex,
        srcToken,
        destToken,
        false,
        {
          exactAmount: BigInt(offsets.src),
          limitAmount: BigInt(offsets.dest),
          quotedAmount: BigInt(offsets.quoted ?? 0),
        },
        receiver,
      ],
    }),
    value: 0n,
    skipRevert: false,
    callbackHash: zeroHash,
    quotedAmount: BigInt(destAmount),
    limitAmount,
  };
}

export async function doBuy(
  client: Client<Transport, Chain, Account>,
  srcToken: Address,
  destToken: Address,
  receiver: Address,
  amount: bigint,
  slippage: bigint,
): Promise<ParaSwapCall | []> {
  if (amount === 0n) return [];

  const [srcDecimals, destDecimals] = await multicall(client, {
    contracts: [
      {
        address: srcToken,
        abi: erc20Abi,
        functionName: "decimals",
      },
      {
        address: destToken,
        abi: erc20Abi,
        functionName: "decimals",
      },
    ],
    allowFailure: false,
  });

  const {
    txParams: { to: augustus, data: callData },
    priceRoute: { srcAmount, contractMethod },
  } = await paraswap.swap.getSwapTxData({
    srcToken,
    srcDecimals,
    destToken,
    destDecimals,
    amount: amount.toString(),
    side: "BUY",
    userAddress: PARASWAP_ADAPTER,
    slippage: Number(slippage),
    options: {
      partnerAddress: client.account.address,
      takeSurplus: true,
      isSurplusToUser: true,
      isCapSurplus: false,
    },
  });

  const cost =
    ((BigInt(srcAmount) * 10n ** BigInt(destDecimals) -
      amount * 10n ** BigInt(srcDecimals)) *
      10n ** 18n) /
    10n ** BigInt(srcDecimals + destDecimals);

  console.log(
    `Swap cost: ${round(cost, 2)} (${round((100n * cost * 10n ** BigInt(destDecimals)) / amount, 5)}%)`,
  );

  const offsets = CALLDATA_OFFSETS[contractMethod];
  const limitAmount = BigInt(
    sliceHex(callData as Hex, offsets.src, offsets.src + 32),
  );

  return {
    to: PARASWAP_ADAPTER,
    data: encodeFunctionData({
      abi: paraswapAdapterAbi,
      functionName: "buy",
      args: [
        augustus as Address,
        callData as Hex,
        srcToken,
        destToken,
        0n,
        {
          exactAmount: BigInt(offsets.dest),
          limitAmount: BigInt(offsets.src),
          quotedAmount: BigInt(offsets.quoted ?? 0),
        },
        receiver,
      ],
    }),
    value: 0n,
    skipRevert: false,
    callbackHash: zeroHash,
    quotedAmount: BigInt(srcAmount),
    limitAmount,
  };
}
