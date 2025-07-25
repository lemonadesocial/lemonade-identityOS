import assert from "assert";
import { NextRequest, NextResponse } from "next/server";

import { addCorsHeaders } from "../../../server/request";
import { getWalletMessageWithToken } from "../../../server/wallet";

export async function GET(request: NextRequest) {
  const jwtSecret = process.env.JWT_SECRET;
  assert.ok(jwtSecret, "JWT_SECRET is missing");

  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");

  if (!wallet) {
    return new NextResponse("Wallet is required", { status: 400 });
  }

  const response = await getWalletMessageWithToken(wallet);
  const nextResponse = NextResponse.json(response);

  return addCorsHeaders(nextResponse);
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}
