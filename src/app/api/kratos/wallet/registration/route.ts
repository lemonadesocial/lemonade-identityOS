import { NextRequest, NextResponse } from "next/server";

import { parseRequest, verifyWalletSignature } from "../../../../../server/wallet";

export async function POST(request: NextRequest) {
  const { transient_payload, ...bodyRest } = await parseRequest(request);

  const wallet = bodyRest.identity.traits.wallet?.toLowerCase();

  if (!wallet) {
    return NextResponse.json(bodyRest);
  }

  await verifyWalletSignature(
    wallet,
    transient_payload?.wallet_signature,
    transient_payload?.wallet_signature_token,
  );

  return NextResponse.json({
    ...bodyRest,
    identity: {
      ...bodyRest.identity,
      metadata_public: {
        ...bodyRest.identity.metadata_public,
        verified_wallet: wallet,
      },
    },
  });
}
