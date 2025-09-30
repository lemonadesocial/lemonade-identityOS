import { NextRequest, NextResponse } from "next/server";

import { addCorsHeaders } from "../../../../server/request";
import { getSignedNonce } from "../../../../server/wallet";

export async function GET(request: NextRequest) {
  const response = await getSignedNonce();
  return addCorsHeaders(request, NextResponse.json(response));
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(request, response);
}
