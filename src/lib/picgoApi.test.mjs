import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createPicgoErrorPayload,
  createPicgoSuccessPayload,
  isApiRequestAuthorized,
  normalizePicgoTarget,
} from './picgoApi.js';

test('authorizes PicGo API requests when no token is configured', () => {
  const request = new Request('https://example.com/api/picgo');

  assert.equal(isApiRequestAuthorized(request, {}), true);
});

test('requires a bearer or x-api-token header when API_TOKEN is configured', () => {
  const denied = new Request('https://example.com/api/picgo');
  const bearer = new Request('https://example.com/api/picgo', {
    headers: { Authorization: 'Bearer secret-token' },
  });
  const apiToken = new Request('https://example.com/api/picgo', {
    headers: { 'x-api-token': 'secret-token' },
  });

  assert.equal(isApiRequestAuthorized(denied, { API_TOKEN: 'secret-token' }), false);
  assert.equal(isApiRequestAuthorized(bearer, { API_TOKEN: 'secret-token' }), true);
  assert.equal(isApiRequestAuthorized(apiToken, { API_TOKEN: 'secret-token' }), true);
});

test('normalizes unsupported upload targets to Telegram channel', () => {
  assert.equal(normalizePicgoTarget('r2'), 'r2');
  assert.equal(normalizePicgoTarget('telegram'), 'tgchannel');
  assert.equal(normalizePicgoTarget(''), 'tgchannel');
});

test('creates a PicGo-compatible success payload', () => {
  const payload = createPicgoSuccessPayload({
    url: 'https://example.com/api/cfile/abc',
    name: 'demo.png',
    folder: 'PicGo',
  });

  assert.equal(payload.success, true);
  assert.deepEqual(payload.result, ['https://example.com/api/cfile/abc']);
  assert.equal(payload.data.url, 'https://example.com/api/cfile/abc');
  assert.equal(payload.data.name, 'demo.png');
  assert.equal(payload.data.folder, 'PicGo');
});

test('creates a PicGo-compatible error payload', () => {
  const payload = createPicgoErrorPayload('Unauthorized', 401);

  assert.equal(payload.success, false);
  assert.equal(payload.code, 401);
  assert.deepEqual(payload.result, []);
  assert.deepEqual(payload.data.urls, []);
});
