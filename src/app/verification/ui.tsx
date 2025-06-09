"use client";

import { UiNodeInputAttributes, VerificationFlow } from "@ory/client-fetch";
import { Verification } from "@ory/elements-react/theme";

import { type PageProps } from "../../common/types";
import { overridedComponents } from "../../common/ui";
import CardWrapper from "../../components/CardWrapper";
import Page from "../../components/page";

interface Props extends PageProps {
  flow: VerificationFlow;
}
export default function VerificationUI({ flow, config }: Props) {
  console.log("flow in verification ui", flow);

  return (
    <Page>
      <CardWrapper>
        <div>{`We've sent you a verification code to the registered email address`}</div>
        <Verification flow={flow} config={config} components={overridedComponents} />
      </CardWrapper>
    </Page>
  );
}
