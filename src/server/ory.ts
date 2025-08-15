export interface Identity {
  id: string;
  traits: {
    email?: string;
    wallet?: string;
    unicorn_wallet?: string;
  };
  credentials?: unknown;
  metadata_public?: Record<string, string>;
  verifiable_addresses: {
    id: string;
    value: string;
    verified: boolean;
    via: string;
    status: string;
    verified_at: string;
    created_at: string;
    updated_at: string;
  }[];
}

export const getUserByIdentifier = async (identifier: string) => {
  const response = await fetch(
    `${process.env.KRATOS_ADMIN_URL}/admin/identities?credentials_identifier=${identifier}`,
  );
  const data: Identity[] = await response.json();

  return data[0] as Identity | undefined;
};

export const updateIdentity = async (id: string, update: Omit<Identity, "id">) => {
  await fetch(`${process.env.KRATOS_ADMIN_URL}/admin/identities/${id}`, {
    method: "PUT",
    body: JSON.stringify(update),
    headers: {
      "Content-Type": "application/json",
    },
  });
};
