"use client";

import { RegistrationFlow } from "@ory/client-fetch";
import { Registration } from "@ory/elements-react/theme";

import { PageProps } from "../../common/types";

import CardHeader from "../../components/card-header";
import CardRoot from "../../components/card-root";

interface Props extends PageProps {
  flow: RegistrationFlow;
}
export default function RegistrationUI({ flow, config }: Props) {
  return (
    <Registration
      components={{
        Card: {
          Header: CardHeader,
          Root: CardRoot,
        },
      }}
      flow={flow}
      config={config}
    />
  );
}
