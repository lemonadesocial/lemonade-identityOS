import jwt from "jsonwebtoken";

export interface AuthCookie {
  storedToken: {
    isNewUser: boolean; // if user is new then walletAddress is not set
    authDetails: {
      email: string;
      walletAddress?: string;
    };
  };
}

export const decodeAuthCookie = (authCookie: string) => {
  return jwt.decode(authCookie) as AuthCookie;
};
