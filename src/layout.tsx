import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, injected, WagmiProvider } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import "./App.css";
import React from "react";

const config = createConfig({
  chains: [mainnet, base],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(import.meta.env.VITE_MAINNET_RPC_URL),
    [base.id]: http(import.meta.env.VITE_BASE_RPC_URL),
  },
});

const queryClient = new QueryClient();

export function Layout({ children }: React.PropsWithChildren) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
