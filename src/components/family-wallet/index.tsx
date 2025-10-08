"use client";

import { LoginFlow, RegistrationFlow } from "@ory/client-fetch";
import { ConnectKitButton } from "connectkit";
import { useEffect, useState } from "react";

import { EOAWalletPayload } from "../../common/siwe";
import { decodeAuthCookie } from "../../common/unicorn";

import { useUnicornHandle } from "../../client/unicorn";
import { useWalletPopup } from "../../client/wallet";

import Spinner from "./spinner.svg";

//-- this style is copied from ory default social button theme
const buttonClassName =
  "gap-3 border border-button-social-border-default bg-button-social-background-default hover:bg-button-social-background-hover transition-colors rounded-buttons flex items-center justify-center px-4 py-[13px] loading:bg-button-social-background-disabled loading:border-button-social-border-disabled loading:text-button-social-foreground-disabled hover:text-button-social-foreground-hover";

interface Props<T extends LoginFlow | RegistrationFlow> {
  flow: T;
  onLogin: (
    args: { signature: string; address: string; token: string },
    disconnect: () => void,
  ) => void;
  unicornCookieHandler: (
    flow: T,
    wallet: string,
    cookie: string,
    siwe: EOAWalletPayload,
  ) => Promise<void>;
}
export default function FamilyWallet<T extends LoginFlow | RegistrationFlow>({
  flow,
  onLogin,
  unicornCookieHandler,
}: Props<T>) {
  const { authCookie } = useUnicornHandle(flow);
  const [walletInfo, setWalletInfo] = useState<{
    siwe: EOAWalletPayload;
    wallet: string;
    disconnect: () => void;
  }>();

  const { account, signing, signature, sign } = useWalletPopup((args, disconnect) => {
    setWalletInfo({
      siwe: { wallet_signature: args.signature, wallet_signature_token: args.token },
      wallet: args.address,
      disconnect,
    });
  });

  useEffect(() => {
    console.log("check to sign", { accountCOnnected: account.isConnected, signing, signature });
    if (account.isConnected && !signing && !signature) {
      //-- note: ARC browser will show two signature requests in case of metamask,
      //-- we can set timeout to the sign call if we want to support this browser
      console.log("sign here");
      sign();
    }
  }, [account.isConnected, signing, signature]);

  useEffect(() => {
    console.log("effet here", authCookie, walletInfo);
    if (authCookie !== undefined && walletInfo) {
      //-- if authCookie is empty then this is normal wallet connect
      if (!authCookie) {
        console.log("login here with wallet");
        onLogin(
          {
            signature: walletInfo.siwe.wallet_signature,
            address: walletInfo.wallet,
            token: walletInfo.siwe.wallet_signature_token,
          },
          walletInfo.disconnect,
        );

        return;
      }

      const { storedToken } = decodeAuthCookie(authCookie);
      const walletAddress = storedToken.authDetails.walletAddress?.toLowerCase();

      if (!walletAddress) {
        alert("This Unicorn wallet is not ready");

        return;
      }

      console.log("handle with unicorn", walletAddress, authCookie, walletInfo.siwe);

      unicornCookieHandler(flow, walletAddress, authCookie, walletInfo.siwe).catch((err) =>
        console.log(err),
      );
    }
  }, [authCookie, walletInfo]);

  const disabled = signing || !!signature;

  return (
    <ConnectKitButton.Custom>
      {({ show, isConnecting }) => {
        return (
          <button
            disabled={disabled}
            className={buttonClassName}
            onClick={(e) => {
              e.preventDefault();
              show?.();
            }}
          >
            {disabled || isConnecting ? <Spinner color={"#ffffff"} alt="loading" /> : "Wallet"}
          </button>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
