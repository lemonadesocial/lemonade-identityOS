"use client";

import { UiNode } from "@ory/client-fetch";

export default function OidcButton({ node, onClick }: { node: UiNode; onClick?: () => void }) {
  return (
    <div>
      <button onClick={onClick}>{node.meta.label?.text}</button>
    </div>
  );
}
