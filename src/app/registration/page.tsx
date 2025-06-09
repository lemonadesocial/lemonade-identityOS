import { getRegistrationFlow, OryPageParams } from "@ory/nextjs/app";
import { UiNodeInputAttributes } from "@ory/client-fetch";

import config from "../../../ory.config";

import RegistrationUI from "./ui";

export default async function RegistrationPage(props: OryPageParams) {
  const flow = await getRegistrationFlow(config, props.searchParams);

  if (!flow) {
    return null;
  }

  //-- hide firstname / lastname inputs
  const updatedFlow = {
    ...flow,
    ui: {
      ...flow.ui,
      nodes: flow.ui.nodes.filter(
        (node) =>
          !["traits.first_name", "traits.last_name"].includes(
            (node.attributes as UiNodeInputAttributes).name,
          ),
      ),
    },
  };

  return <RegistrationUI flow={updatedFlow} config={config} />;
}
