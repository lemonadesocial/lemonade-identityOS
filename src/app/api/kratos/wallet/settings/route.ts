import { NextRequest, NextResponse } from "next/server";

import { getFarcasterIdentifier, verifyJwt } from "../../../../../common/farcaster";
import { verifyAuthCookie } from "../../../../../common/unicorn";

import { verifyFarcasterSIWE } from "../../../../../server/farcaster";
import { parseRequest, returnError } from "../../../../../server/request";
import { verifySignerFromSignatureAndToken, verifyWalletSignature } from "../../../../../server/wallet";

export async function POST(request: NextRequest) {
  const { transient_payload, ...bodyRest } = await parseRequest(request);

  const wallet = bodyRest.identity.traits.wallet?.toLowerCase();
  const unicorn_wallet = bodyRest.identity.traits.unicorn_wallet?.toLowerCase();
  const unicorn_contract_wallet = bodyRest.identity.traits.unicorn_contract_wallet?.toLowerCase();
  const email = bodyRest.identity.traits.email;
  const farcaster_fid = bodyRest.identity.traits.farcaster_fid;

  if (!wallet && !unicorn_wallet && !farcaster_fid && !email) {
    return returnError("Missing required identifier");
  }

  const metadata_public: Record<string, string> = {};

  if (wallet && wallet !== bodyRest.identity.metadata_public?.verified_wallet) {
    if (!transient_payload || !("wallet_signature" in transient_payload)) {
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
    (
      unicorn_wallet !== bodyRest.identity.metadata_public?.verified_unicorn_wallet
      || !unicorn_contract_wallet
    )
  ) {
    if (!transient_payload || !("unicorn_auth_cookie" in transient_payload)) {
      return returnError("Missing required transient payload");
    }

    const authCookie = await verifyAuthCookie(transient_payload.unicorn_auth_cookie);

    if (!authCookie) {
      return returnError("Invalid auth cookie");
    }

    if (authCookie.storedToken.authDetails.walletAddress?.toLowerCase() !== unicorn_wallet) {
      return returnError("Wallet address mismatch");
    }

    if (!transient_payload.siwe) {
      return returnError("No wallet signature");
    }

    const signer = await verifySignerFromSignatureAndToken(
      transient_payload.siwe.wallet_signature,
      transient_payload.siwe.wallet_signature_token,
    );

    bodyRest.identity.traits.unicorn_contract_wallet = signer;

    const email = authCookie.storedToken.authDetails.email?.toLowerCase();

    if (email && !bodyRest.identity.traits.email) {
      bodyRest.identity.traits.email = email;

      bodyRest.identity.verifiable_addresses = [
        ...bodyRest.identity.verifiable_addresses || [],
        {
          value: email,
          verified: true,
          via: "email",
          status: "completed",
        } as any,
      ]
    }

    metadata_public.verified_unicorn_wallet = unicorn_wallet;
  }

  if (
    farcaster_fid &&
    farcaster_fid !== bodyRest.identity.metadata_public?.verified_farcaster_fid
  ) {
    if (transient_payload && "farcaster_siwe_message" in transient_payload) {
      const userFID = await verifyFarcasterSIWE(transient_payload);

      if (!userFID) {
        return returnError("Invalid farcaster payload");
      }

      metadata_public.verified_farcaster_fid = userFID;
    } else if (transient_payload && "farcaster_jwt" in transient_payload) {
      const payload = await verifyJwt(
        transient_payload.farcaster_jwt,
        transient_payload.farcaster_app_hostname,
      );

      metadata_public.verified_farcaster_fid = getFarcasterIdentifier(payload.sub);
    } else {
      return returnError("Missing required transient payload");
    }
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
