export function getConfiguredApiToken(env = {}) {
  return env.API_TOKEN || env.PICGO_API_TOKEN || '';
}

export function getRequestApiToken(request) {
  const authHeader = request.headers.get('authorization') || '';
  const bearerPrefix = 'Bearer ';

  if (authHeader.startsWith(bearerPrefix)) {
    return authHeader.slice(bearerPrefix.length).trim();
  }

  return request.headers.get('x-api-token') || '';
}

export function isApiRequestAuthorized(request, env = {}) {
  const configuredToken = getConfiguredApiToken(env);

  if (!configuredToken) {
    return true;
  }

  return getRequestApiToken(request) === configuredToken;
}

export function normalizePicgoTarget(value, fallback = 'tgchannel') {
  const target = String(value || fallback || 'tgchannel').trim().toLowerCase();
  return target === 'r2' ? 'r2' : 'tgchannel';
}

export function createPicgoSuccessPayload(uploadData = {}) {
  const url = uploadData.url || '';

  return {
    success: true,
    code: 0,
    msg: 'success',
    url,
    result: url ? [url] : [],
    data: {
      url,
      urls: url ? [url] : [],
      name: uploadData.name || '',
      folder: uploadData.folder || '',
      raw: uploadData,
    },
  };
}

export function createPicgoErrorPayload(message, status = 500, detail = null) {
  return {
    success: false,
    code: status,
    msg: message || 'Upload failed',
    message: message || 'Upload failed',
    result: [],
    data: {
      urls: [],
      detail,
    },
  };
}
