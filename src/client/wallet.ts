import { LoginFlow, RegistrationFlow, SettingsFlow } from "@ory/client-fetch";

import { dummyWalletPassword } from "../common/ory";
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
    provider,
  }: {
    flow: RegistrationFlow;
    signature: string;
    address: string;
    token: string;
    provider?: "wallet" | "unicorn_contract_wallet";
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
          provider,
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
    provider,
  }: {
    flow: LoginFlow;
    signature: string;
    address: string;
    token: string;
    provider?: "wallet" | "unicorn_contract_wallet";
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
          provider,
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
