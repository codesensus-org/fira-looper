import { useEffect, useState } from "react";
import { formatUnits } from "viem";

export function Smoothen({
  value,
  decimals,
  symbol,
}: {
  value?: bigint;
  decimals?: number;
  symbol?: string;
}) {
  const [snapshot, setSnapshot] = useState<{
    value: bigint;
    timestamp: bigint;
    rate: bigint;
  }>();

  useEffect(() => {
    if (value === undefined) {
      setSnapshot(undefined);
      return;
    }

    const timestamp = BigInt(Date.now());

    setSnapshot((prev) => {
      if (timestamp === prev?.timestamp) return prev;

      const rate =
        prev !== undefined
          ? ((value - prev.value) * 10n ** 18n) / (timestamp - prev.timestamp)
          : 0n;

      return {
        value,
        timestamp,
        rate,
      };
    });

    const timeout = setTimeout(() => {
      setSnapshot({
        value,
        timestamp,
        rate: 0n,
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [value]);

  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const interval = setInterval(() => {
      if (snapshot === undefined) {
        setDisplay(undefined);
        return;
      }

      const elapsed = BigInt(Date.now()) - snapshot.timestamp;
      const delta = (snapshot.rate * elapsed) / 10n ** 18n;
      setDisplay(snapshot.value + delta);
    }, 10);

    return () => clearInterval(interval);
  }, [snapshot]);

  if (display === undefined || decimals === undefined || symbol === undefined)
    return "Loading...";

  return (
    <>
      {formatUnits(display, decimals)} {symbol}
    </>
  );
}
