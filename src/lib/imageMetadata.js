export const DEFAULT_FOLDER = '默认';

export function normalizeFolderName(value) {
  const raw = typeof value === 'string' ? value.trim() : '';

  if (!raw) {
    return DEFAULT_FOLDER;
  }

  return raw
    .split('/')
    .map((segment) => segment.trim().replace(/[\\:*?"<>|]/g, '-'))
    .filter(Boolean)
    .join('/') || DEFAULT_FOLDER;
}

export function normalizeDisplayName(name, fallback = 'image') {
  const raw = typeof name === 'string' ? name.trim() : '';
  const fallbackName = typeof fallback === 'string' && fallback.trim() ? fallback.trim() : 'image';

  if (!raw) {
    return fallbackName;
  }

  const cleaned = raw.replace(/[\\/:*?"<>|]/g, '-');
  const fallbackExt = fallbackName.includes('.') ? fallbackName.slice(fallbackName.lastIndexOf('.')) : '';

  return cleaned.includes('.') || !fallbackExt ? cleaned : `${cleaned}${fallbackExt}`;
}

export async function ensureImageInfoMetadataColumns(database) {
  const { results = [] } = await database.prepare('PRAGMA table_info(imginfo)').all();
  const existingColumns = new Set(results.map((column) => column.name));

  if (!existingColumns.has('name')) {
    await addColumnIfMissing(database, 'ALTER TABLE imginfo ADD COLUMN name text');
  }

  if (!existingColumns.has('folder')) {
    await addColumnIfMissing(database, 'ALTER TABLE imginfo ADD COLUMN folder text');
  }
}

async function addColumnIfMissing(database, sql) {
  try {
    await database.prepare(sql).run();
  } catch (error) {
    if (!String(error?.message || '').toLowerCase().includes('duplicate column')) {
      throw error;
    }
  }
}
