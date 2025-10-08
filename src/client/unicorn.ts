import { LoginFlow, RegistrationFlow } from "@ory/client-fetch";
import { useEffect, useState } from "react";

export const useUnicornHandle = <T extends LoginFlow | RegistrationFlow>(
  flow: T,
) => {
  const [isUnicorn, setIsUnicorn] = useState(false);

  useEffect(() => {
    const params = new URL(flow.request_url).searchParams;

    const authCookie = params.get("authCookie");
    const walletId = params.get("walletId");

    const currentParams = new URLSearchParams(window.location.search)

    if (authCookie && walletId === "inApp" && !currentParams.get("authCookie") && !currentParams.get("walletId")) {
      const newParams = new URLSearchParams(currentParams);
      newParams.set("authCookie", authCookie);
      newParams.set("walletId", walletId);
      window.location.href = `${window.location.pathname}?${newParams.toString()}`;
    }
    else {
      setIsUnicorn(true);
    }
  }, [flow.request_url]);

  return isUnicorn;
};
