"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { WagmiProvider, createConfig } from "wagmi";
import { inAppWalletConnector } from "@thirdweb-dev/wagmi-adapter";
import { ThirdwebProvider } from "thirdweb/react";

import { client, chain } from "../../common/thirdweb";

const defaultConfig = getDefaultConfig({
  // Required API Keys
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
  // Required App Info
  appName: "lemonade.social",
});

const unicornFactoryAddress =
  process.env.NEXT_PUBLIC_UNICORN_FACTORY_ADDRESS || "0xD771615c873ba5a2149D5312448cE01D677Ee48A";

// Create the Unicorn Wallet Connector (using Thirdweb In-App Wallet)
// Note: The chain specified here is for the smart account functionality as per Unicorn docs.
const unicornConnector = inAppWalletConnector({
  client,
  smartAccount: {
    sponsorGas: true, // or false based on your needs / Unicorn requirements
    chain,
    factoryAddress: unicornFactoryAddress,
  },
  metadata: {
    name: "Unicorn.eth",
  },
});

defaultConfig.connectors = [unicornConnector, ...(defaultConfig.connectors || [])];

const config = createConfig(defaultConfig);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <ThirdwebProvider>
        <QueryClientProvider client={queryClient}>
          <ConnectKitProvider>{children}</ConnectKitProvider>
        </QueryClientProvider>
      </ThirdwebProvider>
    </WagmiProvider>
  );
};
