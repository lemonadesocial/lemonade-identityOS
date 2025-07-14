import { getServerSession, OryPageParams } from "@ory/nextjs/app";
import { redirect } from "next/navigation";

import { oauthApi } from "../../common/ory";

export default async function ConsentPage(props: OryPageParams) {
  const [seachParams, session] = await Promise.all([props.searchParams, getServerSession()]);

  const consentChallenge = seachParams.consent_challenge?.toString();

  if (!session || !consentChallenge) {
    return null;
  }

  const consentRequest = await oauthApi.getOAuth2ConsentRequest({ consentChallenge });

  const acceptResponse = await oauthApi.acceptOAuth2ConsentRequest({
    consentChallenge,
    acceptOAuth2ConsentRequest: {
      grant_scope: consentRequest.requested_scope,
      grant_access_token_audience: consentRequest.requested_access_token_audience,
      session: {
        access_token: {
          session: session.id,
        },
        id_token: {
          session: session.id,
        },
      },
    },
  });

  return redirect(acceptResponse.redirect_to);
}
