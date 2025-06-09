"use client";

import { RegistrationFlow } from "@ory/client-fetch";
import { Registration } from "@ory/elements-react/theme";

import { PageProps } from "../../common/types";
import { overridedComponents } from "../../common/ui";
import CardWrapper from "../../components/CardWrapper";
import Page from "../../components/page";

interface Props extends PageProps {
  flow: RegistrationFlow;
}
export default function RegistrationUI({ flow, config }: Props) {
  return (
    <Page>
      <CardWrapper>
        <div className="page-title" style={{ alignSelf: "flex-start" }}>
          {"Sign up"}
        </div>
        <Registration components={overridedComponents} flow={flow} config={config} />
      </CardWrapper>
    </Page>
  );
}
