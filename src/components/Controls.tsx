import { Dispatch, HTMLInputTypeAttribute } from "react";
import { parseEther } from "viem";
import { round } from "../utils/numbers";

interface Props {
  maxLTV?: bigint;
  targetLTV?: bigint;
  liquidationLTV?: bigint;
  setTargetLTV: Dispatch<bigint | undefined>;
}

const ONE = 10n ** 18n;
const INFINITE = (9_9999n * ONE) / 10_000n;

function Control({
  type,
  precision,
  serialize,
  deserialize,
  maxLTV = 0n,
  targetLTV = 0n,
  setTargetLTV,
}: Props & {
  type: HTMLInputTypeAttribute;
  precision: number;
  serialize: (ltv: bigint) => bigint;
  deserialize: (value: bigint) => bigint;
}) {
  let min = serialize(0n),
    max = serialize(maxLTV);
  if (min > max) [min, max] = [max, min];

  return (
    <input
      type={type}
      value={round(serialize(targetLTV), precision)}
      min={round(min, precision)}
      max={round(max, precision)}
      step={10 ** -precision}
      onChange={(e) => setTargetLTV(deserialize(parseEther(e.target.value)))}
    />
  );
}

export function Controls(props: Props) {
  const { maxLTV, liquidationLTV } = props;

  const controls = [
    {
      label: "Leverage",
      precision: 2,
      serialize: (ltv: bigint) => ONE ** 2n / (ONE - ltv),
      deserialize: (leverage: bigint) => ONE - ONE ** 2n / leverage,
    },

    {
      label: "LTV",
      precision: 1,
      serialize: (ltv: bigint) => ltv * 100n,
      deserialize: (ltv: bigint) => ltv / 100n,
    },

    {
      label: "Health",
      precision: 4,
      serialize: (ltv: bigint) =>
        ltv !== 0n ? ((liquidationLTV ?? maxLTV ?? 0n) * ONE) / ltv : INFINITE,
      deserialize: (health: bigint) =>
        health !== INFINITE
          ? ((liquidationLTV ?? maxLTV ?? 0n) * ONE) / health
          : 0n,
    },
  ];

  return (
    <>
      {controls.map(({ label, ...params }) => (
        <div key={label}>
          <label>{label}:</label>{" "}
          <Control type="range" {...params} {...props} />
          <Control type="number" {...params} {...props} />
        </div>
      ))}
    </>
  );
}
