import { createClient } from "@farcaster/quick-auth";

const client = createClient();

export const FARCASTER_ISSUER = "https://auth.farcaster.xyz";

export const getFarcasterIdentifier = (fid: number) => `farcaster:${fid}`;

export const verifyJwt = (jwt: string, domain: string) => {
  return client.verifyJwt({ token: jwt, domain });
};
