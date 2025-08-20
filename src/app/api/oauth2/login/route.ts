import { NextRequest, NextResponse } from "next/server";

import { getCsrfToken } from "../../../../client/ory";
import { frontendApi } from "../../../../common/ory";
import { TransientPayload } from "../../../../server/ory";
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

  let token: string | undefined;

  const loginFlow = !flowId
    ? await frontendApi.createNativeLoginFlow()
    : await frontendApi.getLoginFlow({ id: flowId });

  const csrf_token = getCsrfToken(loginFlow) ?? "";

  let messages: any[] | undefined;

  try {
    if (identifier && password && transient_payload) {
      //-- process password login
      const flow = await frontendApi.updateLoginFlow({
        flow: loginFlow.id,
        updateLoginFlowBody: {
          method: "password",
          identifier,
          password,
          transient_payload,
        },
      });

      token = flow.session_token;
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

      token = flow.session_token;
    }
  }
  catch (err: any) {
    const errorFLow = await err.response.json();
    messages = errorFLow.ui.messages;
  }

  return NextResponse.json({ flow_id: loginFlow.id, token, error: messages }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const response = await processPost(request);
  return addCorsHeaders(response);
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}
