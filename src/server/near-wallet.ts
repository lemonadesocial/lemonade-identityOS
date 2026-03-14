import assert from "assert";
import { randomUUID } from "crypto";
import nacl from "tweetnacl";
import bs58 from "bs58";

import { sign, verify } from "../utils/jwt";

const getJwtSecret = () => {
  const jwtSecret = process.env.JWT_SECRET;
  assert.ok(jwtSecret, "JWT_SECRET is missing");
  return jwtSecret;
};

const getNearRpcUrl = () =>
  process.env.NEAR_RPC_URL || "https://rpc.mainnet.near.org";

const isImplicitAccount = (accountId: string) =>
  /^[0-9a-f]{64}$/.test(accountId);

/**
 * Fetch ed25519 public keys for a NEAR account via RPC.
 * Returns raw 32-byte public key buffers for all ed25519 keys on the account.
 */
export const fetchAccountEd25519Keys = async (
  accountId: string,
): Promise<Uint8Array[]> => {
  const rpcUrl = getNearRpcUrl();

  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "verify-key",
      method: "query",
      params: {
        request_type: "view_access_key_list",
        account_id: accountId,
        finality: "final",
      },
    }),
  });

  assert.ok(response.ok, `NEAR RPC request failed: ${response.status}`);

  const data = await response.json();

  assert.ok(!data.error, `NEAR RPC error: ${JSON.stringify(data.error)}`);
  assert.ok(data.result?.keys, "NEAR RPC returned no keys");

  const ed25519Keys: Uint8Array[] = [];

  for (const key of data.result.keys) {
    const pubKey: string = key.public_key;
    if (pubKey.startsWith("ed25519:")) {
      ed25519Keys.push(bs58.decode(pubKey.slice("ed25519:".length)));
    }
  }

  return ed25519Keys;
};

export const getNearWalletMessageWithToken = async (nearWallet: string) => {
  const jwtSecret = getJwtSecret();

  const nonce = randomUUID();

  const message = `Sign this message to attach your NEAR wallet to your Lemonade account.\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nNEAR account:\n${nearWallet}\n\nNonce:\n${nonce}`;

  const token = await sign({ near_wallet: nearWallet, nonce, message }, jwtSecret, {
    expiresIn: 3600,
  });

  return { message, token };
};

/**
 * Verify a NEAR wallet signature against the account's public key(s).
 *
 * For implicit accounts (64-char hex), the account ID itself is the public key.
 * For named accounts, the signer's public key is looked up on-chain via NEAR RPC
 * and the signature is verified against each ed25519 key until one matches.
 */
export const verifyNearWalletSignature = async (
  nearWallet: string,
  signature: string,
  signatureToken: string,
) => {
  const jwtSecret = getJwtSecret();

  const { near_wallet, message } = await verify<{
    near_wallet: string;
    nonce: string;
    message: string;
  }>(signatureToken, jwtSecret);

  assert.strictEqual(near_wallet, nearWallet, "NEAR wallet mismatch in token");

  const signatureBytes = bs58.decode(signature);
  const messageBytes = Buffer.from(message);

  if (isImplicitAccount(nearWallet)) {
    // Implicit account: the account ID is the hex-encoded ed25519 public key.
    const publicKeyBytes = Buffer.from(nearWallet, "hex");
    const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
    assert.ok(isValid, "Invalid NEAR wallet signature");
    return;
  }

  // Named account: fetch access keys from NEAR RPC and verify against each.
  const keys = await fetchAccountEd25519Keys(nearWallet);
  assert.ok(keys.length > 0, `No ed25519 keys found for NEAR account: ${nearWallet}`);

  const matchedKey = keys.some((publicKeyBytes) =>
    nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes),
  );

  assert.ok(matchedKey, "NEAR wallet signature does not match any key on the account");
};
