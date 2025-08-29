import { FarcasterSiwePayload, getFarcasterIdentifier } from "../common/farcaster";
import { verifySiwe } from "../common/siwe";
import { verifySignedNonce } from "./wallet";

export const verifyFarcasterSIWE = async (payload: FarcasterSiwePayload) => {
  await verifySignedNonce(payload.farcaster_siwe_nonce, payload.farcaster_size_nonce_token);

  const siweMessage = await verifySiwe(
    payload.farcaster_siwe_nonce,
    payload.farcaster_siwe_message,
    payload.farcaster_siwe_signature,
  );

  //-- extract fid
  const fid = siweMessage.resources?.[0]?.substring("farcaster://fid/".length);

  return fid ? getFarcasterIdentifier(fid) : undefined;
};
