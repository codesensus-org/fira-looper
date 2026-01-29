import { AccrualPosition } from "@morpho-org/blue-sdk";
import { useCallback } from "react";
import { encodeFunctionData, maxUint256 } from "viem";
import { useWalletClient } from "wagmi";
import { BUNDLER, bundlerAbi } from "../../utils/adapters/bundler";
import { doBuy } from "../../utils/actions/paraswap";
import { doWithdrawCollateral } from "../../utils/actions/collateral";
import { doRepay } from "../../utils/actions/borrow";
import { GENERAL_ADAPTER_1 } from "../../utils/adapters/general";
import { sendTransaction } from "viem/actions";
import { doAuthorize } from "../../utils/actions/authorize";
import { PARASWAP_ADAPTER } from "../../utils/adapters/paraswap";
import { doFlashLoan } from "../../utils/actions/flash-loan";
import { doTransfer } from "../../utils/actions/transfer";
import { skipRevert } from "../../utils/actions";

const slippage = 1n; // 0.01%

export function useExitBundle(position?: AccrualPosition) {
  const { data: client } = useWalletClient();

  return useCallback(async () => {
    if (client === undefined || position === undefined) {
      return undefined;
    }

    const { collateralToken, loanToken } = position.market.params;

    const amount =
      (position.borrowAssets * (10_000n + slippage) + 10_000n - 1n) / 10_000n;

    const swap = await doBuy(
      client,
      collateralToken,
      loanToken,
      GENERAL_ADAPTER_1,
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
            await doAuthorize(client, GENERAL_ADAPTER_1, true),
            doFlashLoan(
              collateralToken,
              limitAmount,
              [
                doTransfer(
                  collateralToken,
                  GENERAL_ADAPTER_1,
                  PARASWAP_ADAPTER,
                  limitAmount,
                ),
                swap,
                doRepay(
                  position.market.params,
                  0n,
                  position.borrowShares,
                  position.market.toBorrowAssets(
                    (10_000n + slippage) * 10n ** 23n,
                  ),
                  client.account.address,
                ),
                doWithdrawCollateral(
                  position.market.params,
                  position.collateral,
                  GENERAL_ADAPTER_1,
                ),

                // Recover leftover dust
                skipRevert(
                  doTransfer(
                    collateralToken,
                    PARASWAP_ADAPTER,
                    GENERAL_ADAPTER_1,
                    maxUint256,
                  ),
                ),
              ].flat(),
            ),
            doTransfer(
              collateralToken,
              GENERAL_ADAPTER_1,
              client.account.address,
              maxUint256,
            ),

            // Recover leftover dust
            skipRevert(
              doTransfer(
                loanToken,
                GENERAL_ADAPTER_1,
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
