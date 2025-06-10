"use client";

import { VerificationFlow } from "@ory/client-fetch";
import { Verification } from "@ory/elements-react/theme";

import { type PageProps } from "../../common/types";
import { overridedComponents } from "../../common/ui";
import CardWrapper from "../../components/CardWrapper";
import Page from "../../components/page";

interface Props extends PageProps {
  flow: VerificationFlow;
}
export default function VerificationUI({ flow, config }: Props) {
  return (
    <Page>
      <CardWrapper>
        <Verification flow={flow} config={config} components={overridedComponents} />
      </CardWrapper>
    </Page>
  );
}
