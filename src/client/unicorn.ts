import { useEffect, useState } from "react";
import { LoginFlow, RegistrationFlow } from "@ory/client-fetch";

import { decodeAuthCookie } from "../common/unicorn";

import { dummyWalletPassword, handlePasswordLogin, handlePasswordRegistration } from "./ory";

export const handleUnicornLogin = async (flow: LoginFlow, wallet: string, cookie: string) => {
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
      const requestUrl = new URL(flow.request_url);

      const url = new URL(`${window.location.origin}/registration`);

      //-- copy all params from the request url to the new url
      requestUrl.searchParams.forEach((value, key) => {
        url.searchParams.set(key, value);
      });

      window.location.href = url.toString();
    },
  );
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
      alert("This account is not ready to use");

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

    const authCookie = params.get("authCookie");

    if (authCookie) {
      processAuthCookie(authCookie);
    }
  }, [flow.request_url]);

  return { processing };
};
