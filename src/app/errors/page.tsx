import {} from "@ory/client-fetch";
import { OryPageParams } from "@ory/nextjs/app";

import { getErrorFromId } from "../../common/error";

export default async function ErrorPage(props: OryPageParams) {
  const searchParams = await props.searchParams;

  const id = searchParams?.id;

  if (!id || typeof id !== "string") {
    return <div>No error id</div>;
  }

  const error = await getErrorFromId(id);

  return <div>{JSON.stringify(error)}</div>;
}
