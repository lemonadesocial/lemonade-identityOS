const request = async <T>(uri: string, method: "GET" | "POST" = "GET", body?: any): Promise<T> => {
  const response = await fetch(uri, {
    method,
    ...(body && {
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    }),
  });

  return (await response.json()) as T;
};

//-- the API definitions go here
export const getUserWalletRequest = (wallet: string) =>
  request<{ message: string; token: string }>(`/api/wallet?${new URLSearchParams({ wallet })}`);

export const getUnicornCanLink = (cookie: string) =>
  request<{ canLink: boolean; wallet?: string; email?: string }>(
    `/api/unicorn/canlink?auth_cookie=${cookie}`,
  );

export const linkUnicornWallet = (identifier: string, cookie: string) =>
  request(`/api/unicorn/link`, "POST", { identifier, auth_cookie: cookie });
