import { LoginFlow, RegistrationFlow, SettingsFlow } from "@ory/client-fetch";

import {
  handlePasswordLogin,
  handlePasswordRegistration,
  handleRemoveTraits,
  handleUpdateFlowProfile,
} from "./ory";

export const dummyWalletPassword = "dummy-wallet-password";

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
