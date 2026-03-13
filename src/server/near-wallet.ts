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
 * Verify a NEAR wallet signature against the account's public key.
 *
 * V1 constraint: near_wallet is always an implicit account ID (64-char hex string
 * that IS the ed25519 public key). Named accounts would require an on-chain key
 * lookup and are not supported in this path.
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

  // V1: implicit account IDs are 64-char hex-encoded ed25519 public keys.
  assert.ok(/^[0-9a-f]{64}$/.test(nearWallet), "Only implicit NEAR accounts (64-char hex) are supported");

  const signatureBytes = bs58.decode(signature);
  const publicKeyBytes = Buffer.from(nearWallet, "hex");
  const messageBytes = Buffer.from(message);

  const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);

  assert.ok(isValid, "Invalid NEAR wallet signature");
};
