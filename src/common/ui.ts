import { LoginFlowContextProps } from "@ory/elements-react/theme";

import CardHeader from "../components/card-header";
import CardRoot from "../components/card-root";
import OidcButton from "../components/oidc-button";

export const overridedComponents: LoginFlowContextProps["components"] = {
  Card: {
    Root: CardRoot,
    Header: CardHeader,
  },
  Node: {
    OidcButton,
  },
};
