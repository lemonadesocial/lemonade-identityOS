import { getServerSession } from "@ory/nextjs/app";
import { SessionProvider } from "@ory/elements-react/client";

import HomeUI from "./home/ui";

export default async function RootLayout() {
  const session = await getServerSession();

  return (
    <SessionProvider session={session}>
      <HomeUI session={session} />
    </SessionProvider>
  );
}
