import { SessionProvider } from "@ory/elements-react/client";
import { getSettingsFlow, OryPageParams } from "@ory/nextjs/app";

import config from "../../../ory.config";

import SettingsUI from "./ui";

export default async function SettingsPage(props: OryPageParams) {
  const flow = await getSettingsFlow(config, props.searchParams);

  if (!flow) {
    return null;
  }

  return (
    <SessionProvider>
      <SettingsUI flow={flow} config={config} />
    </SessionProvider>
  );
}
