import { FarcasterSiwePayload, getFarcasterIdentifier } from "../common/farcaster";
import { verifySiwe } from "../common/siwe";
import { verifySignedNonce } from "./wallet";

export const verifyFarcasterSIWE = async (payload: FarcasterSiwePayload) => {
  await verifySignedNonce(payload.nonce, payload.token);

  const siweMessage = await verifySiwe(payload.nonce, payload.message, payload.signature);

  //-- extract fid
  const fid = siweMessage.resources?.[0]?.substring("farcaster://fid/".length);

  return fid ? getFarcasterIdentifier(fid) : undefined;
};
