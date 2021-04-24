export async function get<T>(url: string): Promise<T> {
  const response = await fetch(url);
  return response.json();
}
