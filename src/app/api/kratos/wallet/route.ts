import assert from "assert";
import { NextRequest, NextResponse } from "next/server";

import { verifySignerFromSignatureAndToken } from "../../../../common/wallet";

export async function POST(request: NextRequest) {
  assert.ok(process.env.JWT_SECRET);

  const body = await request.json();

  const { wallet_signature: signature, wallet_signature_token: token, ...keptTraits } = body.identity.traits;

  if (!keptTraits.wallet) {
    return NextResponse.json(body);
  }

  assert.ok(signature && token, "signature and token are required");

  const signer = await verifySignerFromSignatureAndToken(signature, token);

  assert.ok(signer.toLowerCase() === keptTraits.wallet.toLowerCase(), "invalid signature");

  const response = {
    ...body,
    identity: {
      ...body.identity,
      traits: keptTraits,
    },
  };

  return NextResponse.json(response);
}
