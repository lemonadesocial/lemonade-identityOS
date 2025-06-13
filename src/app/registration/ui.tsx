"use client";

import { RegistrationFlow } from "@ory/client-fetch";
import { OryNodeOidcButtonProps } from "@ory/elements-react";
import { DefaultButtonSocial, Registration } from "@ory/elements-react/theme";
import { useSearchParams } from "next/navigation";

import { handleWalletRegistration } from "../../client/ory";

import { PageProps } from "../../common/types";
import { overridedComponents } from "../../client/ui";
import { getFlowWithOidcNodesSorted } from "../../common/ory";
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
          const flowId = searchParams.get("flow")?.toString();

          if (!flowId) {
            return;
          }

          handleWalletRegistration(flowId, args.signature, args.address, args.token);
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
  const updatedFlow = getFlowWithOidcNodesSorted(flow);

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
