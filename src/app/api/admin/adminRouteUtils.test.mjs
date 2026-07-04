import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildListQueries,
  buildLogQueries,
  getJsonErrorPayload,
  normalizeAdminPayload,
} from './adminRouteUtils.js';

test('normalizes admin pagination and builds parameterized list search queries', () => {
  const payload = normalizeAdminPayload({ page: '2', query: "cat's" });
  const queries = buildListQueries(payload);

  assert.deepEqual(payload, { page: 2, offset: 20, query: "cat's" });
  assert.equal(
    queries.rows.sql,
    "SELECT * FROM imginfo WHERE url LIKE ? OR COALESCE(name, '') LIKE ? OR COALESCE(folder, '') LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?",
  );
  assert.deepEqual(queries.rows.bindings, ["%cat's%", "%cat's%", "%cat's%", 10, 20]);
  assert.equal(queries.total.sql, "SELECT COUNT(*) as total FROM imginfo WHERE url LIKE ? OR COALESCE(name, '') LIKE ? OR COALESCE(folder, '') LIKE ?");
  assert.deepEqual(queries.total.bindings, ["%cat's%", "%cat's%", "%cat's%"]);
});

test('builds parameterized log queries without string interpolation', () => {
  const queries = buildLogQueries(normalizeAdminPayload({ page: -4, query: '' }));

  assert.equal(queries.rows.bindings.at(-1), 0);
  assert.equal(
    queries.rows.sql,
    'SELECT tgimglog.*, imginfo.rating, imginfo.total, imginfo.name, imginfo.folder FROM tgimglog JOIN imginfo ON tgimglog.url = imginfo.url ORDER BY tgimglog.id DESC LIMIT ? OFFSET ?',
  );
  assert.equal(queries.total.sql, 'SELECT COUNT(*) as total FROM tgimglog');
});

test('creates a JSON error payload without reading block-scoped request data', () => {
  const payload = getJsonErrorPayload(new Error('D1 binding missing'));

  assert.deepEqual(payload, {
    code: 500,
    success: false,
    message: 'D1 binding missing',
    data: [],
    page: 0,
    total: 0,
  });
});
