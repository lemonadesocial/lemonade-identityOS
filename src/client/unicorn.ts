import { LoginFlow, RegistrationFlow } from "@ory/client-fetch";
import assert from "assert";
import { useEffect, useState } from "react";

import { decodeAuthCookie } from "../common/unicorn";

import { dummyWalletPassword } from "../common/ory";
import { getUnicornCanLink, linkUnicornWallet } from "./api";
import { handlePasswordLogin, handlePasswordRegistration } from "./ory";

async function prompt(message: string) {
  return window.confirm(message);
}

const handleLogin = (flow: LoginFlow, wallet: string, cookie: string) => {
  handlePasswordLogin(
    {
      flow,
      payload: {
        identifier: wallet.toLowerCase(),
        password: dummyWalletPassword,
        transient_payload: {
          unicorn_auth_cookie: cookie,
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

export const handleUnicornLogin = async (flow: LoginFlow, wallet: string, cookie: string) => {
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
      await linkUnicornWallet(identifier, cookie);
    }
  }

  //-- perform login anyway
  handleLogin(flow, wallet, cookie);
};

export const handleUnicornRegistration = async (
  flow: RegistrationFlow,
  wallet: string,
  cookie: string,
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
  unicornCookieHandler: (flow: T, wallet: string, cookie: string) => Promise<void>,
) => {
  const [processing, setProcessing] = useState(false);

  const processAuthCookie = async (cookie: string) => {
    const authCookie = decodeAuthCookie(cookie);

    const walletAddress = authCookie.storedToken.authDetails.walletAddress;

    if (!walletAddress) {
      alert("This Unicorn wallet is not ready");

      return;
    }

    try {
      setProcessing(true);
      await unicornCookieHandler(flow, walletAddress, cookie);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    const params = new URL(flow.request_url).searchParams;

    let authCookie = params.get("authCookie");

    if (!authCookie) {
      authCookie = new URLSearchParams(window.location.search).get("authCookie");
    }

    if (authCookie) {
      processAuthCookie(authCookie);
    }
  }, [flow.request_url]);

  return { processing };
};
