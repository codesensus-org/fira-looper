import { MarketId, registerCustomAddresses } from "@morpho-org/blue-sdk";
import { fetchAccrualPosition } from "@morpho-org/blue-sdk-viem";
import { useQuery } from "@tanstack/react-query";
import { Address, Hash, maxUint256, zeroAddress } from "viem";
import { useWalletClient } from "wagmi";
import { GENERAL_ADAPTER_1 } from "../utils/adapters/general";
import { BUNDLER } from "../utils/adapters/bundler";
import { FIRA } from "../utils/actions/authorize";

const MOCK_FIRA_CHAIN_ID = -1;

registerCustomAddresses({
  addresses: {
    [MOCK_FIRA_CHAIN_ID]: {
      morpho: FIRA,
      bundler3: {
        bundler3: BUNDLER,
        generalAdapter1: GENERAL_ADAPTER_1,
      },
      adaptiveCurveIrm: zeroAddress,
    },
  },
  deployments: {
    [MOCK_FIRA_CHAIN_ID]: {
      morpho: 23_890_785n,
      bundler3: {
        bundler3: 21_643_807n,
        generalAdapter1: 21_872_136n,
      },
      adaptiveCurveIrm: maxUint256,
    },
  },
});

export function useAccrualPosition(user?: Address, marketId?: Hash) {
  const { data: client } = useWalletClient();

  const enabled =
    user !== undefined && marketId !== undefined && client !== undefined;

  return useQuery({
    queryKey: ["fetchAccrualPosition", user, marketId, client],
    async queryFn() {
      if (!enabled) return undefined;
      try {
        return await fetchAccrualPosition(user, marketId as MarketId, client, {
          chainId: MOCK_FIRA_CHAIN_ID,
        });
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
    enabled,
  });
}
