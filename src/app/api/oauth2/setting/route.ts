import { NextRequest, NextResponse } from "next/server";

import { getCsrfToken } from "../../../../client/ory";
import { frontendApi } from "../../../../common/ory";
import { TransientPayload } from "../../../../common/types";
import { addCorsHeaders } from "../../../../server/request";

async function processPost(request: NextRequest) {
  const body = await request.json();

  const flowId: string | undefined = body.flow_id;
  const traits: any = body.traits;
  const session_token: string | undefined = body.session_token;
  const transient_payload = body.transient_payload as TransientPayload | undefined;

  const settingFlow = !flowId
    ? await frontendApi.createNativeSettingsFlow({ xSessionToken: session_token })
    : await frontendApi.getSettingsFlow({ id: flowId, xSessionToken: session_token });

  const csrf_token = getCsrfToken(settingFlow) ?? "";

  let messages: any[] | undefined;

  try {
    if (traits) {
      const updatedFlow = await frontendApi.updateSettingsFlow({
        flow: settingFlow.id,
        updateSettingsFlowBody: {
          csrf_token,
          method: "profile",
          traits,
          transient_payload,
        },
        xSessionToken: session_token,
      });

      messages = updatedFlow.ui.messages;
    }
  } catch (err: any) {
    const errorFLow = await err.response.json();
    messages = errorFLow.ui.messages;
  }

  return NextResponse.json({ flow_id: settingFlow.id, error: messages }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const response = await processPost(request);
  return addCorsHeaders(response);
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}
