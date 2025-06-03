import { getVerificationFlow, OryPageParams } from "@ory/nextjs/app";

import config from "../../../ory.config";

import VerificationUI from "./ui";

export default async function VerificationPage(props: OryPageParams) {
  const flow = await getVerificationFlow(config, props.searchParams);

  if (!flow) {
    return null;
  }

  return <VerificationUI flow={flow} config={config} />;
}
