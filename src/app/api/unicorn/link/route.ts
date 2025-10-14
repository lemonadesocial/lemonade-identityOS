import { NextRequest, NextResponse } from "next/server";

import { dummyWalletPassword } from "../../../../common/ory";
import { verifyAuthCookie } from "../../../../common/unicorn";
import { EOAWalletPayload } from "../../../../common/siwe";

import { getUserByIdentifier, updateIdentity } from "../../../../server/ory";
import { addCorsHeaders } from "../../../../server/request";
import { verifySignerFromSignatureAndToken } from "../../../../server/wallet";

//-- check if the unicorn authCookie contains credential that can be used to link to existing account
async function processPost(request: NextRequest) {
  const body = await request.json();

  const identifier: string | undefined = body.identifier;
  const cookie: string | undefined = body.auth_cookie;
  const siwe: EOAWalletPayload | undefined = body.siwe;

  if (!identifier || !cookie || !siwe) {
    return new NextResponse("Invalid request", { status: 400 });
  }

  const authCookie = await verifyAuthCookie(cookie);

  if (!authCookie) {
    return new NextResponse("Invalid auth cookie", { status: 400 });
  }
  const { storedToken } = authCookie;

  const email = storedToken.authDetails.email.toLowerCase();
  const wallet = storedToken.authDetails.walletAddress?.toLowerCase();

  if (!wallet) {
    return new NextResponse("Wallet is not found in the unicorn account", { status: 400 });
  }

  if (email !== identifier && wallet !== identifier) {
    return new NextResponse("Invalid identifier", { status: 400 });
  }

  const identity = await getUserByIdentifier(identifier);

  if (!identity) {
    return new NextResponse("Identity not found", { status: 400 });
  }

  let unicorn_contract_wallet = '';

  if (siwe) {
    const signer = await verifySignerFromSignatureAndToken(
      siwe.wallet_signature,
      siwe.wallet_signature_token,
    );

    unicorn_contract_wallet = signer;
  }

  //-- we don't update credentials
  const { id, credentials, ...rest } = identity;

  const payload = {
    ...rest,
    traits: {
      ...rest.traits,
      unicorn_wallet: wallet,
      ...(unicorn_contract_wallet && { unicorn_contract_wallet }),
    },
    metadata_public: {
      ...rest.metadata_public,
      verified_unicorn_wallet: wallet,
    },
  };

  if (identifier === email && wallet) {
    //-- link wallet to existing email user
    if (identity.traits.unicorn_wallet) {
      return new NextResponse("This account has already been linked to a unicorn wallet", {
        status: 400,
      });
    }

    await updateIdentity(id, {
      ...payload,
      credentials: {
        //-- the account may not have password set, we should reset it anyway
        password: {
          config: {
            password: dummyWalletPassword,
          },
        },
      },
    });
  } else if (identifier === wallet) {
    //-- link wallet to existing wallet user
    //-- the email here is obviously not used for any account, because otherwise it would fall to the first case
    const newEmail = payload.traits.email || email;

    await updateIdentity(id, {
      ...payload,
      traits: {
        ...payload.traits,
        email: newEmail,
      },
      ...(newEmail !== payload.traits.email && {
        verifiable_addresses: [
          ...payload.verifiable_addresses,
          {
            value: email,
            verified: true,
            via: "email",
            status: "completed",
          } as any,
        ],
      }),
    });
  }

  return NextResponse.json({}, { status: 200 });
}

export async function POST(request: NextRequest) {
  const response = await processPost(request);
  return addCorsHeaders(response);
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}
