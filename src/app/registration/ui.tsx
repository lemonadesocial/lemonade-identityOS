"use client";

import { FlowType, RegistrationFlow, UiNodeInputAttributes } from "@ory/client-fetch";
import { OryNodeOidcButtonProps, useOryFlow } from "@ory/elements-react";
import { DefaultButtonSocial, DefaultFormContainer, Registration } from "@ory/elements-react/theme";
import { useEffect } from "react";

import { handleWalletRegistration } from "../../client/ory";
import { overridedComponents } from "../../client/ui";

import { getFlowWithOidcNodesSorted, getFlowWithSomeInputsHidden } from "../../common/ory";
import { PageProps } from "../../common/types";
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
          handleWalletRegistration({ ...args, flow: flow as RegistrationFlow }, (newFlow) => {
            setFlowContainer({
              flow: getFlowWithOidcNodesSorted(getFlowWithSomeInputsHidden(newFlow)),
              flowType: FlowType.Registration,
            });

            disconnect();
          });
        }}
      />
    );
  }

  return <DefaultButtonSocial {...props} />;
}

function RegistrationFormRoot(props: any) {
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
        flow: { ...flow, ui: { ...flow.ui, nodes: newNodes } } as RegistrationFlow,
        flowType: FlowType.Registration,
      });
    }
  }, [hasUnwantedInputs, flow, newNodes, setFlowContainer]);

  return hasUnwantedInputs ? null : <DefaultFormContainer {...props} />;
}

interface Props extends PageProps {
  flow: RegistrationFlow;
}
export default function RegistrationUI({ flow, config }: Props) {
  const updatedFlow = getFlowWithOidcNodesSorted(getFlowWithSomeInputsHidden(flow));

  return (
    <Web3Provider>
      <Page>
        <CardWrapper>
          <Registration
            components={{
              ...overridedComponents,
              Form: {
                Root: RegistrationFormRoot,
              },
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
