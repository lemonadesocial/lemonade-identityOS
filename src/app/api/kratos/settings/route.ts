import { NextRequest, NextResponse } from "next/server";

import { ensurePasswordAuth } from "../../../../server/ory";
import { parseRequest } from "../../../../server/request";

export async function POST(request: NextRequest) {
  const { identity } = await parseRequest(request);

  if (identity.traits.farcaster_fid || identity.traits.unicorn_wallet || identity.traits.wallet) {
    await ensurePasswordAuth(identity.id);
  }

  return NextResponse.json({});
}
