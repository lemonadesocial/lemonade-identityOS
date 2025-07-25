import { NextRequest, NextResponse } from "next/server";

import { verifyAuthCookie } from "../../../../common/unicorn";
import { getUserByIdentifier } from "../../../../server/ory";

//-- check if the unicorn authCookie contains credential that can be used to link to existing account
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const authCookie = searchParams.get("auth_cookie");

  if (!authCookie) {
    return new NextResponse("Auth cookie is required", { status: 400 });
  }

  const { storedToken } = verifyAuthCookie(authCookie);

  //-- check email
  const email = storedToken.authDetails.email.toLocaleLowerCase();
  const emailUser = await getUserByIdentifier(email);

  if (emailUser && !emailUser.traits.unicorn_wallet) {
    return NextResponse.json({ canLink: true, email });
  }

  //-- check wallet
  const wallet = storedToken.authDetails.walletAddress?.toLowerCase();

  if (wallet) {
    const walletUser = await getUserByIdentifier(wallet);

    if (walletUser && !walletUser.traits.unicorn_wallet) {
      return NextResponse.json({ canLink: true, wallet });
    }
  }

  return NextResponse.json({ canLink: false });
}
