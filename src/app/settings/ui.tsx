"use client";

import { SettingsFlow } from "@ory/client-fetch";
import { Settings } from "@ory/elements-react/theme";

import { type PageProps } from "../../common/types";

interface Props extends PageProps {
  flow: SettingsFlow;
}
export default function SettingsUI({ flow, config }: Props) {
  return <Settings flow={flow} config={config} />;
}
