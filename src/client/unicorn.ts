import { useEffect, useState } from "react";
import { LoginFlow } from "@ory/client-fetch";

import { decodeAuthCookie } from "../common/unicorn";
import { frontendApi } from "../common/ory";

import { dummyWalletPassword, handlePasswordLogin, handlePasswordRegistration } from "./ory";

const handleAuthCookie = async (loginFlow: LoginFlow, wallet: string, cookie: string) => {
  const lowerCaseWallet = wallet.toLowerCase();

  //-- try login first because login is used more
  handlePasswordLogin(
    {
      flow: loginFlow,
      payload: {
        identifier: lowerCaseWallet,
        password: dummyWalletPassword,
        transient_payload: {
          unicorn_auth_cookie: cookie,
        },
      },
    },
    (errLoginFlow) => {
      console.log("errLoginFlow", errLoginFlow);

      //-- try register
      frontendApi.createBrowserRegistrationFlow().then((flow) => {
        handlePasswordRegistration({
          flow,
          payload: {
            password: dummyWalletPassword,
            traits: {
              unicorn_wallet: lowerCaseWallet,
            },
            transient_payload: {
              unicorn_auth_cookie: cookie,
            },
          },
        });
      });
    },
  );
};

export const useUnicornLoginHandle = (flow: LoginFlow) => {
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
      await handleAuthCookie(flow, walletAddress, cookie);
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
