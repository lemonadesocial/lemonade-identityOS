import { NextRequest, NextResponse } from "next/server";

import { verifyAuthCookie } from "../../../../common/unicorn";
import { getUserByIdentifier } from "../../../../server/ory";
import { addCorsHeaders } from "../../../../server/request";

async function processGet(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cookie = searchParams.get("auth_cookie");

  if (!cookie) {
    return new NextResponse("Auth cookie is required", { status: 400 });
  }

  const authCookie = await verifyAuthCookie(cookie);

  if (!authCookie) {
    return new NextResponse("Invalid auth cookie", { status: 400 });
  }

  const { storedToken } = authCookie;

  //-- check email
  const email = storedToken.authDetails.email.toLocaleLowerCase();
  const wallet = storedToken.authDetails.walletAddress?.toLowerCase();

  const [emailUser, walletUser] = await Promise.all([
    getUserByIdentifier(email),
    wallet ? getUserByIdentifier(wallet) : undefined,
  ]);

  const canLinkEmail = emailUser && !emailUser.traits.unicorn_wallet && !walletUser;
  const canLinkWallet = !canLinkEmail && walletUser && !walletUser.traits.unicorn_wallet;

  return NextResponse.json({
    identityId: walletUser?.id,
    canLink: canLinkEmail || canLinkWallet,
    ...(canLinkEmail && { email }),
    ...(canLinkWallet && { wallet }),
  });
}

//-- check if the unicorn authCookie contains credential that can be used to link to existing account
export async function GET(request: NextRequest) {
  const response = await processGet(request);
  return addCorsHeaders(request, response);
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(request, response);
}
