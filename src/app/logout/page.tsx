import { OryPageParams } from "@ory/nextjs/app";
import { redirect } from "next/navigation";

import { oauthApi } from "../../common/ory";

export default async function LogoutPage(props: OryPageParams) {
  const seachParams = await props.searchParams;

  const logoutChallenge = seachParams.logout_challenge?.toString();
  const returnTo = seachParams.return_to?.toString();

  if (!logoutChallenge) {
    return null;
  }

  const { redirect_to } = await oauthApi.acceptOAuth2LogoutRequest({ logoutChallenge });

  return redirect(returnTo || redirect_to);
}
