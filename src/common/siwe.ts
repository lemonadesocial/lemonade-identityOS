import { SiweMessage } from "siwe";
import { verifyMessage } from "viem";

export type EOAWalletPayload = {
  wallet_signature: string;
  wallet_signature_token: string;
};

export async function verifySiwe(nonce: string, message: string, signature: string) {
  // Parse SIWE message
  const siweMessage = new SiweMessage(message);

  // Step 1: Verify the signature
  const recoveredAddress = await verifyMessage({
    address: siweMessage.address as `0x${string}`,
    message: siweMessage.prepareMessage(),
    signature: signature as `0x${string}`,
  });

  if (!recoveredAddress) {
    throw new Error("Invalid signature");
  }

  // Step 2: Validate nonce & expiration
  if (siweMessage.nonce !== nonce) {
    throw new Error("Nonce mismatch");
  }

  const now = new Date();

  if (siweMessage.expirationTime && now > new Date(siweMessage.expirationTime)) {
    throw new Error("Message expired");
  }

  return siweMessage;
}
