import { AccrualPosition } from "@morpho-org/blue-sdk";
import { UseQueryResult } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

const INTERVAL = 1_000;

export function useAccrueInterest({
  data: position,
}: UseQueryResult<AccrualPosition | undefined>) {
  const [timestamp, setTimestamp] = useState<bigint>();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(BigInt(Date.now()) / 1000n);
    }, INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return useMemo(
    () => position?.accrueInterest(timestamp),
    [position, timestamp],
  );
}
