import { LoginFlow, Session, UiNodeInputAttributes } from "@ory/client-fetch";
import { Consent } from "@ory/elements-react/theme";

import { type PageProps } from "../../common/types";
import { overridedComponents } from "../../common/ui";

interface Props extends PageProps {
  flow: LoginFlow;
  session: Session;
}
export default function ConsentUI({ config, session, flow }: Props) {
  const formActionUrl = flow.ui.action;
  const csrfNode = flow.ui.nodes.find(
    (node) => (node.attributes as UiNodeInputAttributes).name === "csrf_token",
  );

  const csrfToken = (csrfNode?.attributes as UiNodeInputAttributes).value;

  if (!flow.oauth2_login_request) {
    return null;
  }

  return (
    <Consent
      consentChallenge={flow.oauth2_login_request}
      csrfToken={csrfToken}
      formActionUrl={formActionUrl}
      session={session}
      config={config}
      components={overridedComponents}
    />
  );
}
