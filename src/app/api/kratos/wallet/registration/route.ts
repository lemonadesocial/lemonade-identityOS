import { NextRequest, NextResponse } from "next/server";

import {
  FARCASTER_ISSUER,
  getFarcasterIdentifier,
  verifyJwt,
} from "../../../../../common/farcaster";
import { verifyAuthCookie } from "../../../../../common/unicorn";

import { verifyFarcasterSIWE } from "../../../../../server/farcaster";
import { parseRequest, returnError } from "../../../../../server/request";
import { verifySignerFromSignatureAndToken, verifyWalletSignature } from "../../../../../server/wallet";

export async function POST(request: NextRequest) {
  const { transient_payload, ...bodyRest } = await parseRequest(request);

  const wallet = bodyRest.identity.traits.wallet?.toLowerCase();
  const unicorn_wallet = bodyRest.identity.traits.unicorn_wallet?.toLowerCase();
  const farcaster_fid = bodyRest.identity.traits.farcaster_fid?.toLowerCase();

  if (!wallet && !unicorn_wallet && !farcaster_fid) {
    return NextResponse.json(bodyRest);
  }

  const metadata_public: Record<string, string> = {};

  if (transient_payload && "unicorn_auth_cookie" in transient_payload) {
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

    //-- parse data from siwe
    if (!bodyRest.identity.traits.unicorn_contract_wallet && transient_payload.siwe) {
      const signer = await verifySignerFromSignatureAndToken(
        transient_payload.siwe.wallet_signature,
        transient_payload.siwe.wallet_signature_token,
      );

      bodyRest.identity.traits.unicorn_contract_wallet = signer;
    }

    const email = authCookie.storedToken.authDetails.email?.toLowerCase();

    if (email) {
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

  if (transient_payload && "wallet_signature" in transient_payload) {
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

  if (transient_payload && "farcaster_jwt" in transient_payload) {
    if (!farcaster_fid) {
      return returnError("Farcaster FID is required");
    }

    const payload = await verifyJwt(
      transient_payload.farcaster_jwt,
      transient_payload.farcaster_app_hostname,
    );

    if (getFarcasterIdentifier(payload.sub) !== farcaster_fid || payload.iss !== FARCASTER_ISSUER) {
      return returnError("Invalid farcaster jwt");
    }
  }

  if (transient_payload && "farcaster_siwe_message" in transient_payload) {
    if (!farcaster_fid) {
      return returnError("Farcaster FID is required");
    }

    const userFID = await verifyFarcasterSIWE(transient_payload);

    if (userFID !== farcaster_fid) {
      return returnError("Invalid farcaster payload");
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
