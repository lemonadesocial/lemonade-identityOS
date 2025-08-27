import { NextRequest, NextResponse } from "next/server";

import { FarcasterSiwePayload } from "../../../../common/farcaster";
import { dummyWalletPassword } from "../../../../common/ory";
import { verifyAuthCookie } from "../../../../common/unicorn";

import { getUserByIdentifier, updateIdentity } from "../../../../server/ory";
import { addCorsHeaders, returnError } from "../../../../server/request";
import { verifyFarcasterSIWE } from "../../../../server/farcaster";

async function processPost(request: NextRequest) {
  const body = (await request.json()) as FarcasterSiwePayload;

  const userFID = await verifyFarcasterSIWE(body);

  if (!userFID) {
    return returnError("Cannot verify farcaster payload");
  }

  const identity = await getUserByIdentifier(userFID);

  if (!identity) {
    return returnError("Identity not found");
  }

  //-- we don't update credentials
  const { id, credentials, ...rest } = identity;

  const payload = {
    ...rest,
    traits: {
      ...rest.traits,
      unicorn_wallet: wallet,
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
