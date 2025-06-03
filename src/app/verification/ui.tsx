"use client";

import { Verification } from "@ory/elements-react/theme";
import { VerificationFlow } from "@ory/client-fetch";

import { type PageProps } from "../../common/types";

interface Props extends PageProps {
  flow: VerificationFlow;
}
export default function VerificationUI({ flow, config }: Props) {
  return <Verification flow={flow} config={config} />;
}
