export async function getErrorFromId(id: string) {
  const response = await fetch(`${process.env.ORY_SDK_URL}/admin/self-service/errors?id=${id}`);

  return response.json();
}
