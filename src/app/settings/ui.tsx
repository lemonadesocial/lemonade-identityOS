"use client";

import { FlowType, SettingsFlow, UiNode } from "@ory/client-fetch";
import { OrySettingsOidcProps, useOryFlow } from "@ory/elements-react";
import { getOryComponents, Settings } from "@ory/elements-react/theme";
import { useRef } from "react";

import { getCsrfToken } from "../../client/ory";
import { overridedComponents } from "../../client/ui";

import { frontendApi } from "../../common/ory";
import { type PageProps } from "../../common/types";
import Page from "../../components/page";

function OidcSettings(props: OrySettingsOidcProps) {
  const components = useRef(getOryComponents()).current;
  const { flow, setFlowContainer } = useOryFlow();

  if (!flow) return null;

  const hasWallet = !!(flow as SettingsFlow).identity.traits.wallet;

  const handleLinkWallet = async () => {
    console.log("link wallet");
  };

  const handleUnlinkWallet = async () => {
    await frontendApi.updateSettingsFlow(
      {
        flow: flow.id,
        updateSettingsFlowBody: {
          method: "profile",
          csrf_token: getCsrfToken(flow as SettingsFlow),
          traits: {
            wallet: null,
          },
        },
      },
      {
        credentials: "include",
      },
    );

    const updatedFlow = await frontendApi.getSettingsFlow(
      {
        id: flow.id,
      },
      {
        credentials: "include",
      },
    );

    setFlowContainer({
      flow: updatedFlow,
      flowType: FlowType.Settings,
    });
  };

  //-- alway replace the link button with a custom link button
  const linkButtons = [
    ...props.linkButtons.filter(
      (button) => !("value" in button.attributes && button.attributes.value === "family_wallet"),
    ),
    ...(hasWallet
      ? []
      : [
          {
            ...({
              attributes: {
                disabled: false,
                name: "link",
                node_type: "input",
                type: "submit",
                value: "family_wallet",
              },
              group: "oidc",
              messages: [],
              meta: {
                label: {
                  id: 0,
                  context: { provider: "Wallet" },
                  text: "Link wallet",
                  type: "info",
                },
              },
              type: "input",
            } as UiNode),
            onClick: handleLinkWallet,
          },
        ]),
  ];

  //-- if wallet is connected then allow unlinking
  const unlinkButtons = hasWallet
    ? [
        ...props.unlinkButtons,
        {
          ...({
            attributes: {
              disabled: false,
              name: "unlink",
              node_type: "input",
              type: "submit",
              value: "family_wallet",
            },
            group: "oidc",
            messages: [],
            meta: {
              label: {
                id: 0,
                context: { provider: "Wallet" },
                text: "Unlink wallet",
                type: "info",
              },
            },
            type: "input",
          } as UiNode),
          onClick: handleUnlinkWallet,
        },
      ]
    : props.unlinkButtons;

  return (
    <components.Form.OidcSettings
      {...props}
      linkButtons={linkButtons}
      unlinkButtons={unlinkButtons}
    />
  );
}

interface Props extends PageProps {
  flow: SettingsFlow;
}
export default function SettingsUI({ flow, config }: Props) {
  const updatedFlow = {
    ...flow,
    ui: {
      ...flow.ui,
      nodes: flow.ui.nodes.flatMap((node) => {
        if (
          node.group === "profile" &&
          "name" in node.attributes &&
          node.attributes.name === "traits.wallet"
        ) {
          if (!node.attributes.value) {
            return [];
          }

          return [
            {
              ...node,
              attributes: {
                ...node.attributes,
                disabled: true,
              },
              meta: {
                ...node.meta,
                label: {
                  ...node.meta?.label,
                  id: node.meta?.label?.id ?? 0,
                  type: node.meta?.label?.type ?? "info",
                  text: "Wallet Address",
                },
              },
            },
          ];
        }

        return [node];
      }),
    },
  };

  return (
    <Page>
      <Settings
        flow={updatedFlow}
        config={config}
        components={{
          ...overridedComponents,
          Form: {
            OidcSettings,
          },
        }}
      />
    </Page>
  );
}
