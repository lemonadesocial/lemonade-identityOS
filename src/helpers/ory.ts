import { LoginFlow, RegistrationFlow, UiNodeInputAttributes } from "@ory/client-fetch";

export function getCsrfToken(flow: LoginFlow | RegistrationFlow): string | undefined {
  const csrfNode = flow.ui.nodes.find(
    (node) => (node.attributes as UiNodeInputAttributes).name === "csrf_token",
  )?.attributes;

  return (csrfNode as UiNodeInputAttributes)?.value;
}
