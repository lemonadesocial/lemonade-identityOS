import { LoginFlow, RegistrationFlow } from "@ory/client-fetch";
import assert from "assert";
import { useEffect, useState } from "react";

import { decodeAuthCookie } from "../common/unicorn";

import { dummyWalletPassword } from "../common/ory";
import { EOAWalletPayload } from "../common/siwe";
import { getUnicornCanLink, linkUnicornWallet } from "./api";
import { handlePasswordLogin, handlePasswordRegistration } from "./ory";
import { useWalletPopup } from "./wallet";

async function prompt(message: string) {
  return window.confirm(message);
}

const handleLogin = (flow: LoginFlow, wallet: string, cookie: string, siwe?: EOAWalletPayload) => {
  handlePasswordLogin(
    {
      flow,
      payload: {
        identifier: wallet.toLowerCase(),
        password: dummyWalletPassword,
        transient_payload: {
          unicorn_auth_cookie: cookie,
          siwe,
        },
      },
    },
    () => {
      //-- login failed, redirect to registration
      const requestUrl = new URL(flow.request_url);

      const url = new URL(`${window.location.origin}/registration?return_to=${process.env.NEXT_PUBLIC_LEMONADE_APP_URL}`);

      //-- copy all params from the request url to the new url
      requestUrl.searchParams.forEach((value, key) => {
        url.searchParams.set(key, value);
      });

      window.location.href = url.toString();
    },
    process.env.NEXT_PUBLIC_LEMONADE_APP_URL
  );
};

export const handleUnicornLogin = async (flow: LoginFlow, wallet: string, cookie: string, siwe: EOAWalletPayload) => {
  //-- check if the wallet is linkable
  const response = await getUnicornCanLink(cookie);

  if (response.canLink) {
    const identifier = response.email || response.wallet;

    assert.ok(identifier, "No identifier is returned");

    const accept = await prompt(
      `Existing account found with the same credential ${identifier}. Do you want to link your Unicorn wallet to this account?`,
    );

    if (accept) {
      //-- perform link
      await linkUnicornWallet(identifier, cookie, siwe);
    }
  }

  //-- perform login anyway
  handleLogin(flow, wallet, cookie, siwe);
};

export const handleUnicornRegistration = async (
  flow: RegistrationFlow,
  wallet: string,
  cookie: string,
  siwe: EOAWalletPayload,
) => {
  //-- try login first because login is used more
  handlePasswordRegistration(
    {
      flow,
      payload: {
        password: dummyWalletPassword,
        traits: {
          unicorn_wallet: wallet.toLowerCase(),
        },
        transient_payload: {
          unicorn_auth_cookie: cookie,
          siwe,
        },
      },
    },
    (flow) => {
      alert("Failed to register using Unicorn wallet");
      console.log(flow);
    },
  );
};

export const useUnicornHandle = <T extends LoginFlow | RegistrationFlow>(
  flow: T,
  unicornCookieHandler: (flow: T, wallet: string, cookie: string, siwe: EOAWalletPayload) => Promise<void>,
) => {
  const [processing, setProcessing] = useState(false);
  const [authCookie, setAuthCookie] = useState<string>();
  const [siwe, setSiwe] = useState<EOAWalletPayload>();

  const { signing } = useWalletPopup((args) => setSiwe({
    wallet_signature: args.signature,
    wallet_signature_token: args.token,
  }));

  const process = async (cookie: string, siwe: EOAWalletPayload) => {
    try {
      setProcessing(true);

      const authCookie = decodeAuthCookie(cookie);

      const walletAddress = authCookie.storedToken.authDetails.walletAddress;

      if (!walletAddress) {
        alert("This Unicorn wallet is not ready");

        return;
      }

      await unicornCookieHandler(flow, walletAddress, cookie, siwe);
    }
    finally {
      setProcessing(false);
    }
  }

  useEffect(() => {
    if (authCookie && siwe) {
      process(authCookie, siwe);
    }
  }, [authCookie, siwe]);

  useEffect(() => {
    const params = new URL(flow.request_url).searchParams;

    const authCookie = params.get("authCookie");
    const walletId = params.get("walletId");

    const currentParams = new URLSearchParams(window.location.search);

    if (authCookie && walletId && !currentParams.get("authCookie") && !currentParams.get("walletId")) {
      const newParams = new URLSearchParams(currentParams);

      newParams.set("authCookie", authCookie);
      newParams.set("walletId", walletId);

      window.location.href = `${window.location.pathname}?${newParams.toString()}`;
    }

    if (authCookie) {
      setAuthCookie(authCookie);
    }
  }, [flow.request_url]);

  return { processing: processing || signing };
};
