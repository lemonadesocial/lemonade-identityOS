import {
  LoginFlow,
  RegistrationFlow,
  SettingsFlow,
  SuccessfulNativeLogin,
  SuccessfulNativeRegistration,
  UiNodeInputAttributes,
  UpdateSettingsFlowBody,
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
  const verification = success.continue_with?.find(
    (action) => action.action === "show_verification_ui",
  );
  const redirect = success.continue_with?.find((action) => action.action === "redirect_browser_to");

  if (verification?.flow.url) {
    //-- prioritize verification over redirect
    const url = new URL(verification.flow.url);

    if (!url.searchParams.has("return_to")) {
      url.searchParams.set("return_to", window.location.href);
    }

    window.location.href = url.toString();
  } else if (redirect) {
    window.location.href = redirect.redirect_browser_to;
  }
}

//-- this password is not used to login, so it does not need to be secure
// -- the only requirement is that it needs to be more than 8 characters
function getPassword(address: string) {
  return address.split("").reverse().join("");
}

async function parseError(err: any) {
  const data = Buffer.from(await err.response.arrayBuffer());
  const errorJson = JSON.parse(data.toString("utf-8"));
  return errorJson;
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

async function handleSettingsFlowError(
  flow: SettingsFlow,
  err: any,
  onError?: (flow: SettingsFlow, err: unknown) => void,
) {
  if (err.response) {
    const error = await parseError(err);
    if (error.error) {
      //-- this is a normal ory error
      onError?.(flow, error);
    } else {
      //-- error here is the new flow
      onError?.(error, null);
    }
  } else {
    frontendApi
      .getSettingsFlow({ id: flow.id }, { credentials: "include" })
      .then((flow) => onError?.(flow, err));
  }
}

export async function handleProfileUpdate(
  {
    flow,
    data,
  }: {
    flow: SettingsFlow;
    data: UpdateSettingsFlowBody;
  },
  onError?: (flow: SettingsFlow, err: unknown) => void,
) {
  return frontendApi
    .updateSettingsFlow(
      {
        flow: flow.id,
        updateSettingsFlowBody: data,
      },
      { credentials: "include" },
    )
    .then((flow) => handleFlowSuccess(flow as SettingsFlow))
    .catch((err) => handleSettingsFlowError(flow, err, onError));
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
        //-- first we need to update the flow with the new wallet address
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
    .then((flow) =>
      //-- then we need to update the dummy password for this wallet address
      frontendApi.updateSettingsFlow(
        {
          flow: flow.id,
          updateSettingsFlowBody: {
            method: "password",
            password: getPassword(address),
            csrf_token: getCsrfToken(flow),
          },
        },
        { credentials: "include" },
      ),
    )
    .then((flow) => handleFlowSuccess(flow as SettingsFlow))
    .catch((err) => handleSettingsFlowError(flow, err, onError));
}

export async function handleUnlinkWallet(
  { flow }: { flow: SettingsFlow },
  onError?: (flow: SettingsFlow, err: unknown) => void,
) {
  const { wallet, ...traits } = flow.identity.traits;

  frontendApi
    .updateSettingsFlow(
      {
        flow: flow.id,
        updateSettingsFlowBody: {
          method: "profile",
          csrf_token: getCsrfToken(flow as SettingsFlow),
          traits,
        },
      },
      {
        credentials: "include",
      },
    )
    .then((flow) => {
      handleFlowSuccess(flow);
    })
    .catch((err) => handleSettingsFlowError(flow, err, onError));
}
