import jwt from "jsonwebtoken";
import jwtToPem from "jwk-to-pem";

import { getOrSetMemoryCache } from "../utils/cache";

export type UnicornAuthCookiePayload = {
  unicorn_auth_cookie: string;
};

export interface AuthCookie {
  storedToken: {
    jwtToken: string;
    isNewUser: boolean; // if user is new then walletAddress is not set
    authDetails: {
      email: string;
      walletAddress?: string;
    };
  };
}

const UNICORN_ISS = "embedded-wallet.thirdweb.com";
const UNICORN_JWK = "https://in-app-wallet.thirdweb.com/.well_known/jwks.json";

const getJwtPublicKey = async () => {
  const response = await getOrSetMemoryCache(
    "UNICORN_JWT_PUBLIC_KEY",
    async () => {
      const response = await fetch(UNICORN_JWK);
      const data = await response.json();
      return data as { keys: { kty: "RSA"; n: string; e: string; kid: string }[] };
    },
    3600000, // 1 hours
  );

  return jwtToPem(response.keys[0]);
};

export const decodeAuthCookie = (authCookie: string) => {
  return jwt.decode(authCookie) as AuthCookie;
};

export const verifyAuthCookie = async (authCookie: string) => {
  try {
    const decoded = decodeAuthCookie(authCookie);

    if (!decoded) {
      return undefined;
    }

    const token = decoded.storedToken.jwtToken;
    const publicKey = await getJwtPublicKey();

    const payload = jwt.verify(token, publicKey) as { iss: string };

    if (payload.iss !== UNICORN_ISS) {
      return undefined;
    }

    return decoded;
  } catch {
    return undefined;
  }
};
