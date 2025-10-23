"use client";

import { FlowType, SettingsFlow, UiNode, UpdateSettingsFlowBody } from "@ory/client-fetch";
import { OryFormSectionProps, OrySettingsOidcProps, useOryFlow } from "@ory/elements-react";
import { getOryComponents, Settings } from "@ory/elements-react/theme";
import { useModal } from "connectkit";
import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";

import { handleProfileUpdate } from "../../client/ory";
import { overridedComponents } from "../../client/ui";
import { handleUnlinkWallet, handleWalletUpdate, useWalletPopup } from "../../client/wallet";

import { type PageProps } from "../../common/types";

import { Web3Provider } from "../../components/family-wallet/web3-provider";
import Page from "../../components/page";

const getFlowNodes = (flow: SettingsFlow) => {
  return flow.ui.nodes.flatMap((node) => {
    if (
      node.group === "profile" &&
      "name" in node.attributes &&
      ["traits.wallet", "traits.unicorn_wallet", "traits.unicorn_contract_wallet"].includes(
        node.attributes.name,
      )
    ) {
      return [{ ...node, attributes: { ...node.attributes, disabled: true } }];
    }

    //-- we don't allow user to update password because it will cause wallet login to fail
    if (node.group === "password") {
      return [];
    }

    return [node];
  });
};

const getUpdatedSettingFlow = (flow: SettingsFlow) => {
  return {
    ...flow,
    ui: { ...flow.ui, nodes: getFlowNodes(flow) },
  };
};

const handleError = (err?: any) => {
  if (err?.redirect_browser_to) {
    window.location.href = err.redirect_browser_to;
  }
};

function OidcSettings(props: OrySettingsOidcProps) {
  const components = useRef(getOryComponents()).current;
  const { flow, setFlowContainer } = useOryFlow();
  const { setOpen } = useModal();

  const { account, signing, signature, sign } = useWalletPopup((args, disconnect) => {
    disconnect();

    handleWalletUpdate({ ...args, flow: flow as SettingsFlow }, (flowWithError, err) => {
      setFlowContainer({
        flow: { ...flowWithError, ui: { ...flowWithError.ui, nodes: getFlowNodes(flowWithError) } },
        flowType: FlowType.Settings,
      });

      disconnect();

      handleError(err);
    });
  });

  const hasWallet = !!(flow as SettingsFlow).identity.traits.wallet;

  const handleLink = async () => {
    setOpen(true);
  };

  const handleUnlink = () => {
    handleUnlinkWallet({ flow: flow as SettingsFlow }, (flowWithError, err) => {
      setFlowContainer({
        flow: getUpdatedSettingFlow(flowWithError),
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

//-- this component is copied exactly from the ory-elements-react package
const DefaultFormSection = ({ children, nodes: _nodes, ...rest }: OryFormSectionProps) => {
  return (
    <form
      className="flex w-full max-w-screen-sm flex-col md:max-w-[712px] lg:max-w-[802px] xl:max-w-[896px] px-4"
      {...rest}
    >
      {children}
    </form>
  );
};

function SettingsSection(props: any) {
  const { flow, setFlowContainer } = useOryFlow();
  const methods = useFormContext();

  const isProfileSection = props["data-testid"] === "ory/screen/settings/group/profile";

  const newNodes = getFlowNodes(flow as SettingsFlow);

  const hasUnwantedInputs = newNodes.length !== flow.ui.nodes.length;

  useEffect(() => {
    if (hasUnwantedInputs && isProfileSection) {
      setFlowContainer({
        flow: getUpdatedSettingFlow(flow as SettingsFlow),
        flowType: FlowType.Settings,
      });
    }
  }, [isProfileSection, hasUnwantedInputs, flow, setFlowContainer]);

  if (isProfileSection) {
    return (
      <DefaultFormSection
        {...props}
        onSubmit={(e: any) => {
          void methods.handleSubmit((data) => {
            //-- remove the email field if it is empty so Kratos won't complain
            if (data.traits.email === "") {
              delete data.traits.email;
            }

            if (data.traits.wallet === "") {
              delete data.traits.wallet;
            }

            handleProfileUpdate(
              { flow: flow as SettingsFlow, data: data as UpdateSettingsFlowBody },
              (flowWithError, err) => {
                setFlowContainer({
                  flow: getUpdatedSettingFlow(flowWithError),
                  flowType: FlowType.Settings,
                });

                handleError(err);
              },
            );
          })(e);
        }}
      />
    );
  }

  return <DefaultFormSection {...props} />;
}

interface Props extends PageProps {
  flow: SettingsFlow;
}
export default function SettingsUI({ flow, config }: Props) {
  const updatedFlow = getUpdatedSettingFlow(flow);

  return (
    <Web3Provider>
      <Page>
        <Settings
          flow={updatedFlow}
          config={config}
          components={{
            ...overridedComponents,
            Form: {
              ...overridedComponents.Form,
              OidcSettings,
            },
            Card: {
              ...overridedComponents.Card,
              SettingsSection,
            },
          }}
        />
      </Page>
    </Web3Provider>
  );
}
