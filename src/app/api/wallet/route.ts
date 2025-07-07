import assert from "assert";
import { NextRequest, NextResponse } from "next/server";

import { getWalletMessageWithToken } from "../../../server/wallet";


function addCorsHeaders(response: NextResponse, origin: string | null): NextResponse {
  response.headers.set("Access-Control-Allow-Origin", "*");

  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );

  return response;
}

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

  return addCorsHeaders(nextResponse, request.headers.get("origin"));
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response, request.headers.get("origin"));
}
