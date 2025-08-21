import { NextRequest, NextResponse } from "next/server";

import { Session } from "../../../../common/oauth2";
import { frontendApi } from "../../../../common/ory";
import { extendSession } from "../../../../server/ory";
import { addCorsHeaders } from "../../../../server/request";

async function processPost(request: NextRequest) {
  const body = await request.json();

  const session_token: string | undefined = body.session_token;

  if (!session_token) {
    return NextResponse.json({ error: "session_token is required" }, { status: 400 });
  }

  const currentSession = await frontendApi.toSession({ xSessionToken: session_token });

  const extendedSession = await extendSession(currentSession.id);

  const session: Session = {
    token: session_token,
    expires_at: extendedSession.expires_at,
  };

  return NextResponse.json({ session }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const response = await processPost(request);
  return addCorsHeaders(response);
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}
