import {
  LoginFlow,
  RegistrationFlow,
  SettingsFlow,
  SuccessfulNativeLogin,
  SuccessfulNativeRegistration,
  UiNodeInputAttributes,
  UpdateLoginFlowWithPasswordMethod,
  UpdateRegistrationFlowWithPasswordMethod,
  UpdateSettingsFlowBody,
  UpdateSettingsFlowWithProfileMethod,
  VerificationFlow,
} from "@ory/client-fetch";

import { frontendApi } from "../common/ory";

export function getCsrfToken(
  flow: LoginFlow | RegistrationFlow | SettingsFlow | VerificationFlow,
): string | undefined {
  const csrfNode = flow.ui.nodes.find(
    (node) => "name" in node.attributes && node.attributes.name === "csrf_token",
  )?.attributes;

  return (csrfNode as UiNodeInputAttributes)?.value;
}

export function handleFlowSuccess(
  success: SuccessfulNativeRegistration | SuccessfulNativeLogin,
  forceRedirect?: string,
) {
  const verification = success.continue_with?.find(
    (action) => action.action === "show_verification_ui",
  );

  let redirectUrl = forceRedirect;

  if (!redirectUrl) {
    const redirect = success.continue_with?.find(
      (action) => action.action === "redirect_browser_to",
    );

    if (verification?.flow.url) {
      //-- prioritize verification over redirect
      const url = new URL(verification.flow.url);

      if (!url.searchParams.has("return_to")) {
        url.searchParams.set("return_to", window.location.href);
      }

      redirectUrl = url.toString();
    } else if (redirect) {
      redirectUrl = redirect.redirect_browser_to;
    }
  }

  if (redirectUrl) {
    window.location.href = redirectUrl;
  }
}

async function parseError(err: any) {
  const data = Buffer.from(await err.response.arrayBuffer());
  const errorJson = JSON.parse(data.toString("utf-8"));
  return errorJson;
}

export async function handlePasswordRegistration(
  {
    flow,
    payload,
  }: {
    flow: RegistrationFlow;
    payload: Pick<
      UpdateRegistrationFlowWithPasswordMethod,
      "traits" | "password" | "transient_payload"
    >;
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
          ...payload,
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

export async function handlePasswordLogin(
  {
    flow,
    payload,
  }: {
    flow: LoginFlow;
    payload: Pick<
      UpdateLoginFlowWithPasswordMethod,
      "identifier" | "password" | "transient_payload"
    >;
  },
  onError?: (flow: LoginFlow, err: unknown) => void,
  forceRedirect?: string,
) {
  return frontendApi
    .updateLoginFlow(
      {
        flow: flow.id,
        updateLoginFlowBody: {
          method: "password",
          csrf_token: getCsrfToken(flow),
          ...payload,
        },
      },
      { credentials: "include" },
    )
    .then((login) => {
      handleFlowSuccess(login, forceRedirect);
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

export async function handleUpdateFlowProfile(
  {
    flow,
    payload,
  }: {
    flow: SettingsFlow;
    payload: Pick<UpdateSettingsFlowWithProfileMethod, "traits" | "transient_payload">;
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
          ...payload,
        },
      },
      { credentials: "include" },
    )
    .then((flow) => handleFlowSuccess(flow as SettingsFlow))
    .catch((err) => handleSettingsFlowError(flow, err, onError));
}

export async function handleRemoveTraits(
  { flow, traits }: { flow: SettingsFlow; traits: string[] },
  onError?: (flow: SettingsFlow, err: unknown) => void,
) {
  const newTraits = Object.fromEntries(
    Object.entries(flow.identity.traits).filter(([key]) => !traits.includes(key)),
  );

  frontendApi
    .updateSettingsFlow(
      {
        flow: flow.id,
        updateSettingsFlowBody: {
          method: "profile",
          csrf_token: getCsrfToken(flow as SettingsFlow),
          traits: newTraits,
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
