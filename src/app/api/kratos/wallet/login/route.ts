import { NextRequest, NextResponse } from "next/server";

import { parseRequest, returnError, verifyWalletSignature } from "../../../../../server/wallet";

export async function POST(request: NextRequest) {
  const { transient_payload, ...bodyRest } = await parseRequest(request);

  const wallet = bodyRest.identity.traits.wallet?.toLowerCase();

  if (!wallet) {
    return returnError("Password login for email is disabled");
  }

  await verifyWalletSignature(
    wallet,
    transient_payload?.wallet_signature,
    transient_payload?.wallet_signature_token,
  );

  return NextResponse.json(bodyRest);
}
