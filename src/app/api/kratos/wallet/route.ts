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

  const wallet = bodyRest.identity.traits.wallet?.toLowerCase();

  const isValidWallet = isValidWalletAddress(wallet);

  if (!isValidWallet) {
    assert.ok(bodyRest.identity.traits.email, "email is required when wallet is missing");
  }

  if (
    !isValidWallet ||
    (wallet && wallet === bodyRest.identity.metadata_public?.verified_wallet?.toLowerCase())
  ) {
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

  assert.ok(signer.toLowerCase() === wallet, "invalid signature");

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
