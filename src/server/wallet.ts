import assert from "assert";
import { randomBytes, randomUUID } from "crypto";
import { verifySignature } from "thirdweb/auth";

import { client, chain } from "../common/thirdweb";

import { sign, verify } from "../utils/jwt";

import { getRedis } from "./redis";
import { returnError } from "./request";

const getJwtSecret = () => {
  const jwtSecret = process.env.JWT_SECRET;
  assert.ok(jwtSecret, "JWT_SECRET is missing");
  return jwtSecret;
};

export const getSignedNonce = async () => {
  const jwtSecret = getJwtSecret();

  const nonce = randomBytes(32).toString("hex");

  const token = await sign({ nonce }, jwtSecret, { expiresIn: 3600 });

  return { nonce, token };
};

export const verifySignedNonce = async (nonce: string, token: string) => {
  const jwtSecret = getJwtSecret();

  const { nonce: storedNonce } = await verify<{ nonce: string }>(token, jwtSecret);

  assert.strictEqual(nonce, storedNonce, "nonce mismatch");
};

export const getWalletMessageWithToken = async (wallet: string) => {
  const jwtSecret = getJwtSecret();

  const nonce = randomUUID();

  const message = `Sign this message to attach your wallet to your Lemonade account.\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nWallet address:\n${wallet}\n\nNonce:\n${nonce}`;

  const token = await sign({ wallet, nonce, message }, jwtSecret, { expiresIn: 3600 });

  return { message, token };
};

export const verifySignerFromSignatureAndToken = async (signature: string, token: string) => {
  const jwtSecret = getJwtSecret();

  const { wallet, nonce, message, exp } = await verify<{
    wallet: string;
    nonce: string;
    message: string;
    exp: number;
  }>(token, jwtSecret);

  const isValid = await verifySignature({
    message,
    signature,
    address: wallet,
    client,
    chain,
  });

  assert.ok(isValid, "invalid signature");

  const replayed = await getRedis().set(`signature:${nonce}`, 1, "EXAT", exp, "GET");
  assert.strictEqual(replayed, null, "signature replayed");

  return wallet.toLowerCase();
};

export const verifyWalletSignature = async (
  wallet: string,
  wallet_signature: string,
  wallet_signature_token: string,
) => {
  const signer = await verifySignerFromSignatureAndToken(wallet_signature, wallet_signature_token);

  if (signer.toLowerCase() !== wallet) {
    return returnError("Invalid wallet signature");
  }
};
