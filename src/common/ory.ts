import {
  Configuration,
  FrontendApi,
  LoginFlow,
  OAuth2Api,
  RegistrationFlow,
  UiNode,
  UiNodeInputAttributes,
} from "@ory/client-fetch";

export const oauthApi = new OAuth2Api(
  new Configuration({
    basePath: process.env.KRATOS_ADMIN_URL,
  }),
);

export const frontendApi = new FrontendApi(
  new Configuration({
    headers: {
      Accept: "application/json",
    },
    basePath: process.env.NEXT_PUBLIC_ORY_SDK_URL,
  }),
);

function nodeSortValue(node: UiNode) {
  const attributes = node.attributes as UiNodeInputAttributes;
  return attributes.value === "family_wallet" ? "" : attributes.value.toString() || "";
}

export function getFlowWithOidcNodesSorted<T extends LoginFlow | RegistrationFlow>(flow: T) {
  const oidcNodes = flow.ui.nodes
    .filter((node) => node.group === "oidc")
    .sort((node1, node2) => nodeSortValue(node2).localeCompare(nodeSortValue(node1)));

  return {
    ...flow,
    ui: {
      ...flow.ui,
      nodes: flow.ui.nodes.filter((node) => node.group !== "oidc").concat(oidcNodes),
    },
  } as T;
}

export function getFlowWithSomeInputsHidden(flow: RegistrationFlow) {
  //-- hide some inputs
  return {
    ...flow,
    ui: {
      ...flow.ui,
      nodes: flow.ui.nodes.filter(
        (node) =>
          !["traits.first_name", "traits.last_name", "traits.wallet"].includes(
            (node.attributes as UiNodeInputAttributes).name,
          ) && node.group !== "password",
      ),
    },
  } as RegistrationFlow;
}

export function getFlowWithMutatedIndentifierInputNode(flow: LoginFlow) {
  return {
    ...flow,
    ui: {
      ...flow.ui,
      nodes: flow.ui.nodes.map((node) => {
        if (
          node.type === "input" &&
          "name" in node.attributes &&
          node.attributes.name === "identifier"
        ) {
          return {
            ...node,
            attributes: {
              ...node.attributes,
              value: "",
            },
            meta: {
              ...node.meta,
              label: {
                ...node.meta.label,
                id: 1070007, // <-- email label id
              },
            },
          };
        }
        return node;
      }),
    },
  } as RegistrationFlow;
}
