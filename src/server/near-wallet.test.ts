import { describe, it, expect, vi, beforeEach } from "vitest";
import nacl from "tweetnacl";
import bs58 from "bs58";

// Mock JWT utils before importing the module under test.
vi.mock("../utils/jwt", () => ({
  sign: vi.fn(async (payload: Record<string, unknown>) => "mock-token-" + JSON.stringify(payload)),
  verify: vi.fn(async (token: string) => JSON.parse(token.replace("mock-token-", ""))),
}));

// Stub global fetch for NEAR RPC calls.
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import {
  getNearWalletMessageWithToken,
  verifyNearWalletSignature,
  fetchAccountEd25519Keys,
} from "./near-wallet";

beforeEach(() => {
  vi.stubEnv("JWT_SECRET", "test-secret");
  vi.stubEnv("NEAR_RPC_URL", "https://rpc.testnet.near.org");
  mockFetch.mockReset();
});

// Helper: generate an ed25519 keypair and return accountId + signing helpers.
const makeKeyPair = () => {
  const kp = nacl.sign.keyPair();
  const implicitAccountId = Buffer.from(kp.publicKey).toString("hex");
  const signMessage = (msg: string) => bs58.encode(nacl.sign.detached(Buffer.from(msg), kp.secretKey));
  const publicKeyBase58 = bs58.encode(kp.publicKey);
  return { kp, implicitAccountId, signMessage, publicKeyBase58 };
};

// Helper: create a valid challenge token for a given wallet + message.
const makeToken = (nearWallet: string, message: string) =>
  "mock-token-" + JSON.stringify({ near_wallet: nearWallet, nonce: "test-nonce", message });

describe("getNearWalletMessageWithToken", () => {
  it("returns a message containing the wallet address and a token", async () => {
    const result = await getNearWalletMessageWithToken("alice.near");
    expect(result.message).toContain("alice.near");
    expect(result.token).toBeDefined();
  });
});

describe("fetchAccountEd25519Keys", () => {
  it("returns ed25519 public key bytes from RPC response", async () => {
    const { publicKeyBase58 } = makeKeyPair();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        jsonrpc: "2.0",
        result: {
          keys: [
            { public_key: `ed25519:${publicKeyBase58}`, access_key: { nonce: 0, permission: "FullAccess" } },
          ],
        },
      }),
    });

    const keys = await fetchAccountEd25519Keys("alice.testnet");
    expect(keys).toHaveLength(1);
    expect(keys[0]).toHaveLength(32);
  });

  it("filters out non-ed25519 keys", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        jsonrpc: "2.0",
        result: {
          keys: [
            { public_key: "secp256k1:AAAA", access_key: { nonce: 0, permission: "FullAccess" } },
          ],
        },
      }),
    });

    const keys = await fetchAccountEd25519Keys("alice.testnet");
    expect(keys).toHaveLength(0);
  });

  it("throws on RPC error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        jsonrpc: "2.0",
        error: { name: "UNKNOWN_ACCOUNT", cause: { name: "UNKNOWN_ACCOUNT" } },
      }),
    });

    await expect(fetchAccountEd25519Keys("nonexistent.testnet")).rejects.toThrow("NEAR RPC error");
  });

  it("throws on HTTP failure", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    await expect(fetchAccountEd25519Keys("alice.testnet")).rejects.toThrow("NEAR RPC request failed: 500");
  });
});

