import { NextRequest, NextResponse } from "next/server";

import { getCsrfToken } from "../../../../client/ory";
import { frontendApi } from "../../../../common/ory";
import { addCorsHeaders } from "../../../../server/request";

async function processPost(request: NextRequest) {
  const body = await request.json();

  const flowId: string | undefined = body.flow_id;
  const code: string | undefined = body.code;
  const email: string | undefined = body.email;

  const verificationFlow = !flowId
    ? await frontendApi.createNativeVerificationFlow({})
    : await frontendApi.getVerificationFlow({ id: flowId });

  const csrf_token = getCsrfToken(verificationFlow) ?? "";

  let messages: any[] | undefined;

  try {
    const updatedFlow = await frontendApi.updateVerificationFlow({
      flow: verificationFlow.id,
      updateVerificationFlowBody: {
        csrf_token,
        method: "code",
        email,
        ...(code && { code }),
      },
    });

    messages = updatedFlow.ui.messages;
  } catch (err: any) {
    const errorFLow = await err.response.json();
    messages = errorFLow.ui.messages;
  }

  return NextResponse.json({ flow_id: verificationFlow.id, error: messages }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const response = await processPost(request);
  return addCorsHeaders(request, response);
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(request, response);
}
