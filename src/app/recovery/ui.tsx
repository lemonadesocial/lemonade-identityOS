"use client";

import { Recovery } from "@ory/elements-react/theme";
import { RecoveryFlow } from "@ory/client-fetch";

import { type PageProps } from "../../common/types";

interface Props extends PageProps {
  flow: RecoveryFlow;
}
export default function RecoveryUI({ flow, config }: Props) {
  return <Recovery flow={flow} config={config} />;
}
