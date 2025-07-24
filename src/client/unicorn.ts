import { useEffect, useState } from "react";
import { LoginFlow } from "@ory/client-fetch";

import { AuthCookie, decodeAuthCookie } from "../common/unicorn";

export const useUnicornLoginHandle = (flow: LoginFlow) => {
  const [processing, setProcessing] = useState(false);

  const processAuthCookie = async (authCookie: AuthCookie) => {
    const walletAddress = authCookie.storedToken.authDetails.walletAddress;
    const email = authCookie.storedToken.authDetails.email;

    if (!walletAddress) {
      alert("This account is not ready to use");

      return;
    }

    try {
      setProcessing(true);
      console.log("authCookie", authCookie);
      //-- try login with wallet address
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    const params = new URL(flow.request_url).searchParams;

    const authCookie = params.get("authCookie");

    if (authCookie) {
      const decoded = decodeAuthCookie(authCookie);
      if (decoded.storedToken.authDetails.walletAddress) {
        processAuthCookie(decoded);
      }
    }
  }, [flow.request_url]);

  return { processing };
};
