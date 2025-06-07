import { Configuration, OAuth2Api } from "@ory/client-fetch";

export const oauthApi = new OAuth2Api(
  new Configuration({
    basePath: process.env.HYDRA_ADMIN_URL,
  }),
);
