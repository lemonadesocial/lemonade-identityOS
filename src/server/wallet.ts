import assert from "assert";
import { randomUUID } from "crypto";
import * as ethers from "ethers";
import { NextRequest, NextResponse } from "next/server";

import { sign, verify } from "../utils/jwt";

import { getRedis } from "./redis";

export const getWalletMessageWithToken = async (wallet: string) => {
  const jwtSecret = process.env.JWT_SECRET;
  assert.ok(jwtSecret, "JWT_SECRET is missing");

  const nonce = randomUUID();

  const message = `Sign this message to attach your wallet to your Lemonade account.\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nWallet address:\n${wallet}\n\nNonce:\n${nonce}`;

  const token = await sign({ wallet, nonce, message }, jwtSecret, { expiresIn: 3600 });

  return { message, token };
};

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

export const returnError = (message: string) => {
  return new NextResponse(
    JSON.stringify({
      messages: [
        {
          messages: [
            {
              id: 1,
              text: message,
              type: "error",
            },
          ],
        },
      ],
    }),
    {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
};

export const parseRequest = async (request: NextRequest) => {
  const payload: {
    identity: {
      traits: { wallet?: string; email?: string };
      metadata_public?: {
        verified_wallet?: string;
      };
    };
    transient_payload?: {
      wallet_signature?: string;
      wallet_signature_token?: string;
    };
  } = await request.json();

  return payload;
};

export const verifyWalletSignature = async (
  wallet: string,
  wallet_signature?: string,
  wallet_signature_token?: string,
) => {
  if (!wallet_signature || !wallet_signature_token) {
    return returnError("Wallet signature and token are required");
  }

  const signer = await verifySignerFromSignatureAndToken(wallet_signature, wallet_signature_token);

  if (signer.toLowerCase() !== wallet) {
    return returnError("Invalid wallet signature");
  }
};
