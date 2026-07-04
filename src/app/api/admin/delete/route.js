import { getRequestContext } from '@cloudflare/next-on-pages';
import { getImageDatabase } from '@/lib/cloudflareBindings';
import { jsonHeaders } from '../adminRouteUtils';

export const runtime = 'edge';

export async function DELETE(request) {
  try {
    const { name } = await request.json();
    const { env } = getRequestContext();
    const database = getImageDatabase(env);

    if (typeof name !== 'string' || !name.trim()) {
      throw new Error('Missing image name');
    }

    const setData = await database.prepare('DELETE FROM imginfo WHERE url = ?').bind(name).run();

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
