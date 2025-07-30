import { NextRequest, NextResponse } from "next/server";

import { verifyAuthCookie } from "../../../../common/unicorn";
import { getUserByIdentifier } from "../../../../server/ory";

//-- check if the unicorn authCookie contains credential that can be used to link to existing account
export async function GET(request: NextRequest) {
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
    wallet && getUserByIdentifier(wallet),
  ]);

  const canLinkEmail = emailUser && !emailUser.traits.unicorn_wallet && !walletUser;
  const canLinkWallet = !canLinkEmail && walletUser && !walletUser.traits.unicorn_wallet;

  return NextResponse.json({
    canLink: canLinkEmail || canLinkWallet,
    ...(canLinkEmail && { email }),
    ...(canLinkWallet && { wallet }),
  });
}
