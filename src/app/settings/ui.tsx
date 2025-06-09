"use client";

import { SettingsFlow } from "@ory/client-fetch";
import { Settings } from "@ory/elements-react/theme";

import { type PageProps } from "../../common/types";
import { overridedComponents } from "../../common/ui";
import Page from "../../components/page";

interface Props extends PageProps {
  flow: SettingsFlow;
}
export default function SettingsUI({ flow, config }: Props) {
  return (
    <Page>
      <Settings
        flow={flow}
        config={{ ...config, project: { ...config.project, name: "" } }}
        components={overridedComponents}
      />
    </Page>
  );
}
