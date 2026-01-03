import { NextRequest, NextResponse } from "next/server";

import { parseRequest } from "../../../../../server/request";

export async function POST(request: NextRequest) {
  const body = await parseRequest(request);

  return NextResponse.json({ test: true });
}
