export const runtime = 'edge';

import { getRequestContext } from '@cloudflare/next-on-pages';
import { POST as uploadToR2 } from '@/app/api/enableauthapi/r2/route';
import { POST as uploadToTelegramChannel } from '@/app/api/enableauthapi/tgchannel/route';
import {
  createPicgoErrorPayload,
  createPicgoSuccessPayload,
  isApiRequestAuthorized,
  normalizePicgoTarget,
} from '@/lib/picgoApi';
import {
  normalizeDisplayName,
  normalizeFolderName,
} from '@/lib/imageMetadata';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-API-Token',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json',
};

const fileFieldNames = ['file', 'image', 'img', 'source', 'smfile'];

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(request) {
  const { env } = getRequestContext();
  const reqUrl = new URL(request.url);

  return Response.json({
    success: true,
    name: 'Telegraph Image PicGo API',
    endpoint: `${reqUrl.origin}/api/picgo`,
    method: 'POST',
    auth: {
      required: Boolean(env.API_TOKEN || env.PICGO_API_TOKEN),
      headers: ['Authorization: Bearer <API_TOKEN>', 'X-API-Token: <API_TOKEN>'],
    },
    formData: {
      file: 'required; also accepts image, img, source, smfile',
      target: 'optional; tgchannel or r2; default tgchannel',
      folder: 'optional; virtual folder shown in admin',
      name: 'optional; display filename',
    },
    responsePaths: {
      picgo: 'result[0]',
      generic: 'data.url',
    },
  }, {
    headers: corsHeaders,
  });
}

export async function POST(request) {
  const { env } = getRequestContext();

  if (!isApiRequestAuthorized(request, env)) {
    return Response.json(
      createPicgoErrorPayload('Unauthorized. Set Authorization: Bearer <API_TOKEN> or X-API-Token.', 401),
      {
        status: 401,
        headers: corsHeaders,
      }
    );
  }

  let formData;

  try {
    formData = await request.formData();
  } catch (error) {
    return Response.json(
      createPicgoErrorPayload('Request body must be multipart/form-data.', 400, error.message),
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  const uploadFile = getUploadFile(formData);

  if (!uploadFile) {
    return Response.json(
      createPicgoErrorPayload('Missing file. Use form-data field "file".', 400),
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  const reqUrl = new URL(request.url);
  const target = normalizePicgoTarget(formData.get('target') || reqUrl.searchParams.get('target') || env.PICGO_UPLOAD_TARGET);
  const folder = normalizeFolderName(formData.get('folder') || reqUrl.searchParams.get('folder'));
  const requestedName = formData.get('name') || formData.get('filename') || uploadFile.name || 'picgo-upload';
  const displayName = normalizeDisplayName(String(requestedName), uploadFile.name || 'picgo-upload');
  const uploadBody = new FormData();
  const uploadRequest = createUploadRequest(request, reqUrl, target, uploadBody, uploadFile, displayName, folder);
  const uploadResponse = target === 'r2'
    ? await uploadToR2(uploadRequest)
    : await uploadToTelegramChannel(uploadRequest);
  const uploadData = await readJson(uploadResponse);

  if (!uploadResponse.ok || !uploadData?.url) {
    return Response.json(
      createPicgoErrorPayload(uploadData?.message || uploadData?.msg || 'Upload failed.', uploadResponse.status, uploadData),
      {
        status: uploadResponse.status || 500,
        headers: corsHeaders,
      }
    );
  }

  return Response.json(createPicgoSuccessPayload({
    ...uploadData,
    name: uploadData.name || displayName,
    folder: uploadData.folder || folder,
    target,
  }), {
    headers: corsHeaders,
  });
}

function getUploadFile(formData) {
  for (const fieldName of fileFieldNames) {
    const value = formData.get(fieldName);

    if (isFileLike(value)) {
      return value;
    }
  }

  for (const value of formData.values()) {
    if (isFileLike(value)) {
      return value;
    }
  }

  return null;
}

function isFileLike(value) {
  return value && typeof value === 'object' && typeof value.arrayBuffer === 'function' && typeof value.name === 'string';
}

function createUploadRequest(request, reqUrl, target, uploadBody, uploadFile, displayName, folder) {
  uploadBody.append('file', uploadFile, displayName);
  uploadBody.append('folder', folder);

  const headers = new Headers();
  const referer = request.headers.get('referer');
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (referer) {
    headers.set('referer', referer);
  }

  if (forwardedFor) {
    headers.set('x-forwarded-for', forwardedFor);
  }

  if (realIp) {
    headers.set('x-real-ip', realIp);
  }

  return new Request(`${reqUrl.origin}/api/enableauthapi/${target}`, {
    method: 'POST',
    headers,
    body: uploadBody,
  });
}

async function readJson(response) {
  try {
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}
