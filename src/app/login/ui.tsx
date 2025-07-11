"use client";

import { FlowType, LoginFlow, UiNodeInputAttributes } from "@ory/client-fetch";
import { OryNodeOidcButtonProps, useOryFlow } from "@ory/elements-react";
import { DefaultButtonSocial, DefaultFormContainer, Login } from "@ory/elements-react/theme";
import { useEffect } from "react";

import { handleWalletLogin } from "../../client/ory";
import { overridedComponents } from "../../client/ui";

import {
  getFlowWithMutatedIndentifierInputNode,
  getFlowWithOidcNodesSorted,
  getFlowWithSomeInputsHidden,
} from "../../common/ory";
import { type PageProps } from "../../common/types";
import CardWrapper from "../../components/card-wrapper";
import FamilyWallet from "../../components/family-wallet";
import { Web3Provider } from "../../components/family-wallet/web3-provider";
import Page from "../../components/page";

function OidcButton(props: OryNodeOidcButtonProps) {
  const { flow, setFlowContainer } = useOryFlow();

  const { value } = props.attributes;

  if (value === "family_wallet") {
    return (
      <FamilyWallet
        onLogin={(args, disconnect) => {
          disconnect();

          handleWalletLogin({ ...args, flow: flow as LoginFlow }, (newFlow) => {
            setFlowContainer({
              flow: getFlowWithMutatedIndentifierInputNode(
                getFlowWithOidcNodesSorted(getFlowWithSomeInputsHidden(newFlow)),
              ),
              flowType: FlowType.Login,
            });

            disconnect();
          });
        }}
      />
    );
  }

  return <DefaultButtonSocial {...props} />;
}

function LoginFormRoot(props: any) {
  const { flow, setFlowContainer } = useOryFlow();

  const newNodes = flow.ui.nodes.filter(
    (node) =>
      !["traits.first_name", "traits.last_name", "traits.wallet"].includes(
        (node.attributes as UiNodeInputAttributes).name,
      ) && node.group !== "password",
  );

  const hasUnwantedInputs = newNodes.length !== flow.ui.nodes.length;

  useEffect(() => {
    if (hasUnwantedInputs) {
      setFlowContainer({
        flow: { ...flow, ui: { ...flow.ui, nodes: newNodes } } as LoginFlow,
        flowType: FlowType.Login,
      });
    }
  }, [hasUnwantedInputs, flow, newNodes, setFlowContainer]);

  return hasUnwantedInputs ? null : <DefaultFormContainer {...props} />;
}

interface Props extends PageProps {
  flow: LoginFlow;
}
export default function LoginUI({ flow, config }: Props) {
  const updatedFlow = getFlowWithMutatedIndentifierInputNode(
    getFlowWithOidcNodesSorted(getFlowWithSomeInputsHidden(flow)),
  );

  return (
    <Web3Provider>
      <Page>
        <CardWrapper>
          <Login
            flow={updatedFlow}
            config={config}
            components={{
              ...overridedComponents,
              Form: {
                ...overridedComponents?.Form,
                Root: LoginFormRoot,
              },
              Node: {
                ...overridedComponents?.Node,
                OidcButton,
              },
            }}
          />
        </CardWrapper>
      </Page>
    </Web3Provider>
  );
}
