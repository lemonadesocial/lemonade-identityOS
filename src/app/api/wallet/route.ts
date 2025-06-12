import assert from "assert";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { sign } from "../../../utils/jwt";

export async function GET(request: NextRequest) {
  assert.ok(process.env.JWT_SECRET);

  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");

  if (!wallet) {
    return new NextResponse("Wallet is required", { status: 400 });
  }

  const nonce = randomUUID();
  const message = `Sign this message to attach your wallet to your Lemonade account.\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nWallet address:\n${wallet}\n\nNonce:\n${nonce}`;

  return NextResponse.json({
    message,
    token: await sign({ wallet, nonce, message }, process.env.JWT_SECRET, { expiresIn: 3600 }),
  });
}
