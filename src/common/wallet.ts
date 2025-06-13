import assert from "assert";
import * as ethers from "ethers";

import { verify } from "../utils/jwt";

import { getRedis } from "../helpers/redis";

export const verifySignerFromSignatureAndToken = async (signature: string, token: string) => {
  const jwtSecret = process.env.JWT_SECRET;

  assert.ok(jwtSecret, "JWT_SECRET is missing");

  const { wallet, nonce, message, exp } = await verify<{
    wallet: string;
    nonce: string;
    message: string;
    exp: number;
  }>(token, jwtSecret);

  const signer = ethers.verifyMessage(message, signature).toLowerCase();

  assert.ok(signer);

  assert.strictEqual(signer, wallet.toLowerCase(), "invalid signature");

  const replayed = await getRedis().set(`signature:${nonce}`, 1, "EXAT", exp, "GET");
  assert.strictEqual(replayed, null, "signature replayed");

  return signer;
};
