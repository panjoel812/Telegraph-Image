import test from 'node:test';
import assert from 'node:assert/strict';
import { getImageDatabase } from './cloudflareBindings.js';

test('uses DB as the preferred D1 binding name', () => {
  const db = { name: 'db-binding' };
  const img = { name: 'legacy-img-binding' };

  assert.equal(getImageDatabase({ DB: db, IMG: img }), db);
});

test('falls back to the legacy IMG binding name', () => {
  const img = { name: 'legacy-img-binding' };

  assert.equal(getImageDatabase({ IMG: img }), img);
});

test('throws a clear error when no D1 binding is configured', () => {
  assert.throws(
    () => getImageDatabase({}),
    /D1 database binding is not configured. Bind your database as DB or IMG./,
  );
});
