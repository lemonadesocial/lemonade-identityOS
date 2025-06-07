import { getLoginFlow, getServerSession, OryPageParams } from "@ory/nextjs/app";

import config from "../../../ory.config";

import ConsentUI from "./ui";

export default async function ConsentPage(props: OryPageParams) {
  const [flow, session] = await Promise.all([
    getLoginFlow(config, props.searchParams),
    getServerSession(),
  ]);

  if (!session || !flow) {
    return null;
  }

  return <ConsentUI config={config} flow={flow} session={session} />;
}
