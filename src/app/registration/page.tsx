import { getRegistrationFlow, OryPageParams } from "@ory/nextjs/app";

import config from "../../../ory.config";

import RegistrationUI from "./ui";

export default async function RegistrationPage(props: OryPageParams) {
  const flow = await getRegistrationFlow(config, props.searchParams);

  if (!flow) {
    return null;
  }

  return <RegistrationUI flow={flow} config={config} />;
}
