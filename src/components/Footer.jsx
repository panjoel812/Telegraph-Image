import { useState, useEffect } from 'react';
import Link from 'next/link';
export default function Footer() {
  return (
    <footer className="flex w-full flex-col items-center justify-center text-center">
      <div >
        <p className="text-xs text-gray-500">Copyright Ⓒ 2024 All rights reserved. 请勿上传违反中国法律的图片，违者后果自负。 本程序基于Cloudflare Pages，开源于
          <Link 
          href="https://github.com/x-dr/telegraph-Image"
          className="ml-1 text-sky-500 hover:text-red-700"
          target="_blank"
          rel="noopener noreferrer"
          >GitHub Telegraph-Image</Link> </p>
      </div>
    </footer>
  );
}
