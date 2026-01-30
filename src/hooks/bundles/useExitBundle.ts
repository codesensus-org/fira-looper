import { AccrualPosition } from "@morpho-org/blue-sdk";
import { useCallback } from "react";
import { encodeFunctionData, maxUint256 } from "viem";
import { useWalletClient } from "wagmi";
import { BUNDLER, bundlerAbi } from "../../utils/adapters/bundler";
import { doBuy } from "../../utils/actions/paraswap";
import { doWithdrawCollateral } from "../../utils/actions/collateral";
import { doRepay } from "../../utils/actions/borrow";
import { FIRA_ADAPTER } from "../../utils/adapters/fira";
import { sendTransaction } from "viem/actions";
import { doAuthorize } from "../../utils/actions/authorize";
import { PARASWAP_ADAPTER } from "../../utils/adapters/paraswap";
import { doFlashLoan } from "../../utils/actions/flash-loan";
import { doTransfer } from "../../utils/actions/transfer";
import { skipRevert } from "../../utils/actions";
import { MARKET_PARAMS } from "../../utils/params";

const slippage = 1n; // 0.01%

export function useExitBundle(position?: AccrualPosition) {
  const { data: client } = useWalletClient();

  return useCallback(async () => {
    if (client === undefined || position === undefined) {
      return undefined;
    }

    const { collateralToken, loanToken } = MARKET_PARAMS;

    const amount =
      (position.borrowAssets * (10_000n + slippage) + 10_000n - 1n) / 10_000n;

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
              collateralToken,
              limitAmount,
              [
                doTransfer(
                  collateralToken,
                  FIRA_ADAPTER,
                  PARASWAP_ADAPTER,
                  limitAmount,
                ),
                swap,
                doRepay(
                  MARKET_PARAMS,
                  0n,
                  position.borrowShares,
                  position.market.toBorrowAssets(
                    (10_000n + slippage) * 10n ** 23n,
                  ),
                  client.account.address,
                ),
                doWithdrawCollateral(
                  MARKET_PARAMS,
                  position.collateral,
                  FIRA_ADAPTER,
                ),

                // Recover leftover dust
                skipRevert(
                  doTransfer(
                    collateralToken,
                    PARASWAP_ADAPTER,
                    FIRA_ADAPTER,
                    maxUint256,
                  ),
                ),
              ].flat(),
            ),
            doTransfer(
              collateralToken,
              FIRA_ADAPTER,
              client.account.address,
              maxUint256,
            ),

            // Recover leftover dust
            skipRevert(
              doTransfer(
                loanToken,
                FIRA_ADAPTER,
                client.account.address,
                maxUint256,
              ),
            ),
          ].flat(),
        ],
      }),
    });
  }, [client, position]);
}
