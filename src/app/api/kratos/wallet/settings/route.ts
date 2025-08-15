import { NextRequest, NextResponse } from "next/server";

import { verifyAuthCookie } from "../../../../../common/unicorn";
import { parseRequest, returnError } from "../../../../../server/request";
import { verifyWalletSignature } from "../../../../../server/wallet";

export async function POST(request: NextRequest) {
  const { transient_payload, ...bodyRest } = await parseRequest(request);

  const wallet = bodyRest.identity.traits.wallet?.toLowerCase();
  const unicorn_wallet = bodyRest.identity.traits.unicorn_wallet?.toLowerCase();
  const email = bodyRest.identity.traits.email;
  const farcaster_fid = bodyRest.identity.traits.farcaster_fid;

  if (!wallet && !unicorn_wallet && !farcaster_fid && !email) {
    return returnError("Missing required identifier");
  }

  const metadata_public: Record<string, string> = {};

  if (wallet && wallet !== bodyRest.identity.metadata_public?.verified_wallet) {
    if (!transient_payload?.wallet_signature || !transient_payload?.wallet_signature_token) {
      return returnError("Missing required transient payload");
    }

    await verifyWalletSignature(
      wallet,
      transient_payload.wallet_signature,
      transient_payload.wallet_signature_token,
    );

    metadata_public.verified_wallet = wallet;
  }

  if (
    unicorn_wallet &&
    unicorn_wallet !== bodyRest.identity.metadata_public?.verified_unicorn_wallet
  ) {
    if (!transient_payload?.unicorn_auth_cookie) {
      return returnError("Missing required transient payload");
    }

    const authCookie = await verifyAuthCookie(transient_payload.unicorn_auth_cookie);

    if (!authCookie) {
      return returnError("Invalid auth cookie");
    }

    if (authCookie.storedToken.authDetails.walletAddress?.toLowerCase() !== unicorn_wallet) {
      return returnError("Wallet address mismatch");
    }

    metadata_public.verified_unicorn_wallet = unicorn_wallet;
  }

  return NextResponse.json({
    ...bodyRest,
    identity: {
      ...bodyRest.identity,
      metadata_public: {
        ...bodyRest.identity.metadata_public,
        ...metadata_public,
      },
    },
  });
}
