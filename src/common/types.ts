import { OryClientConfiguration } from "@ory/elements-react";

import { FarcasterJwtPayload, FarcasterSiwePayload } from "./farcaster";
import { EOAWalletPayload } from "./siwe";
import { UnicornAuthCookiePayload } from "./unicorn";

export interface PageProps {
  config: OryClientConfiguration;
}

export type TransientPayload =
  | FarcasterSiwePayload
  | FarcasterJwtPayload
  | EOAWalletPayload
  | UnicornAuthCookiePayload;
