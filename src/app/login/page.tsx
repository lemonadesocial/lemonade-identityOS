import { getLoginFlow, OryPageParams } from "@ory/nextjs/app";

import config from "../../../ory.config";

import LoginUI from "./ui";

export default async function LoginPage(props: OryPageParams) {
  const flow = await getLoginFlow(config, props.searchParams);

  if (!flow) {
    return null;
  }

  let provider: string | undefined;

  if (flow.oauth2_login_request) {
    //-- this is oauth2 login request, check if there is default provider selected
    const url = new URL(flow.oauth2_login_request.request_url);

    provider = url.searchParams.get("provider") ?? undefined;
  }

  return <LoginUI flow={flow} config={config} provider={provider} />;
}
