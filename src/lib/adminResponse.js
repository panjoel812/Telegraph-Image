export async function readAdminJson(response) {
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`请求失败 (${response.status}): ${text || response.statusText}`);
  }

  const data = await response.json();

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || `请求失败 (${response.status})`);
  }

  return data;
}
