import { AccrualPosition } from "@morpho-org/blue-sdk";
import { useCallback } from "react";
import { encodeFunctionData, erc20Abi, formatEther, maxUint256 } from "viem";
import { useWalletClient } from "wagmi";
import { BUNDLER, bundlerAbi } from "../../utils/adapters/bundler";
import { doTransfer, doTransferFrom } from "../../utils/actions/transfer";
import { doFlashLoan } from "../../utils/actions/flash-loan";
import { doSell } from "../../utils/actions/paraswap";
import { doSupplyCollateral } from "../../utils/actions/collateral";
import { doBorrow } from "../../utils/actions/borrow";
import { FIRA_ADAPTER } from "../../utils/adapters/fira";
import { PARASWAP_ADAPTER } from "../../utils/adapters/paraswap";
import { readContract, sendTransaction } from "viem/actions";
import { doAuthorize } from "../../utils/actions/authorize";
import { MARKET_PARAMS } from "../../utils/params";

const slippage = 1n; // 0.01%

export function useBorrowBundle(position?: AccrualPosition, amount?: bigint) {
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

    const underlyingBalance = await readContract(client, {
      address: collateralToken,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [client.account.address],
    });

    console.log(`Borrowing: ${formatEther(amount)}`);

    let borrowAmount = amount;
    if (borrowAmount > position.market.liquidity) {
      borrowAmount = position.market.liquidity;
      console.log(`Capped at liquidity: ${formatEther(borrowAmount)}`);
    }

    const swap = await doSell(
      client,
      loanToken,
      collateralToken,
      FIRA_ADAPTER,
      borrowAmount,
      slippage,
    );

    return await sendTransaction(client, {
      to: BUNDLER,
      data: encodeFunctionData({
        abi: bundlerAbi,
        functionName: "multicall",
        args: [
          [
            await doAuthorize(client, FIRA_ADAPTER, true),
            await doTransferFrom(
              client,
              collateralToken,
              FIRA_ADAPTER,
              underlyingBalance,
            ),
            doFlashLoan(
              loanToken,
              borrowAmount,
              [
                doTransfer(
                  loanToken,
                  FIRA_ADAPTER,
                  PARASWAP_ADAPTER,
                  borrowAmount,
                ),
                swap,
                doSupplyCollateral(
                  MARKET_PARAMS,
                  maxUint256,
                  client.account.address,
                ),
                doBorrow(
                  MARKET_PARAMS,
                  borrowAmount,
                  0n,
                  position.market.toBorrowAssets(
                    (10_000n - slippage) * 10n ** 23n,
                  ),
                  FIRA_ADAPTER,
                ),
              ].flat(),
            ),
          ].flat(),
        ],
      }),
    });
  }, [client, position, amount]);
}
