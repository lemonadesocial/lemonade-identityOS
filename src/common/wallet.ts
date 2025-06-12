import assert from "assert";
import * as ethers from "ethers";

import { verify } from "../utils/jwt";

import { redis } from "../helpers/redis";

export const verifySignerFromSignatureAndToken = async (signature: string, token: string) => {
  assert.ok(process.env.JWT_SECRET);

  const { wallet, nonce, message, exp } = await verify<{
    wallet: string;
    nonce: string;
    message: string;
    exp: number;
  }>(token, process.env.JWT_SECRET);

  const signer = ethers.verifyMessage(message, signature).toLowerCase();

  assert.ok(signer);

  assert.strictEqual(signer, wallet.toLowerCase(), "invalid signature");

  const replayed = await redis.set(`signature:${nonce}`, 1, "EXAT", exp, "GET");
  assert.strictEqual(replayed, null, "signature replayed");

  return signer;
};
