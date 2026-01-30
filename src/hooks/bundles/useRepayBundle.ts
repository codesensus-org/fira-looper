import { AccrualPosition } from "@morpho-org/blue-sdk";
import { useCallback } from "react";
import { encodeFunctionData, formatEther, maxUint256 } from "viem";
import { useWalletClient } from "wagmi";
import { BUNDLER, bundlerAbi } from "../../utils/adapters/bundler";
import { doFlashLoan } from "../../utils/actions/flash-loan";
import { doBuy } from "../../utils/actions/paraswap";
import {
  doSupplyCollateral,
  doWithdrawCollateral,
} from "../../utils/actions/collateral";
import { doRepay } from "../../utils/actions/borrow";
import { FIRA_ADAPTER } from "../../utils/adapters/fira";
import { sendTransaction } from "viem/actions";
import { doAuthorize } from "../../utils/actions/authorize";
import { PARASWAP_ADAPTER } from "../../utils/adapters/paraswap";
import { doTransfer } from "../../utils/actions/transfer";
import { skipRevert } from "../../utils/actions";
import { MARKET_PARAMS } from "../../utils/params";

const slippage = 1n; // 0.01%

export function useRepayBundle(position?: AccrualPosition, amount?: bigint) {
  const { data: client } = useWalletClient();

  return useCallback(async () => {
    if (
      client === undefined ||
      position === undefined ||
      amount === undefined ||
      amount <= 0n
    ) {
      return undefined;
    }

    const { collateralToken, loanToken } = MARKET_PARAMS;

    console.log(`Repaying: ${formatEther(amount)}`);

    const swap = await doBuy(
      client,
      collateralToken,
      loanToken,
      FIRA_ADAPTER,
      amount,
      slippage,
    );

    const limitAmount = Array.isArray(swap) ? 0n : swap.limitAmount;

    return await sendTransaction(client, {
      to: BUNDLER,
      data: encodeFunctionData({
        abi: bundlerAbi,
        functionName: "multicall",
        args: [
          [
            await doAuthorize(client, FIRA_ADAPTER, true),
            doFlashLoan(
              loanToken,
              amount,
              [
                doRepay(
                  MARKET_PARAMS,
                  amount,
                  0n,
                  position.market.toBorrowAssets(
                    (10_000n + slippage) * 10n ** 23n,
                  ),
                  client.account.address,
                ),
                doWithdrawCollateral(
                  MARKET_PARAMS,
                  limitAmount,
                  PARASWAP_ADAPTER,
                ),
                swap,
              ].flat(),
            ),

            // Recover/redeposit leftover dust
            skipRevert(
              [
                doTransfer(
                  loanToken,
                  FIRA_ADAPTER,
                  client.account.address,
                  maxUint256,
                ),
                doTransfer(
                  collateralToken,
                  PARASWAP_ADAPTER,
                  FIRA_ADAPTER,
                  maxUint256,
                ),
                doSupplyCollateral(
                  MARKET_PARAMS,
                  maxUint256,
                  client.account.address,
                ),
              ].flat(),
            ),
          ].flat(),
        ],
      }),
    });
  }, [client, position, amount]);
}
