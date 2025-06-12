import { Configuration, OAuth2Api, FrontendApi } from "@ory/client-fetch";

export const oauthApi = new OAuth2Api(
  new Configuration({
    basePath: process.env.HYDRA_ADMIN_URL,
  }),
);

export const frontendApi = new FrontendApi(new Configuration({
  basePath: process.env.NEXT_PUBLIC_ORY_SDK_URL,
}));
