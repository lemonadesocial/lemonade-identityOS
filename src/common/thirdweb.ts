import { mainnet } from "wagmi/chains";
import { createThirdwebClient, defineChain } from "thirdweb";

const thirdwebClientId =
  process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "4e8c81182c3709ee441e30d776223354";

const client = createThirdwebClient({
  clientId: thirdwebClientId,
});

const chain = defineChain(mainnet.id);

export { client, chain };
