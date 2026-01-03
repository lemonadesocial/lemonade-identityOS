import { mainnet } from "wagmi/chains";
import { createThirdwebClient, defineChain } from "thirdweb";

const thirdwebClientId =
  process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "";

const client = createThirdwebClient({
  clientId: thirdwebClientId,
});

const chain = defineChain(mainnet.id);

export { client, chain };
