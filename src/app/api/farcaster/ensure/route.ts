import { NextRequest, NextResponse } from "next/server";

import { FarcasterSiwePayload } from "../../../../common/farcaster";
import { dummyWalletPassword } from "../../../../common/ory";

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

  const { id, credentials, ...rest } = identity;

  await updateIdentity(id, {
    ...rest,
    credentials: {
      //-- the account may not have password set, we should reset it anyway
      password: {
        config: {
          password: dummyWalletPassword,
        },
      },
    },
  });

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
