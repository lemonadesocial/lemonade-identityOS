import {
  LoginFlow,
  RegistrationFlow,
  SettingsFlow,
  SuccessfulNativeLogin,
  SuccessfulNativeRegistration,
  UiNodeInputAttributes,
} from "@ory/client-fetch";

import { frontendApi } from "../common/ory";

export function getCsrfToken(
  flow: LoginFlow | RegistrationFlow | SettingsFlow,
): string | undefined {
  const csrfNode = flow.ui.nodes.find(
    (node) => "name" in node.attributes && node.attributes.name === "csrf_token",
  )?.attributes;

  return (csrfNode as UiNodeInputAttributes)?.value;
}

export function handleFlowSuccess(success: SuccessfulNativeRegistration | SuccessfulNativeLogin) {
  const redirect = success.continue_with?.find((action) => action.action === "redirect_browser_to");

  if (redirect) {
    window.location.href = redirect.redirect_browser_to;
  }
}

//-- this password is not used to login, so it does not need to be secure
// -- the only requirement is that it needs to be more than 8 characters
function getPassword(address: string) {
  return address.split("").reverse().join("");
}

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
  return frontendApi
    .updateRegistrationFlow(
      {
        flow: flow.id,
        updateRegistrationFlowBody: {
          method: "password",
          csrf_token: getCsrfToken(flow),
          password: getPassword(address),
          traits: {
            wallet: address,
          },
          transient_payload: {
            wallet_signature: signature,
            wallet_signature_token: token,
          },
        },
      },
      { credentials: "include" },
    )
    .then((registration) => {
      handleFlowSuccess(registration);
    })
    .catch((error) => {
      frontendApi
        .getRegistrationFlow({ id: flow.id }, { credentials: "include" })
        .then((flow) => onError?.(flow, error));
    });
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
  return frontendApi
    .updateLoginFlow(
      {
        flow: flow.id,
        updateLoginFlowBody: {
          method: "password",
          csrf_token: getCsrfToken(flow),
          password: getPassword(address),
          identifier: address,
          transient_payload: {
            wallet_signature: signature,
            wallet_signature_token: token,
          },
        },
      },
      { credentials: "include" },
    )
    .then((login) => {
      handleFlowSuccess(login);
    })
    .catch((err) => {
      frontendApi
        .getLoginFlow({ id: flow.id }, { credentials: "include" })
        .then((flow) => onError?.(flow, err));
    });
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
  return frontendApi
    .updateSettingsFlow(
      {
        flow: flow.id,
        updateSettingsFlowBody: {
          method: "profile",
          csrf_token: getCsrfToken(flow),
          traits: {
            ...flow.identity.traits,
            wallet: address,
          },
          transient_payload: {
            wallet_signature: signature,
            wallet_signature_token: token,
          },
        },
      },
      { credentials: "include" },
    )
    .then((login) => {
      handleFlowSuccess(login);
    })
    .catch((err) => {
      frontendApi
        .getSettingsFlow({ id: flow.id }, { credentials: "include" })
        .then((flow) => onError?.(flow, err));
    });
}

export async function handleUnlinkWallet({ flow }: { flow: SettingsFlow }) {
  await frontendApi.updateSettingsFlow(
    {
      flow: flow.id,
      updateSettingsFlowBody: {
        method: "profile",
        csrf_token: getCsrfToken(flow as SettingsFlow),
        traits: {
          ...flow.identity.traits,
          wallet: null,
        },
      },
    },
    {
      credentials: "include",
    },
  );

  const updatedFlow = await frontendApi.getSettingsFlow(
    {
      id: flow.id,
    },
    {
      credentials: "include",
    },
  );

  return updatedFlow;
}
