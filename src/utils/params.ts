import { Address, parseEther } from "viem";

export interface MarketParams {
  loanToken: Address;
  collateralToken: Address;
  oracle: Address;
  irm: Address;
  ltv: bigint;
  lltv: bigint;
  whitelist: Address;
}

// TODO: Fetch on-chain
export const MARKET_PARAMS: MarketParams = {
  loanToken: "0x73A15FeD60Bf67631dC6cd7Bc5B6e8da8190aCF5",
  collateralToken: "0x35D8949372D46B7a3D5A56006AE77B215fc69bC0",
  oracle: "0x30Da78355FcEA04D1fa34AF3c318BE203C6F2145",
  irm: "0xdfCF197B0B65066183b04B88d50ACDC0C4b01385",
  ltv: parseEther("0.88"),
  lltv: parseEther("0.9999"),
  whitelist: "0xFE7C47895eDb12a990b311Df33B90Cfea1D44c24",
};

export const MARKET_ID =
  "0xa597b5a36f6cc0ede718ba58b2e23f5c747da810bf8e299022d88123ab03340e" as const;
