"use client";

import { ConnectKitButton } from "connectkit";
import { useEffect } from "react";
import { useAccount } from "wagmi";

import Icon from "./icon.svg";

const buttonClassName =
  "gap-3 border border-button-social-border-default bg-button-social-background-default hover:bg-button-social-background-hover transition-colors rounded-buttons flex items-center justify-center px-4 py-[13px] loading:bg-button-social-background-disabled loading:border-button-social-border-disabled loading:text-button-social-foreground-disabled hover:text-button-social-foreground-hover";

export default function FamilyWallet() {
  const account = useAccount();

  useEffect(() => {
    console.log({ account });
  }, [account]);

  return (
    <ConnectKitButton.Custom>
      {({ show, isConnected }) => {
        return (
          <button className={buttonClassName} onClick={show}>
            {isConnected ? "connected" : <Icon color={"#ffffff"} height={20} alt="family-wallet" />}
          </button>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
