import { NextRequest, NextResponse } from "next/server";

import { parseRequest, returnError } from "../../../../../server/request";
import { verifyWalletSignature } from "../../../../../server/wallet";
import { verifyAuthCookie } from "../../../../../common/unicorn";

export async function POST(request: NextRequest) {
  const { transient_payload, ...bodyRest } = await parseRequest(request);

  const wallet = bodyRest.identity.traits.wallet?.toLowerCase();
  const unicorn_wallet = bodyRest.identity.traits.unicorn_wallet?.toLowerCase();

  if (!wallet && !unicorn_wallet) {
    return NextResponse.json(bodyRest);
  }

  const metadata_public: Record<string, string> = {};

  if (transient_payload?.unicorn_auth_cookie) {
    if (!unicorn_wallet) {
      return returnError("Unicorn wallet is required");
    }

    //-- verify the auth cookie
    const authCookie = verifyAuthCookie(transient_payload.unicorn_auth_cookie);

    if (authCookie.storedToken.authDetails.walletAddress?.toLowerCase() !== unicorn_wallet) {
      return returnError("Wallet address mismatch");
    }

    metadata_public.verified_unicorn_wallet = unicorn_wallet;
  }

  if (transient_payload?.wallet_signature && transient_payload?.wallet_signature_token) {
    if (!wallet) {
      return returnError("Wallet is required");
    }

    await verifyWalletSignature(
      wallet,
      transient_payload.wallet_signature,
      transient_payload.wallet_signature_token,
    );

    metadata_public.verified_wallet = wallet;
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
