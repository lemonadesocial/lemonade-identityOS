import assert from "assert";

import { dummyWalletPassword } from "../common/ory";

export interface Identity {
  id: string;
  traits: {
    email?: string;
    wallet?: string;
    farcaster_fid?: string;
    unicorn_wallet?: string;
    unicorn_contract_wallet?: string;
  };
  credentials?: unknown;
  metadata_public?: Record<string, string>;
  verifiable_addresses?: {
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

export const extendSession = async (sessionId: string) => {
  const response = await fetch(
    `${process.env.KRATOS_ADMIN_URL}/admin/sessions/${sessionId}/extend`,
    { method: "PATCH" },
  );

  const data: { expires_at: string } = await response.json();

  return data;
};

export const getUserByIdentifier = async (identifier: string) => {
  const response = await fetch(
    `${process.env.KRATOS_ADMIN_URL}/admin/identities?credentials_identifier=${identifier}`,
  );
  const data: Identity[] = await response.json();

  return data[0] as Identity | undefined;
};

export const getUserById = async (id: string) => {
  const response = await fetch(`${process.env.KRATOS_ADMIN_URL}/admin/identities/${id}`);
  return (await response.json()) as Identity;
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

export const ensurePasswordAuth = async (userId: string) => {
  const user = await getUserById(userId);

  assert.ok(user);

  const { id, credentials, ...rest } = user;

  await updateIdentity(id, {
    ...rest,
    credentials: {
      //-- the account may not have password set, we should reset it anyway
      password: {
        config: {
          password: dummyWalletPassword,
        },
      },
    },
  });
};
