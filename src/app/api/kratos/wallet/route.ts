import assert from "assert";
import { NextRequest, NextResponse } from "next/server";

import { isValidWalletAddress } from "../../../../common/wallet";
import { verifySignerFromSignatureAndToken } from "../../../../server/wallet";

function returnError(message: string) {
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
}

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
  const email = bodyRest.identity.traits.email;

  if (!email && !wallet) {
    return returnError("email or wallet is required");
  }

  if (
    !isValidWalletAddress(wallet) ||
    (wallet && wallet === bodyRest.identity.metadata_public?.verified_wallet?.toLowerCase())
  ) {
    return NextResponse.json(bodyRest);
  }

  if (
    !wallet ||
    !transient_payload?.wallet_signature ||
    !transient_payload?.wallet_signature_token
  ) {
    return returnError("signature and token are required");
  }

  const signer = await verifySignerFromSignatureAndToken(
    transient_payload.wallet_signature,
    transient_payload.wallet_signature_token,
  );

  if (signer.toLowerCase() !== wallet) {
    return returnError("invalid signature");
  }

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
