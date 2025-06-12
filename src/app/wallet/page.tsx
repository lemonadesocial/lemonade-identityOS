import {
  getLoginFlow,
  getRegistrationFlow,
  getServerSession,
  OryPageParams,
} from "@ory/nextjs/app";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";

import config from "../../../ory.config";

import { getCsrfToken } from "../../helpers/ory";

import { frontendApi } from "../../common/ory";

export default async function WalletPage(props: OryPageParams) {
  const [seachParams, session] = await Promise.all([props.searchParams, getServerSession()]);

  const { wallet, signature, message, token, type } = seachParams;

  console.log("seachParams", wallet, signature, message, token, type, session);

  if (type === "login") {
    const flow = await getLoginFlow(config, seachParams);
  } else if (type === "registration") {
    const flow = await getRegistrationFlow(config, seachParams);

    console.log("no flow??", flow);

    if (!flow) {
      return null;
    }

    console.log("flow here", flow);
    console.log("session here", session);

    try {
      const updateRegistrationFlowBody = {
        method: "password" as const,
        password: "vinamilk",
        csrf_token: getCsrfToken(flow),
        traits: {
          email: `${randomUUID()}@yopmail.com`,
          // wallet,
          // wallet_message: message,
          // wallet_token: token,
          // wallet_signature: signature,
        },
      };

      console.log("updateRegistrationFlowBody", updateRegistrationFlowBody);

      const response = await frontendApi.updateRegistrationFlow({
        flow: flow.id,
        updateRegistrationFlowBody,
      });

      console.log("response", response);

      if (response.continue_with?.[0]?.action) {
        redirect(response.continue_with?.[0]?.action);
      }
    } catch (e) {
      console.log("error", e);
    }
  }

  return null;
}
