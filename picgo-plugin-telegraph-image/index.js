'use strict';

const http = require('http');
const https = require('https');

const uploaderName = 'telegraph-image';
const defaultEndpoint = 'https://your-domain.example.com/api/picgo';

const config = (ctx) => {
  const userConfig = getUserConfig(ctx);

  return [
    {
      name: 'endpoint',
      type: 'input',
      required: true,
      default: userConfig.endpoint || defaultEndpoint,
      message: '上传 API 地址，例如 https://image.example.com/api/picgo',
    },
    {
      name: 'token',
      type: 'password',
      required: false,
      default: userConfig.token || '',
      message: 'API_TOKEN，留空则不发送鉴权 Header',
    },
    {
      name: 'target',
      type: 'list',
      required: true,
      default: userConfig.target || 'tgchannel',
      choices: ['tgchannel', 'r2'],
      message: '上传目标',
    },
    {
      name: 'folder',
      type: 'input',
      required: false,
      default: userConfig.folder || 'PicGo',
      message: '后台虚拟文件夹',
    },
  ];
};

const handle = async (ctx) => {
  const userConfig = getUserConfig(ctx);
  const endpoint = normalizeEndpoint(userConfig.endpoint);
  const token = userConfig.token || '';
  const target = userConfig.target || 'tgchannel';
  const folder = userConfig.folder || 'PicGo';
  const output = ctx.output || [];

  if (!endpoint) {
    throw new Error('请先配置 Telegraph Image API 地址');
  }

  for (const item of output) {
    const fileName = getFileName(item);
    const buffer = getFileBuffer(item);

    if (!buffer) {
      throw new Error(`无法读取待上传文件：${fileName}`);
    }

    const response = await uploadToTelegraphImage({
      endpoint,
      token,
      target,
      folder,
      fileName,
      buffer,
      contentType: getContentType(item),
    });
    const imageUrl = getImageUrl(response);

    if (!imageUrl) {
      throw new Error(`上传失败：${response.message || response.msg || '响应中没有 URL'}`);
    }

    item.imgUrl = imageUrl;
    item.url = imageUrl;
  }

  return ctx;
};

module.exports = (ctx) => {
  const register = () => {
    ctx.helper.uploader.register(uploaderName, {
      handle,
      config,
    });
  };

  return {
    register,
    uploader: uploaderName,
  };
};

function getUserConfig(ctx) {
  return ctx.getConfig(`picBed.${uploaderName}`) || {};
}

function normalizeEndpoint(endpoint) {
  const value = String(endpoint || '').trim();

  if (!value || value === defaultEndpoint) {
    return '';
  }

  return value.replace(/\/+$/, '');
}

function getFileName(item) {
  const extname = item.extname || '';
  return item.fileName || `picgo-${Date.now()}${extname}`;
}

function getFileBuffer(item) {
  if (Buffer.isBuffer(item.buffer)) {
    return item.buffer;
  }

  if (item.buffer) {
    return Buffer.from(item.buffer);
  }

  if (item.base64Image) {
    const base64 = String(item.base64Image).includes(',')
      ? String(item.base64Image).split(',').pop()
      : item.base64Image;
    return Buffer.from(base64, 'base64');
  }

  return null;
}

function getContentType(item) {
  const extname = String(item.extname || '').toLowerCase();
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
    '.svg': 'image/svg+xml',
    '.heic': 'image/heic',
    '.heif': 'image/heif',
  };

  return contentTypes[extname] || 'application/octet-stream';
}

async function uploadToTelegraphImage({ endpoint, token, target, folder, fileName, buffer, contentType }) {
  const boundary = `----picgo-telegraph-image-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const body = createMultipartBody({
    boundary,
    fields: {
      target,
      folder,
      name: fileName,
    },
    file: {
      fieldName: 'file',
      fileName,
      contentType,
      buffer,
    },
  });
  const headers = {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': String(body.length),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return requestJson(endpoint, {
    method: 'POST',
    headers,
    body,
  });
}

function createMultipartBody({ boundary, fields, file }) {
  const chunks = [];

  for (const [name, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    chunks.push(toBuffer(`--${boundary}\r\n`));
    chunks.push(toBuffer(`Content-Disposition: form-data; name="${escapeHeaderValue(name)}"\r\n\r\n`));
    chunks.push(toBuffer(`${value}\r\n`));
  }

  chunks.push(toBuffer(`--${boundary}\r\n`));
  chunks.push(toBuffer(`Content-Disposition: form-data; name="${escapeHeaderValue(file.fieldName)}"; filename="${escapeHeaderValue(file.fileName)}"\r\n`));
  chunks.push(toBuffer(`Content-Type: ${file.contentType}\r\n\r\n`));
  chunks.push(file.buffer);
  chunks.push(toBuffer('\r\n'));
  chunks.push(toBuffer(`--${boundary}--\r\n`));

  return Buffer.concat(chunks);
}

function toBuffer(value) {
  return Buffer.from(String(value), 'utf8');
}

function escapeHeaderValue(value) {
  return String(value).replace(/"/g, '\\"');
}

function requestJson(endpoint, options) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint);
    const client = url.protocol === 'http:' ? http : https;
    const request = client.request(url, {
      method: options.method,
      headers: options.headers,
    }, (response) => {
      const chunks = [];

      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let data;

        try {
          data = JSON.parse(text);
        } catch (error) {
          reject(new Error(`上传接口没有返回 JSON：${text.slice(0, 160)}`));
          return;
        }

        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(data.message || data.msg || `HTTP ${response.statusCode}`));
          return;
        }

        resolve(data);
      });
    });

    request.on('error', reject);
    request.write(options.body);
    request.end();
  });
}

function getImageUrl(response) {
  return response?.data?.url || response?.url || response?.result?.[0] || '';
}
