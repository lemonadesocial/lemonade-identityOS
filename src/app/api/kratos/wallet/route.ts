import assert from "assert";
import { NextRequest, NextResponse } from "next/server";

import { isValidWalletAddress } from "../../../../common/wallet";
import { verifySignerFromSignatureAndToken } from "../../../../server/wallet";

export async function POST(request: NextRequest) {
  const {
    transient_payload,
    ...bodyRest
  }: {
    identity: {
      traits: { wallet?: string };
    };
    transient_payload?: {
      wallet_signature?: string;
      wallet_signature_token?: string;
    };
  } = await request.json();

  //-- this is not a wallet registration, so we can just return the body
  const wallet = bodyRest.identity.traits.wallet;

  if (!isValidWalletAddress(wallet)) {
    return NextResponse.json(bodyRest);
  }

  assert.ok(
    wallet &&
      transient_payload &&
      transient_payload.wallet_signature &&
      transient_payload.wallet_signature_token,
    "signature and token are required",
  );

  const signer = await verifySignerFromSignatureAndToken(
    transient_payload.wallet_signature,
    transient_payload.wallet_signature_token,
  );

  assert.ok(signer.toLowerCase() === wallet.toLowerCase(), "invalid signature");

  return NextResponse.json(bodyRest);
}
