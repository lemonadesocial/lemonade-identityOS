import { NextRequest, NextResponse } from "next/server";

import { TransientPayload } from "../common/types";
import { Identity } from "./ory";

export function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set("Access-Control-Allow-Origin", "*");

  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );

  return response;
}

export const parseRequest = async (request: NextRequest) => {
  const payload: {
    identity: Identity,
    transient_payload?: TransientPayload;
  } = await request.json();

  return payload;
};

export const returnError = (message: string) => {
  return new NextResponse(
    JSON.stringify({
      messages: [
        {
          messages: [
            {
              id: 1,
              text: message,
              type: "error",
            },
          ],
        },
      ],
    }),
    {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
};
