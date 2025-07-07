"use client";

import { FlowType, VerificationFlow } from "@ory/client-fetch";
import { useOryFlow } from "@ory/elements-react";
import { Verification } from "@ory/elements-react/theme";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { overridedComponents } from "../../client/ui";

import { type PageProps } from "../../common/types";
import CardRoot from "../../components/card-root";
import CardWrapper from "../../components/card-wrapper";
import Page from "../../components/page";

function VerificationCardRoot(props: any) {
  const { flow, setFlowContainer } = useOryFlow();
  const params = useSearchParams();
  const [redirecting, setRedirecting] = useState(false);

  const returnTo = params.get("return_to")?.toString();

  useEffect(() => {
    if (flow.state === "passed_challenge" && returnTo && !redirecting) {
      //-- update the flow to reflect the continue url
      setRedirecting(true);

      setFlowContainer({
        flow: {
          ...flow,
          ui: {
            ...flow.ui,
            nodes: flow.ui.nodes.map((node) => {
              if (
                "id" in node.attributes &&
                "href" in node.attributes &&
                node.attributes.id === "continue"
              ) {
                return {
                  ...node,
                  attributes: { ...node.attributes, href: returnTo || node.attributes.href },
                };
              }
              return node;
            }),
          },
        } as VerificationFlow,
        flowType: FlowType.Verification,
      });
    }
  }, [flow, returnTo, setFlowContainer, redirecting]);

  return <CardRoot {...props} />;
}

interface Props extends PageProps {
  flow: VerificationFlow;
}
export default function VerificationUI({ flow, config }: Props) {
  return (
    <Page>
      <CardWrapper>
        <Verification
          flow={flow}
          config={config}
          components={{
            ...overridedComponents,
            Card: {
              ...overridedComponents.Card,
              Root: VerificationCardRoot,
            },
          }}
        />
      </CardWrapper>
    </Page>
  );
}
