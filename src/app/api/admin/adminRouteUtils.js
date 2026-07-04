export const PAGE_SIZE = 10;

export const jsonHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json',
};

export function normalizeAdminPayload(body = {}) {
  const pageNumber = Number.parseInt(body.page, 10);
  const page = Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 0;
  const query = typeof body.query === 'string' ? body.query.trim() : '';

  return {
    page,
    offset: page * PAGE_SIZE,
    query,
  };
}

export function buildListQueries({ query, offset }) {
  if (query) {
    const likeQuery = `%${query}%`;

    return {
      rows: {
        sql: "SELECT * FROM imginfo WHERE url LIKE ? OR COALESCE(name, '') LIKE ? OR COALESCE(folder, '') LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?",
        bindings: [likeQuery, likeQuery, likeQuery, PAGE_SIZE, offset],
      },
      total: {
        sql: "SELECT COUNT(*) as total FROM imginfo WHERE url LIKE ? OR COALESCE(name, '') LIKE ? OR COALESCE(folder, '') LIKE ?",
        bindings: [likeQuery, likeQuery, likeQuery],
      },
    };
  }

  return {
    rows: {
      sql: 'SELECT * FROM imginfo ORDER BY id DESC LIMIT ? OFFSET ?',
      bindings: [PAGE_SIZE, offset],
    },
    total: {
      sql: 'SELECT COUNT(*) as total FROM imginfo',
      bindings: [],
    },
  };
}

export function buildLogQueries({ query, offset }) {
  const selectColumns = 'SELECT tgimglog.*, imginfo.rating, imginfo.total, imginfo.name, imginfo.folder';
  const joinClause = 'FROM tgimglog JOIN imginfo ON tgimglog.url = imginfo.url';

  if (query) {
    const likeQuery = `%${query}%`;

    return {
      rows: {
        sql: `${selectColumns} ${joinClause} WHERE tgimglog.url LIKE ? ORDER BY tgimglog.id DESC LIMIT ? OFFSET ?`,
        bindings: [likeQuery, PAGE_SIZE, offset],
      },
      total: {
        sql: 'SELECT COUNT(*) as total FROM tgimglog WHERE url LIKE ?',
        bindings: [likeQuery],
      },
    };
  }

  return {
    rows: {
      sql: `${selectColumns} ${joinClause} ORDER BY tgimglog.id DESC LIMIT ? OFFSET ?`,
      bindings: [PAGE_SIZE, offset],
    },
    total: {
      sql: 'SELECT COUNT(*) as total FROM tgimglog',
      bindings: [],
    },
  };
}

export function bindStatement(statement, bindings) {
  return bindings.length > 0 ? statement.bind(...bindings) : statement;
}

export function getJsonErrorPayload(error, page = 0) {
  return {
    code: 500,
    success: false,
    message: error?.message || 'Internal Server Error',
    data: [],
    page,
    total: 0,
  };
}
