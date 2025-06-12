"use client";

import { RegistrationFlow, UiNode, UiNodeInputAttributes } from "@ory/client-fetch";
import { OryNodeOidcButtonProps } from "@ory/elements-react";
import { DefaultButtonSocial, Registration } from "@ory/elements-react/theme";
import { useSearchParams } from "next/navigation";

import { getCsrfToken } from "../../helpers/ory";

import { frontendApi } from "../../common/ory";
import { PageProps } from "../../common/types";
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

          const flowId = params.get("flow")?.toString();

          if (!flowId) {
            return;
          }

          frontendApi
            .getRegistrationFlow(
              {
                id: flowId,
              },
              { credentials: "include" },
            )
            .then((flow) => {
              frontendApi
                .updateRegistrationFlow(
                  {
                    flow: flow.id,
                    updateRegistrationFlowBody: {
                      method: "password",
                      csrf_token: getCsrfToken(flow),
                      password: "",
                      traits: {
                        wallet: args.address,
                        wallet_signature: args.signature,
                        wallet_signature_token: args.token,
                      },
                    },
                  },
                  { credentials: "include" },
                )
                .then((success) => {
                  console.log("success", success);
                })
                .catch((error) => {
                  console.log("error", error);
                });
            });
          // params.set("type", "registration");
          // params.set("wallet", args.address);
          // params.set("signature", args.signature);
          // params.set("message", args.message);
          // params.set("token", args.token);

          // window.location.href = `/wallet?${params.toString()}`;
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
  flow: RegistrationFlow;
}
export default function RegistrationUI({ flow, config }: Props) {
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
          <div className="page-title" style={{ alignSelf: "flex-start" }}>
            {"Sign up"}
          </div>
          <Registration
            components={{
              ...overridedComponents,
              Node: {
                ...overridedComponents?.Node,
                OidcButton,
              },
            }}
            flow={updatedFlow}
            config={config}
          />
        </CardWrapper>
      </Page>
    </Web3Provider>
  );
}
