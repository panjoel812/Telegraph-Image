import { getRequestContext } from '@cloudflare/next-on-pages';
import { getImageDatabase } from '@/lib/cloudflareBindings';
import { jsonHeaders } from '../adminRouteUtils';

export const runtime = 'edge';

export async function PUT(request) {
  try {
    const { rating, name } = await request.json();
    const { env } = getRequestContext();
    const database = getImageDatabase(env);
    const nextRating = Number(rating);

    if (typeof name !== 'string' || !name.trim()) {
      throw new Error('Missing image name');
    }

    if (![1, 3].includes(nextRating)) {
      throw new Error('Invalid rating value');
    }

    const setData = await database.prepare('UPDATE imginfo SET rating = ? WHERE url = ?').bind(nextRating, name).run();

    return Response.json({
      code: 200,
      success: true,
      message: setData.success ? 'success' : 'update completed',
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
