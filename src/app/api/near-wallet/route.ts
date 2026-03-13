import { NextRequest, NextResponse } from "next/server";

import { addCorsHeaders } from "../../../server/request";
import { getNearWalletMessageWithToken } from "../../../server/near-wallet";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");

  if (!wallet) {
    return new NextResponse("NEAR wallet is required", { status: 400 });
  }

  const response = await getNearWalletMessageWithToken(wallet);
  return addCorsHeaders(NextResponse.json(response));
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}
