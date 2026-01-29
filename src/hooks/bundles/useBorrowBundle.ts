import { AccrualPosition } from "@morpho-org/blue-sdk";
import { useCallback } from "react";
import { encodeFunctionData, erc20Abi, formatUnits, maxUint256 } from "viem";
import { useWalletClient } from "wagmi";
import { BUNDLER, bundlerAbi } from "../../utils/adapters/bundler";
import { doTransfer, doTransferFrom } from "../../utils/actions/transfer";
import { doFlashLoan } from "../../utils/actions/flash-loan";
import { doSell } from "../../utils/actions/paraswap";
import { doSupplyCollateral } from "../../utils/actions/collateral";
import { doBorrow } from "../../utils/actions/borrow";
import { GENERAL_ADAPTER_1 } from "../../utils/adapters/general";
import { PARASWAP_ADAPTER } from "../../utils/adapters/paraswap";
import { multicall, sendTransaction } from "viem/actions";
import { doAuthorize } from "../../utils/actions/authorize";

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

    const { collateralToken, loanToken } = position.market.params;

    const [underlyingBalance, loanBalance, decimals] = await multicall(client, {
      contracts: [
        {
          address: collateralToken,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [client.account.address],
        },
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

    console.log(`Borrowing: ${formatUnits(amount, decimals)}`);

    let borrowAmount = amount;
    if (borrowAmount > position.market.liquidity) {
      borrowAmount = position.market.liquidity;
      console.log(
        `Capped at liquidity: ${formatUnits(borrowAmount, decimals)}`,
      );
    }

    const swap = await doSell(
      client,
      loanToken,
      collateralToken,
      GENERAL_ADAPTER_1,
      borrowAmount + loanBalance,
      slippage,
    );

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
              collateralToken,
              GENERAL_ADAPTER_1,
              underlyingBalance,
            ),
            await doTransferFrom(
              client,
              loanToken,
              PARASWAP_ADAPTER,
              loanBalance,
            ),
            doFlashLoan(
              loanToken,
              borrowAmount,
              [
                doTransfer(
                  loanToken,
                  GENERAL_ADAPTER_1,
                  PARASWAP_ADAPTER,
                  borrowAmount,
                ),
                swap,
                doSupplyCollateral(
                  position.market.params,
                  maxUint256,
                  client.account.address,
                ),
                doBorrow(
                  position.market.params,
                  borrowAmount,
                  0n,
                  position.market.toBorrowAssets(
                    (10_000n - slippage) * 10n ** 23n,
                  ),
                  GENERAL_ADAPTER_1,
                ),
              ].flat(),
            ),
          ].flat(),
        ],
      }),
    });
  }, [client, position, amount]);
}
