"use client";

import { OryNodeOidcButtonProps } from "@ory/elements-react";
import { LoginFlow, UiNode, UiNodeInputAttributes } from "@ory/client-fetch";
import { DefaultButtonSocial, Login } from "@ory/elements-react/theme";

import { type PageProps } from "../../common/types";
import { overridedComponents } from "../../common/ui";
import CardWrapper from "../../components/card-wrapper";
import FamilyWallet from "../../components/family-wallet";
import Page from "../../components/page";

function OidcButton(props: OryNodeOidcButtonProps) {
  const { value } = props.attributes;

  if (value === "family_wallet") {
    return <FamilyWallet />;
  }

  return <DefaultButtonSocial {...props} />;
}

function nodeSortValue(node: UiNode) {
  const attributes = node.attributes as UiNodeInputAttributes;
  return attributes.value === "family_wallet" ? "" : attributes.value.toString() || "";
}

interface Props extends PageProps {
  flow: LoginFlow;
}
export default function LoginUI({ flow, config }: Props) {
  const oidcNodes = flow.ui.nodes
    .filter((node) => node.group === "oidc")
    .sort((node1, node2) => nodeSortValue(node2).localeCompare(nodeSortValue(node1)));

  const updatedFlow = {
    ...flow,
    ui: {
      ...flow.ui,
      nodes: flow.ui.nodes.filter((node) => node.group !== "oidc").concat(oidcNodes),
    },
  };

  return (
    <Page>
      <CardWrapper>
        <Login
          flow={updatedFlow}
          config={config}
          components={{
            ...overridedComponents,
            Node: {
              OidcButton,
            },
          }}
        />
      </CardWrapper>
    </Page>
  );
}
