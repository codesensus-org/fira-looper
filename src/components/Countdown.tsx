import { useEffect, useMemo, useState } from "react";

interface Props {
  maxLTV?: bigint;
  targetLTV?: bigint;
  borrowApy?: bigint;
}

const ONE_YEAR = 365n * 24n * 60n * 60n * 1000n;

export function Countdown({ maxLTV, targetLTV, borrowApy }: Props) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const eta = useMemo(() => {
    if (
      maxLTV === undefined ||
      targetLTV === undefined ||
      borrowApy === undefined
    ) {
      return undefined;
    }

    if (targetLTV <= 0n || borrowApy <= 0n) return -1;

    // TODO: Increase in borrowing rate based on utilization

    // Loan * (1 + Borrow Rate * _delay_) = Collateral * LLTV
    // Loan * (1 + Borrow Rate * _delay_) = (Loan / LTV) * LLTV
    // LTV * (1 + Borrow Rate * _delay_) = LLTV
    // (1 + Borrow Rate * _delay_) = LLTV / LTV
    // Borrow Rate * _delay_ = LLTV / LTV - 1
    // _delay_ = (LLTV / LTV - 1) / Borrow Rate
    // _delay_ = (Health - 1) / Borrow Rate

    const health = (maxLTV * 10n ** 18n) / targetLTV;
    const delay = ((health - 10n ** 18n) * ONE_YEAR) / borrowApy;

    return Date.now() + Number(delay);
  }, [maxLTV, targetLTV, borrowApy]);

  const parts = useMemo(() => {
    if (eta === undefined) return "Loading...";

    if (eta <= 0) return "never";

    let delta = BigInt(eta - now);
    delta /= 1000n;
    if (delta <= 0n) return "now";

    const parts: [bigint, string][] = [];

    parts.unshift([delta % 60n, "seconds"]);
    delta /= 60n;
    if (delta <= 0n) return parts;

    parts.unshift([delta % 60n, "minutes"]);
    delta /= 60n;
    if (delta <= 0n) return parts;

    parts.unshift([delta % 24n, "hours"]);
    delta /= 24n;
    if (delta <= 0n) return parts;

    parts.unshift([delta, "days"]);
    return parts;
  }, [eta, now]);

  if (typeof parts === "string") return parts;

  return parts
    .map(([value, label]) => `${value.toString()} ${label}`)
    .join(", ");
}
