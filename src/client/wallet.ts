import { LoginFlow, RegistrationFlow, SettingsFlow } from "@ory/client-fetch";
import { useEffect, useState } from "react";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";

import { dummyWalletPassword } from "../common/ory";
import { getUserWalletRequest } from "./api";
import {
  handlePasswordLogin,
  handlePasswordRegistration,
  handleRemoveTraits,
  handleUpdateFlowProfile,
} from "./ory";

export async function handleWalletRegistration(
  {
    flow,
    signature,
    address,
    token,
  }: {
    flow: RegistrationFlow;
    signature: string;
    address: string;
    token: string;
  },
  onError?: (flow: RegistrationFlow, err: unknown) => void,
) {
  const lowerCaseAddress = address.toLowerCase();

  return handlePasswordRegistration(
    {
      flow,
      payload: {
        password: dummyWalletPassword,
        traits: {
          wallet: lowerCaseAddress,
        },
        transient_payload: {
          wallet_signature: signature,
          wallet_signature_token: token,
        },
      },
    },
    onError,
  );
}

export async function handleWalletLogin(
  {
    flow,
    signature,
    address,
    token,
  }: {
    flow: LoginFlow;
    signature: string;
    address: string;
    token: string;
  },
  onError?: (flow: LoginFlow, err: unknown) => void,
) {
  const lowerCaseAddress = address.toLowerCase();

  return handlePasswordLogin(
    {
      flow,
      payload: {
        identifier: lowerCaseAddress,
        password: dummyWalletPassword,
        transient_payload: {
          wallet_signature: signature,
          wallet_signature_token: token,
        },
      },
    },
    onError,
  );
}

export async function handleWalletUpdate(
  {
    flow,
    signature,
    address,
    token,
  }: {
    flow: SettingsFlow;
    signature: string;
    address: string;
    token: string;
  },
  onError?: (flow: SettingsFlow, err: unknown) => void,
) {
  const lowerCaseAddress = address.toLowerCase();

  return handleUpdateFlowProfile(
    {
      flow,
      payload: {
        traits: {
          ...flow.identity.traits,
          wallet: lowerCaseAddress,
        },
        transient_payload: {
          wallet_signature: signature,
          wallet_signature_token: token,
        },
      },
    },
    onError,
  );
}

export async function handleUnlinkWallet(
  { flow }: { flow: SettingsFlow },
  onError?: (flow: SettingsFlow, err: unknown) => void,
) {
  return handleRemoveTraits({ flow, traits: ["wallet"] }, onError);
}

export const useWalletPopup = (
  onLogin: (
    args: { signature: string; address: string; token: string },
    disconnect: () => void,
  ) => void,
) => {
  const account = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessage } = useSignMessage();

  const [signing, setSigning] = useState(false);
  const [signature, setSignature] = useState("");
  const [token, setToken] = useState("");

  const sign = async () => {
    if (!account.address) {
      return;
    }

    setSigning(true);
    setSignature("");

    //-- request payload from backend
    const data = await getUserWalletRequest(account.address);

    const message = data.message;
    setToken(data.token);

    signMessage(
      { message },
      {
        onSettled: () => {
          setSigning(false);
        },
        onSuccess: (signature) => {
          setSignature(signature);
        },
        onError: () => {
          if (account.isConnected) {
            disconnect();
          }
        },
      },
    );
  };

  useEffect(() => {
    if (signature && account.address && token) {
      onLogin({ signature, address: account.address, token }, disconnect);
    }
  }, [signature, account.address, token]);

  useEffect(() => {
    if (account.isDisconnected) {
      setSignature("");
    }
  }, [account.isDisconnected]);

  return { account, signing, signature, sign };
};
