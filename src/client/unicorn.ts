import { LoginFlow, RegistrationFlow } from "@ory/client-fetch";
import assert from "assert";
import { useEffect, useState } from "react";

import { dummyWalletPassword } from "../common/ory";
import { EOAWalletPayload } from "../common/siwe";
import { getUnicornCanLink, linkUnicornWallet } from "./api";
import { handlePasswordLogin, handlePasswordRegistration } from "./ory";

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
) => {
  const [authCookie, setAuthCookie] = useState<string>();

  useEffect(() => {
    const params = new URL(flow.request_url).searchParams;
    const currentParams = new URLSearchParams(window.location.search);

    const authCookie = params.get("authCookie");
    const walletId = params.get("walletId");
    const consumed = currentParams.get("consumed");

    if (!consumed) {
      const newParams = new URLSearchParams(currentParams);
      newParams.set("consumed", "true");
      newParams.set("authCookie", authCookie || "");
      newParams.set("walletId", walletId || "");
      window.location.href = `${window.location.pathname}?${newParams.toString()}`;
    }
    else {
      setAuthCookie(walletId === 'inApp' ? authCookie || "" : "");
    }
  }, [flow.request_url]);

  return { authCookie };
};
