import { LoginFlowContextProps } from "@ory/elements-react/theme";

import CardHeader from "../components/card-header";
import CardRoot from "../components/card-root";

export const overridedComponents: LoginFlowContextProps["components"] = {
  Card: {
    Root: CardRoot,
    Header: CardHeader,
  },
  Node: {},
};
