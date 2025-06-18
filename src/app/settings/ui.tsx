"use client";

import { FlowType, SettingsFlow, UiNode } from "@ory/client-fetch";
import { OrySettingsOidcProps, useOryFlow } from "@ory/elements-react";
import { getOryComponents, Settings } from "@ory/elements-react/theme";
import { useModal } from "connectkit";
import { useEffect, useRef } from "react";

import { handleUnlinkWallet, handleWalletUpdate } from "../../client/ory";
import { overridedComponents } from "../../client/ui";

import { type PageProps } from "../../common/types";
import { isValidWalletAddress } from "../../common/wallet";
import { useWalletPopup, Web3Provider } from "../../components/family-wallet/web3-provider";
import Page from "../../components/page";

const handleError = (err: any) => {
  if (err.redirect_browser_to) {
    window.location.href = err.redirect_browser_to;
  }
};

function OidcSettings(props: OrySettingsOidcProps) {
  const components = useRef(getOryComponents()).current;
  const { flow, setFlowContainer } = useOryFlow();
  const { setOpen } = useModal();

  const { account, signing, setSigning, signature, sign } = useWalletPopup((args, disconnect) => {
    handleWalletUpdate({ ...args, flow: flow as SettingsFlow }, (flowWithError, err) => {
      setFlowContainer({
        flow: flowWithError,
        flowType: FlowType.Settings,
      });

      disconnect();

      handleError(err);
    }).then(() => {
      disconnect();
    });
  });

  const hasWallet = isValidWalletAddress((flow as SettingsFlow).identity.traits.wallet);

  const handleLink = async () => {
    setOpen(true);
  };

  const handleUnlink = () => {
    handleUnlinkWallet({ flow: flow as SettingsFlow }, (flowWithError, err) => {
      setFlowContainer({
        flow: flowWithError,
        flowType: FlowType.Settings,
      });

      handleError(err);
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
            onClick: handleLink,
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
          onClick: handleUnlink,
        },
      ]
    : props.unlinkButtons;

  useEffect(() => {
    if (account.isConnected && !signing && !signature && !hasWallet) {
      setSigning(true);

      //-- note: ARC browser will show two signature requests in case of metamask,
      //-- we can set timeout to the sign call if we want to support this browser
      sign();
    }
  }, [account.isConnected, signing, signature, hasWallet]);

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
          return isValidWalletAddress(node.attributes.value)
            ? [{ ...node, attributes: { ...node.attributes, disabled: true } }]
            : [];
        }

        return [node];
      }),
    },
  };

  return (
    <Web3Provider>
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
    </Web3Provider>
  );
}
