import { NextRequest, NextResponse } from "next/server";

import { getCsrfToken } from "../../../../client/ory";
import { Session } from "../../../../common/oauth2";
import { frontendApi } from "../../../../common/ory";
import { TransientPayload } from "../../../../common/types";
import { addCorsHeaders } from "../../../../server/request";

async function processPost(request: NextRequest) {
  const body = await request.json();

  const flowId: string | undefined = body.flow_id;
  const identifier: string | undefined = body.identifier;
  const method: string | undefined = body.method;
  const code: string | undefined = body.code;
  const resend: boolean | undefined = body.resend;
  const password: string | undefined = body.password;
  const transient_payload = body.transient_payload as TransientPayload | undefined;

  let session: Session | undefined;

  const loginFlow = !flowId
    ? await frontendApi.createNativeLoginFlow()
    : await frontendApi.getLoginFlow({ id: flowId });

  const csrf_token = getCsrfToken(loginFlow) ?? "";

  let messages: any[] | undefined;

  try {
    if (identifier && password && transient_payload) {
      const flow = await frontendApi.updateLoginFlow({
        flow: loginFlow.id,
        updateLoginFlowBody: {
          method: "password",
          identifier,
          password,
          transient_payload,
        },
      });

      if (flow.session_token && flow.session.expires_at) {
        session = { token: flow.session_token, expires_at: flow.session.expires_at.toISOString() };
      }
    } else if (identifier && method === "code") {
      const flow = await frontendApi.updateLoginFlow({
        flow: loginFlow.id,
        updateLoginFlowBody: {
          csrf_token,
          method,
          identifier,
          ...(resend && { resend: "code" }),
          ...(code && { code }),
        },
      });

      if (flow.session_token && flow.session.expires_at) {
        session = { token: flow.session_token, expires_at: flow.session.expires_at.toISOString() };
      }
    }
  } catch (err: any) {
    const errorFLow = await err.response.json();
    messages = errorFLow.ui.messages;
  }

  return NextResponse.json({ flow_id: loginFlow.id, session, error: messages }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const response = await processPost(request);
  return addCorsHeaders(request, response);
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(request, response);
}
