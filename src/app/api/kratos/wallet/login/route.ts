import { NextRequest, NextResponse } from "next/server";

import { verifyAuthCookie } from "../../../../../common/unicorn";
import { parseRequest, returnError } from "../../../../../server/request";
import { verifyWalletSignature } from "../../../../../server/wallet";

export async function POST(request: NextRequest) {
  const { transient_payload, ...bodyRest } = await parseRequest(request);

  const wallet = bodyRest.identity.traits.wallet?.toLowerCase();
  const unicorn_wallet = bodyRest.identity.traits.unicorn_wallet?.toLowerCase();

  if (!wallet && !unicorn_wallet) {
    return returnError("Password login for email is disabled");
  }

  if (transient_payload?.unicorn_auth_cookie) {
    if (!unicorn_wallet) {
      return returnError("Unicorn wallet is required");
    }

    //-- verify the auth cookie
    const authCookie = await verifyAuthCookie(transient_payload.unicorn_auth_cookie);

    if (!authCookie) {
      return returnError("Invalid auth cookie");
    }

    if (authCookie.storedToken.authDetails.walletAddress?.toLowerCase() !== unicorn_wallet) {
      return returnError("Wallet address mismatch");
    }
  } else if (transient_payload?.wallet_signature && transient_payload?.wallet_signature_token) {
    if (!wallet) {
      return returnError("Wallet is required");
    }

    await verifyWalletSignature(
      wallet,
      transient_payload.wallet_signature,
      transient_payload.wallet_signature_token,
    );
  } else {
    return returnError("Missing required transient payload");
  }

  return NextResponse.json(bodyRest);
}
