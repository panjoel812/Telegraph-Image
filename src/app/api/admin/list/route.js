import { getRequestContext } from '@cloudflare/next-on-pages';
import {
  bindStatement,
  buildListQueries,
  getJsonErrorPayload,
  jsonHeaders,
  normalizeAdminPayload,
} from '../adminRouteUtils';

export const runtime = 'edge';
export async function POST(request) {
  let payload = normalizeAdminPayload();

  try {
    payload = normalizeAdminPayload(await request.json());
    const { env } = getRequestContext();

    if (!env?.IMG) {
      throw new Error('IMG D1 binding is not configured');
    }

    const queries = buildListQueries(payload);
    const rowsStatement = bindStatement(env.IMG.prepare(queries.rows.sql), queries.rows.bindings);
    const totalStatement = bindStatement(env.IMG.prepare(queries.total.sql), queries.total.bindings);
    const [{ results = [] }, total] = await Promise.all([
      rowsStatement.all(),
      totalStatement.first(),
    ]);

    return Response.json({
      code: 200,
      success: true,
      message: 'success',
      data: results,
      page: payload.page,
      total: Number(total?.total || 0),
    }, {
      headers: jsonHeaders,
    });

  } catch (error) {
    return Response.json(getJsonErrorPayload(error, payload.page), {
      status: 500,
      headers: jsonHeaders,
    })
  }
}