describe("verifyNearWalletSignature", () => {
  describe("implicit accounts", () => {
    it("accepts a valid signature from the implicit account key", async () => {
      const { implicitAccountId, signMessage } = makeKeyPair();
      const message = "test challenge message";
      const sig = signMessage(message);
      const token = makeToken(implicitAccountId, message);

      // Implicit accounts don't need fetch — no RPC call expected.
      await expect(
        verifyNearWalletSignature(implicitAccountId, sig, token),
      ).resolves.toBeUndefined();

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("rejects an invalid signature for an implicit account", async () => {
      const { implicitAccountId } = makeKeyPair();
      const other = makeKeyPair();
      const message = "test challenge message";
      const wrongSig = other.signMessage(message);
      const token = makeToken(implicitAccountId, message);

      await expect(
        verifyNearWalletSignature(implicitAccountId, wrongSig, token),
      ).rejects.toThrow("Invalid NEAR wallet signature");
    });
  });

  describe("named accounts", () => {
    it("accepts a valid signature when the key is on the account", async () => {
      const { signMessage, publicKeyBase58 } = makeKeyPair();
      const accountId = "alice.quesea.testnet";
      const message = "test challenge message";
      const sig = signMessage(message);
      const token = makeToken(accountId, message);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: "2.0",
          result: {
            keys: [
              { public_key: `ed25519:${publicKeyBase58}`, access_key: { nonce: 0, permission: "FullAccess" } },
            ],
          },
        }),
      });

      await expect(
        verifyNearWalletSignature(accountId, sig, token),
      ).resolves.toBeUndefined();
    });

    it("accepts when the matching key is not the first key", async () => {
      const { signMessage, publicKeyBase58 } = makeKeyPair();
      const decoy = makeKeyPair();
      const accountId = "alice.quesea.testnet";
      const message = "test challenge message";
      const sig = signMessage(message);
      const token = makeToken(accountId, message);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: "2.0",
          result: {
            keys: [
              { public_key: `ed25519:${decoy.publicKeyBase58}`, access_key: { nonce: 0, permission: "FullAccess" } },
              { public_key: `ed25519:${publicKeyBase58}`, access_key: { nonce: 0, permission: "FullAccess" } },
            ],
          },
        }),
      });

      await expect(
        verifyNearWalletSignature(accountId, sig, token),
      ).resolves.toBeUndefined();
    });

    it("rejects when the signing key is not on the account", async () => {
      const signer = makeKeyPair();
      const onChainKey = makeKeyPair();
      const accountId = "alice.quesea.testnet";
      const message = "test challenge message";
      const sig = signer.signMessage(message);
      const token = makeToken(accountId, message);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: "2.0",
          result: {
            keys: [
              { public_key: `ed25519:${onChainKey.publicKeyBase58}`, access_key: { nonce: 0, permission: "FullAccess" } },
            ],
          },
        }),
      });

      await expect(
        verifyNearWalletSignature(accountId, sig, token),
      ).rejects.toThrow("NEAR wallet signature does not match any key on the account");
    });

    it("rejects when the account has no ed25519 keys", async () => {
      const signer = makeKeyPair();
      const accountId = "alice.quesea.testnet";
      const message = "test challenge message";
      const sig = signer.signMessage(message);
      const token = makeToken(accountId, message);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: "2.0",
          result: { keys: [] },
        }),
      });

      await expect(
        verifyNearWalletSignature(accountId, sig, token),
      ).rejects.toThrow("No ed25519 keys found for NEAR account");
    });

    it("rejects when the account does not exist", async () => {
      const signer = makeKeyPair();
      const accountId = "nonexistent.testnet";
      const message = "test challenge message";
      const sig = signer.signMessage(message);
      const token = makeToken(accountId, message);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: "2.0",
          error: { name: "UNKNOWN_ACCOUNT", cause: { name: "UNKNOWN_ACCOUNT" } },
        }),
      });

      await expect(
        verifyNearWalletSignature(accountId, sig, token),
      ).rejects.toThrow("NEAR RPC error");
    });
  });

  it("rejects when the token wallet does not match the claimed wallet", async () => {
    const { signMessage } = makeKeyPair();
    const message = "test challenge message";
    const sig = signMessage(message);
    // Token was issued for a different wallet
    const token = makeToken("bob.testnet", message);

    await expect(
      verifyNearWalletSignature("alice.testnet", sig, token),
    ).rejects.toThrow("NEAR wallet mismatch in token");
  });
});
