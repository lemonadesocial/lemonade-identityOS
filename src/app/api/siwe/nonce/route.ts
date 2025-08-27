import { NextResponse } from "next/server";

import { addCorsHeaders } from "../../../../server/request";
import { getSignedNonce } from "../../../../server/wallet";

export async function GET() {
  const response = await getSignedNonce();
  return addCorsHeaders(NextResponse.json(response));
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}
