import { getRequestContext } from '@cloudflare/next-on-pages';
import { jsonHeaders } from '../adminRouteUtils';

export const runtime = 'edge';

export async function DELETE(request) {
  try {
    const { name } = await request.json();
    const { env } = getRequestContext();

    if (!env?.IMG) {
      throw new Error('IMG D1 binding is not configured');
    }

    if (typeof name !== 'string' || !name.trim()) {
      throw new Error('Missing image name');
    }

    const setData = await env.IMG.prepare('DELETE FROM imginfo WHERE url = ?').bind(name).run();

    return Response.json({
      code: 200,
      success: true,
      message: setData.success ? 'success' : 'delete completed',
    });

  } catch (error) {
    return Response.json({
      code: 500,
      success: false,
      message: error.message,
    }, {
      status: 500,
      headers: jsonHeaders,
    })
  }
}
