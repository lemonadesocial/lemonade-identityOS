import { NextRequest, NextResponse } from "next/server";
import assert from "assert";

import { Session } from "../../../../common/oauth2";
import { frontendApi } from "../../../../common/ory";
import { extendSession } from "../../../../server/ory";
import { addCorsHeaders } from "../../../../server/request";

async function processPost(request: NextRequest) {
  const body = await request.json();

  const cookieName = process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME;

  assert.ok(cookieName);

  const session_token: string | undefined = body.session_token;
  const cookie = request.cookies.get(cookieName)?.value;

  if (!session_token && !cookie) {
    return NextResponse.json({ error: "No session to extend" }, { status: 400 });
  }

  const currentSession = await frontendApi.toSession(
    {
      ...(session_token && { xSessionToken: session_token }),
      ...(cookie && { cookie: `${cookieName}=${cookie}` }),

    },
    { credentials: "include" },
  );

  const extendedSession = await extendSession(currentSession.id);

  const session: Session = {
    token: session_token || "",
    expires_at: extendedSession.expires_at,
  };

  return NextResponse.json({ session }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const response = await processPost(request);
  return addCorsHeaders(request, response);
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(request, response);
}
