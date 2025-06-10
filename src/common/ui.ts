import { LoginFlowContextProps } from "@ory/elements-react/theme";

import CardRoot from "../components/card-root";

export const overridedComponents: LoginFlowContextProps["components"] = {
  Card: {
    Root: CardRoot,
  },
};
