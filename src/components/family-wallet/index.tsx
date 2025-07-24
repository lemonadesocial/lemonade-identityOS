"use client";

import { LoginFlow, RegistrationFlow } from "@ory/client-fetch";
import { ConnectKitButton } from "connectkit";
import { useEffect } from "react";

import { useUnicornLoginHandle } from "../../client/unicorn";

import Spinner from "./spinner.svg";
import { useWalletPopup } from "./web3-provider";

//-- this style is copied from ory default social button theme
const buttonClassName =
  "gap-3 border border-button-social-border-default bg-button-social-background-default hover:bg-button-social-background-hover transition-colors rounded-buttons flex items-center justify-center px-4 py-[13px] loading:bg-button-social-background-disabled loading:border-button-social-border-disabled loading:text-button-social-foreground-disabled hover:text-button-social-foreground-hover";

interface Props {
  flow: LoginFlow | RegistrationFlow;
  onLogin: (
    args: { signature: string; address: string; token: string },
    disconnect: () => void,
  ) => void;
}
export default function FamilyWallet({ flow, onLogin }: Props) {
  const { account, signing, setSigning, signature, sign } = useWalletPopup(onLogin);
  const { processing } = useUnicornLoginHandle(flow);

  useEffect(() => {
    if (account.isConnected && !signing && !signature) {
      setSigning(true);

      //-- note: ARC browser will show two signature requests in case of metamask,
      //-- we can set timeout to the sign call if we want to support this browser
      sign();
    }
  }, [account.isConnected, signing, signature]);

  const disabled = processing || signing || !!signature;

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
