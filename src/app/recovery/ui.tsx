"use client";

import { RecoveryFlow } from "@ory/client-fetch";
import { Recovery } from "@ory/elements-react/theme";

import { type PageProps } from "../../common/types";
import { overridedComponents } from "../../common/ui";
import CardWrapper from "../../components/card-wrapper";
import Page from "../../components/page";

interface Props extends PageProps {
  flow: RecoveryFlow;
}
export default function RecoveryUI({ flow, config }: Props) {
  return (
    <Page>
      <CardWrapper>
        <Recovery flow={flow} config={config} components={overridedComponents} />
      </CardWrapper>
    </Page>
  );
}
