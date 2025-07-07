import { OryFlowComponentOverrides } from "@ory/elements-react";

import CardRoot from "../components/card-root";

export const overridedComponents: OryFlowComponentOverrides = {
  Card: {
    Root: CardRoot,
  },
};
