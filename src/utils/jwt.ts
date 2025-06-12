import jwt from "jsonwebtoken";

export const sign = (
  payload: string | Buffer | Record<string, unknown>,
  secretOrPrivateKey: jwt.Secret,
  options: jwt.SignOptions = {},
) => {
  return new Promise<string>((approve, reject) =>
    jwt.sign(
      payload,
      secretOrPrivateKey,
      options,
      function callback(err: unknown, encoded: unknown) {
        if (err) reject(err);
        else approve(encoded as string);
      },
    ),
  );
};

export const verify = <T>(
  token: string,
  secretOrPublicKey: jwt.Secret,
  options: jwt.VerifyOptions = {},
) => {
  return new Promise<T>((approve, reject) =>
    jwt.verify(
      token,
      secretOrPublicKey,
      options,
      function callback(err: unknown, decoded: unknown) {
        if (err) reject(err);
        else approve(decoded as unknown as T);
      },
    ),
  );
};
