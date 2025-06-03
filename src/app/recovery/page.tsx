import { getRecoveryFlow, OryPageParams } from "@ory/nextjs/app";

import config from "../../../ory.config";

import RecoveryUI from "./ui";

export default async function RecoveryPage(props: OryPageParams) {
  const flow = await getRecoveryFlow(config, props.searchParams);

  if (!flow) {
    return null;
  }

  return <RecoveryUI flow={flow} config={config} />;
}
