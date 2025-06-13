"use client";

import { LoginFlow } from "@ory/client-fetch";
import { OryNodeOidcButtonProps } from "@ory/elements-react";
import { DefaultButtonSocial, Login } from "@ory/elements-react/theme";
import { useSearchParams } from "next/navigation";

import { handleWalletLogin } from "../../client/ory";

import { type PageProps } from "../../common/types";
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

          handleWalletLogin(flowId, args.signature, args.address, args.token);
        }}
      />
    );
  }

  return <DefaultButtonSocial {...props} />;
}

interface Props extends PageProps {
  flow: LoginFlow;
}
export default function LoginUI({ flow, config }: Props) {
  const updatedFlow = getFlowWithOidcNodesSorted(flow);

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
