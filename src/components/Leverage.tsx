import { useConnection, useReadContract } from "wagmi";
import { erc20Abi, formatEther, parseEther, zeroAddress } from "viem";
import { useMemo, useState } from "react";
import { shorten } from "../utils/strings";
import { Controls } from "./Controls";
import { useBorrowBundle } from "../hooks/bundles/useBorrowBundle";
import { useRepayBundle } from "../hooks/bundles/useRepayBundle";
import { useAccrualPosition } from "../hooks/useAccrualPosition";
import { useExitBundle } from "../hooks/bundles/useExitBundle";
import { Smoothen } from "./Smoothen";
import { useAccrueInterest } from "../hooks/useAccrueInterest";
import { Countdown } from "./Countdown";

const FIRA_BASE_URL = "https://app.fira.money/migrate#";
const MARKET_ID =
  "0xa597b5a36f6cc0ede718ba58b2e23f5c747da810bf8e299022d88123ab03340e" as const;
const LLTV = parseEther("0.9999"); // TODO: Fetch on-chain

export function Leverage() {
  const { address } = useConnection();

  const [targetLTV, setTargetLTV] = useState<bigint>();

  const position = useAccrueInterest(useAccrualPosition(address, MARKET_ID));

  const { data: collateralBalance } = useReadContract({
    address: position?.market.params.collateralToken,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address ?? zeroAddress],
    query: {
      enabled: position !== undefined && address !== undefined,
    },
  });

  const marketName =
    position !== undefined
      ? `${shorten(position.market.params.collateralToken)}/${shorten(position.market.params.loanToken)}`
      : undefined;

  const { equity, targetBorrow } = useMemo(() => {
    if (position === undefined || collateralBalance === undefined) {
      return {};
    }

    const collateralValue = position.market.getCollateralValue(
      collateralBalance + position.collateral,
    );

    if (collateralValue === undefined) return {};

    const equity = collateralValue - position.borrowAssets;

    if (targetLTV === undefined) return { equity, targetBorrow: 0n };

    const targetLeverage = 10n ** (18n * 2n) / (10n ** 18n - targetLTV);

    const targetBorrow =
      (equity * (targetLeverage - 10n ** 18n)) / 10n ** 18n -
      position.borrowAssets;

    return { equity, targetBorrow };
  }, [targetLTV, position, collateralBalance]);

  const borrow = useBorrowBundle(position, targetBorrow);
  const repay = useRepayBundle(
    position,
    targetBorrow !== undefined ? -targetBorrow : undefined,
  );
  const exit = useExitBundle(position);

  const disabled =
    targetLTV === undefined ||
    targetBorrow === undefined ||
    targetBorrow === 0n;

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>
              <h2>Earning</h2>
            </th>
            <th>
              <h2>Looping</h2>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <p>
                Token:{" "}
                {position !== undefined
                  ? shorten(position.market.params.collateralToken)
                  : "Loading..."}
              </p>
              <p>
                Underlying:{" "}
                {collateralBalance !== undefined
                  ? formatEther(collateralBalance)
                  : "Loading..."}{" "}
                {position !== undefined
                  ? shorten(position.market.params.collateralToken)
                  : undefined}
              </p>
              <p>
                Collateral:{" "}
                <Smoothen
                  value={
                    position !== undefined ? position.collateral : undefined
                  }
                  decimals={18}
                  symbol={
                    position !== undefined
                      ? shorten(position.market.params.collateralToken)
                      : undefined
                  }
                />
              </p>
              <p>
                Equity:{" "}
                <Smoothen
                  value={equity}
                  decimals={18}
                  symbol={
                    position !== undefined
                      ? shorten(position.market.params.loanToken)
                      : undefined
                  }
                />
              </p>
            </td>
            <td>
              <p>
                Market:{" "}
                {position !== undefined && marketName !== undefined ? (
                  <a
                    href={`${FIRA_BASE_URL}/${position.marketId}`}
                    target="_blank"
                  >
                    {marketName}
                  </a>
                ) : (
                  "Loading..."
                )}
              </p>
              <p>
                Borrow APY:{" "}
                {position !== undefined ? (
                  <>{(100 * position.market.borrowApy).toFixed(2)}%</>
                ) : (
                  "Loading..."
                )}
              </p>
              <p>
                Loan:{" "}
                <Smoothen
                  value={position?.borrowAssets}
                  decimals={18}
                  symbol={
                    position !== undefined
                      ? shorten(position.market.params.loanToken)
                      : undefined
                  }
                />
              </p>
              <p>
                Liquidity:{" "}
                {position !== undefined
                  ? formatEther(position.market.liquidity)
                  : "Loading..."}{" "}
                {position !== undefined
                  ? shorten(position.market.params.loanToken)
                  : undefined}
              </p>
            </td>
          </tr>
        </tbody>
      </table>

      <Controls
        maxLTV={position?.market.params.lltv ?? 0n}
        liquidationLTV={LLTV}
        targetLTV={targetLTV ?? position?.ltv ?? 0n}
        setTargetLTV={setTargetLTV}
      />

      <div>
        Liquidation ETA:{" "}
        <Countdown
          maxLTV={position?.market.params.lltv}
          targetLTV={targetLTV ?? (position?.ltv !== null ? position?.ltv : 0n)}
          borrowApy={
            position !== undefined
              ? parseEther(position.market.borrowApy.toFixed(18))
              : undefined
          }
        />
      </div>

      <button
        disabled={disabled}
        onClick={() => {
          if (disabled) return;

          if (targetBorrow > 0n) borrow();
          else if (targetLTV > 0n) repay();
          else exit();
        }}
      >
        Execute
      </button>
    </>
  );
}
