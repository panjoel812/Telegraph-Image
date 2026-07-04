import { NextResponse } from "next/server";
import { headers } from 'next/headers'
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getImageDatabase, hasImageDatabase } from '@/lib/cloudflareBindings';

// ...

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400', // 24 hours
  'Content-Type': 'application/json'
};

export const runtime = 'edge';
export async function GET(request) {
  // 获取客户端的IP地址
  const { env, cf, ctx } = getRequestContext();
  const imageDatabase = hasImageDatabase(env) ? getImageDatabase(env) : null;
  // console.log(dd);
  let totalImg = {
    status: 404,
    total: "?"
  }

  try {
    if (imageDatabase) {
      const total = await imageDatabase.prepare(`SELECT COUNT(*) as total FROM imginfo`).first()
      return Response.json({
        "code": 200,
        "success": true,
        "message": "success",
        "total": total.total
      });
    }else{
      return Response.json({
        "code": 500,
        "success": true,
        "message": "no db",
        "total": "?"
      }, {
        status: 500,
        headers: corsHeaders,
      })
    }
  } catch (error) {
    return Response.json({
      "code": 500,
      "success": false,
      "message": error.message,
    }, {
      status: 500,
      headers: corsHeaders,
    })
  }

}



async function insertImageData(env, src, referer, ip, rating, time) {
  try {
    const instdata = await env.prepare(
      `INSERT INTO imginfo (url, referer, ip, rating, total, time)
           VALUES ('${src}', '${referer}', '${ip}', ${rating}, 1, '${time}')`
    ).run();
  } catch (error) {

  }
}
