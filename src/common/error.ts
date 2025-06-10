export async function getErrorFromId(id: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ORY_SDK_URL}/self-service/errors?id=${id}`,
  );

  return await response.json() as { error: { code: number; reason: string; message: string } };
}
