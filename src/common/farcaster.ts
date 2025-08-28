import { createClient } from "@farcaster/quick-auth";

const client = createClient();

export const FARCASTER_ISSUER = "https://auth.farcaster.xyz";

export const getFarcasterIdentifier = (fid: number | string) => `farcaster:${fid}`;

export interface FarcasterSiwePayload {
  farcaster_siwe_message: string;
  farcaster_siwe_signature: string;
  farcaster_siwe_nonce: string;
  farcaster_size_nonce_token: string;
}

export interface FarcasterJwtPayload {
  farcaster_jwt: string;
  farcaster_app_hostname: string;
}

export const verifyJwt = (jwt: string, domain: string) => {
  return client.verifyJwt({ token: jwt, domain });
};
