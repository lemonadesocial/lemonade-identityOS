"use client";

import { LoginFlow } from "@ory/client-fetch";
import { Login } from "@ory/elements-react/theme";

import { type PageProps } from "../../common/types";
import { overridedComponents } from "../../common/ui";
import CardWrapper from "../../components/CardWrapper";
import Page from "../../components/page";

interface Props extends PageProps {
  flow: LoginFlow;
}
export default function LoginUI({ flow, config }: Props) {
  return (
    <Page>
      <CardWrapper>
        <Login flow={flow} config={config} components={overridedComponents} />
      </CardWrapper>
    </Page>
  );
}
