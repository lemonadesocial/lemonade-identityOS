const request = async <T>(uri: string): Promise<T> => {
  const response = await fetch(uri, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return (await response.json()) as T;
};

//-- the API definitions go here
export const getUserWalletRequest = (wallet: string) =>
  request<{ message: string; token: string }>(`/api/wallet?${new URLSearchParams({ wallet })}`);
