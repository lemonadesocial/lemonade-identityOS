import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { useEffect, useState } from "react";
import { WagmiProvider, createConfig, useAccount, useDisconnect, useSignMessage } from "wagmi";
import { createThirdwebClient, defineChain as thirdwebDefineChain } from "thirdweb";
import { mainnet } from "wagmi/chains";
import { inAppWalletConnector } from "@thirdweb-dev/wagmi-adapter";
import { ThirdwebProvider } from "thirdweb/react";

import { getUserWalletRequest } from "../../client/api";

const defaultConfig = getDefaultConfig({
  // Required API Keys
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
  // Required App Info
  appName: "lemonade.social",
});

const thirdwebClientId =
  process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "4e8c81182c3709ee441e30d776223354";
const unicornFactoryAddress =
  process.env.NEXT_PUBLIC_UNICORN_FACTORY_ADDRESS || "0xD771615c873ba5a2149D5312448cE01D677Ee48A";

// Create Thirdweb Client
const client = createThirdwebClient({
  clientId: thirdwebClientId,
});

// Create the Unicorn Wallet Connector (using Thirdweb In-App Wallet)
// Note: The chain specified here is for the smart account functionality as per Unicorn docs.
const unicornConnector = inAppWalletConnector({
  client,
  smartAccount: {
    sponsorGas: true, // or false based on your needs / Unicorn requirements
    chain: thirdwebDefineChain(mainnet.id),
    factoryAddress: unicornFactoryAddress,
  },
  metadata: {
    name: "Unicorn.eth",
    icon: "/unicorn.png",
    image: {
      src: "/unicorn.png",
      alt: "Unicorn.eth",
      height: 100,
      width: 100,
    },
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

export const useWalletPopup = (
  onLogin: (
    args: { signature: string; address: string; token: string },
    disconnect: () => void,
  ) => void,
) => {
  const account = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessage } = useSignMessage();

  const [signing, setSigning] = useState(false);
  const [signature, setSignature] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    console.log("Acc changed:", account);
  }, [account]);

  const sign = async () => {
    if (!account.address) {
      return;
    }

    setSignature("");

    //-- request payload from backend
    const data = await getUserWalletRequest(account.address);

    const message = data.message;
    setToken(data.token);

    signMessage(
      { message },
      {
        onSettled: () => {
          setSigning(false);
        },
        onSuccess: (signature) => {
          setSignature(signature);
        },
        onError: () => {
          if (account.isConnected) {
            disconnect();
          }
        },
      },
    );
  };

  useEffect(() => {
    if (signature && account.address && token) {
      onLogin({ signature, address: account.address, token }, disconnect);
    }
  }, [signature, account.address, token]);

  useEffect(() => {
    if (account.isDisconnected) {
      setSignature("");
    }
  }, [account.isDisconnected]);

  return { account, signing, signature, setSigning, sign };
};
