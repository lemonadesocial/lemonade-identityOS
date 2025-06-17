"use client";

import { FlowType, RegistrationFlow } from "@ory/client-fetch";
import { OryNodeOidcButtonProps, useOryFlow } from "@ory/elements-react";
import { DefaultButtonSocial, Registration } from "@ory/elements-react/theme";

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
