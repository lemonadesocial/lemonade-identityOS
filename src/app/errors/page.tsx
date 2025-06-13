import { OryPageParams } from "@ory/nextjs/app";

import { getErrorFromId } from "../../common/error";
import CardWrapper from "../../components/card-wrapper";
import Page from "../../components/page";

export default async function ErrorPage(props: OryPageParams) {
  const searchParams = await props.searchParams;

  const id = searchParams?.id;

  if (!id || typeof id !== "string") {
    return null;
  }

  const { error } = await getErrorFromId(id);

  return (
    <Page>
      <CardWrapper>
        <div style={{ textTransform: "uppercase" }}>{`ERROR: ${error.message}`}</div>
        <div style={{ textAlign: "center" }}>{error.reason}</div>
      </CardWrapper>
    </Page>
  );
}
