import { getLoginFlow, OryPageParams } from "@ory/nextjs/app";

import config from "../../../ory.config";

import LoginUI from "./ui";

export default async function LoginPage(props: OryPageParams) {
  const flow = await getLoginFlow(config, props.searchParams);

  if (!flow) {
    return null;
  }

  return <LoginUI flow={flow} config={config} />;
}
