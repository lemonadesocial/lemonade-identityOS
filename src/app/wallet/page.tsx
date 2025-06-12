import {
  getLoginFlow,
  getRegistrationFlow,
  getServerSession,
  OryPageParams,
} from "@ory/nextjs/app";
import { redirect } from "next/navigation";

import config from "../../../ory.config";

export default async function WalletPage(props: OryPageParams) {
  const [seachParams, session] = await Promise.all([props.searchParams, getServerSession()]);

  const { wallet, signature, message, token, type } = seachParams;

  console.log("wtf jere", wallet, signature, message, token, type);

  // if (!wallet || !signature || !message || !token || !type) {
  //   return null;
  // }

  console.log("seachParams", seachParams);

  const flow =
    type === "login"
      ? await getLoginFlow(config, seachParams)
      : await getRegistrationFlow(config, seachParams);

  console.log("flow here", flow);

  return null;
}
