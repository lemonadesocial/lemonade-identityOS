import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { useEffect, useState } from "react";
import { WagmiProvider, createConfig, useAccount, useDisconnect, useSignMessage } from "wagmi";

import { getUserWalletRequest } from "../../client/api";

const config = createConfig(
  getDefaultConfig({
    // Required API Keys
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
    // Required App Info
    appName: "lemonade.social",
  }),
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
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
