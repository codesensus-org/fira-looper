import { AccrualPosition } from "@morpho-org/blue-sdk";
import { useCallback } from "react";
import { encodeFunctionData, erc20Abi, formatUnits, maxUint256 } from "viem";
import { useWalletClient } from "wagmi";
import { BUNDLER, bundlerAbi } from "../../utils/adapters/bundler";
import { doFlashLoan } from "../../utils/actions/flash-loan";
import { doBuy } from "../../utils/actions/paraswap";
import {
  doSupplyCollateral,
  doWithdrawCollateral,
} from "../../utils/actions/collateral";
import { doRepay } from "../../utils/actions/borrow";
import { GENERAL_ADAPTER_1 } from "../../utils/adapters/general";
import { multicall, sendTransaction } from "viem/actions";
import { doAuthorize } from "../../utils/actions/authorize";
import { PARASWAP_ADAPTER } from "../../utils/adapters/paraswap";
import { doTransfer, doTransferFrom } from "../../utils/actions/transfer";
import { skipRevert } from "../../utils/actions";

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

    const { collateralToken, loanToken } = position.market.params;

    const [loanBalance, decimals] = await multicall(client, {
      contracts: [
        {
          address: loanToken,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [client.account.address],
        },
        {
          address: loanToken,
          abi: erc20Abi,
          functionName: "decimals",
        },
      ],
      allowFailure: false,
    });

    console.log(`Repaying: ${formatUnits(amount, decimals)}`);

    const swap = await doBuy(
      client,
      collateralToken,
      loanToken,
      GENERAL_ADAPTER_1,
      amount - loanBalance,
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
            await doTransferFrom(
              client,
              loanToken,
              GENERAL_ADAPTER_1,
              loanBalance,
            ),
            doFlashLoan(
              loanToken,
              amount - loanBalance,
              [
                doRepay(
                  position.market.params,
                  amount,
                  0n,
                  position.market.toBorrowAssets(
                    (10_000n + slippage) * 10n ** 23n,
                  ),
                  client.account.address,
                ),
                doWithdrawCollateral(
                  position.market.params,
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
                  GENERAL_ADAPTER_1,
                  client.account.address,
                  maxUint256,
                ),
                doTransfer(
                  collateralToken,
                  PARASWAP_ADAPTER,
                  GENERAL_ADAPTER_1,
                  maxUint256,
                ),
                doSupplyCollateral(
                  position.market.params,
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
