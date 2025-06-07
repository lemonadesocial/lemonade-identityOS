"use client";

import { LoginFlow } from "@ory/client-fetch";
import { Login } from "@ory/elements-react/theme";

import { type PageProps } from "../../common/types";
import { overridedComponents } from "../../common/ui";

interface Props extends PageProps {
  flow: LoginFlow;
}
export default function LoginUI({ flow, config }: Props) {
  return (
    <div>
      <Login flow={flow} config={config} components={overridedComponents} />
    </div>
  );
}
