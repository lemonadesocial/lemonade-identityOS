"use client";

import { LoginFlow, UiNode, UiNodeInputAttributes } from "@ory/client-fetch";
import { OryNodeOidcButtonProps } from "@ory/elements-react";
import { DefaultButtonSocial, Login } from "@ory/elements-react/theme";
import { useSearchParams } from "next/navigation";

import { type PageProps } from "../../common/types";
import { overridedComponents } from "../../common/ui";
import CardWrapper from "../../components/card-wrapper";
import FamilyWallet from "../../components/family-wallet";
import { Web3Provider } from "../../components/family-wallet/web3-provider";
import Page from "../../components/page";

function OidcButton(props: OryNodeOidcButtonProps) {
  const searchParams = useSearchParams();

  const { value } = props.attributes;

  if (value === "family_wallet") {
    return (
      <FamilyWallet
        onLogin={(args) => {
          //-- push these params to the wallet page and redirect there
          const params = new URLSearchParams(searchParams);

          params.set("type", "login");
          params.set("wallet", args.address);
          params.set("signature", args.signature);
          params.set("message", args.message);
          params.set("token", "");

          window.location.href = `/wallet?${params.toString()}`;
        }}
      />
    );
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
    <Web3Provider>
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
    </Web3Provider>
  );
}
