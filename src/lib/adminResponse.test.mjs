import test from 'node:test';
import assert from 'node:assert/strict';
import { readAdminJson } from './adminResponse.js';

test('reports a readable error when an admin endpoint returns plain text', async () => {
  const response = new Response('Internal Server Error', {
    status: 500,
    statusText: 'Internal Server Error',
    headers: {
      'content-type': 'text/plain',
    },
  });

  await assert.rejects(
    () => readAdminJson(response),
    /请求失败 \(500\): Internal Server Error/,
  );
});

test('reports JSON error messages from admin endpoints', async () => {
  const response = Response.json({ success: false, message: 'IMG D1 binding is not configured' }, { status: 500 });

  await assert.rejects(
    () => readAdminJson(response),
    /IMG D1 binding is not configured/,
  );
});
