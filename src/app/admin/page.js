'use client'

import Link from 'next/link'
import { signOut } from "next-auth/react"
import { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from "react-toastify";
import Table from "@/components/Table"
import { readAdminJson } from "@/lib/adminResponse";

function getAdminErrorMessage(message) {
  if (message?.includes('Cloudflare request context')) {
    return '本地缺少 Cloudflare D1 环境，暂无数据。';
  }

  return message || '请求失败，请稍后重试。';
}

export default function Admin() {
  const [listData, setListData] = useState([])
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTotal, setSearchTotal] = useState(1);
  const [inputPage, setInputPage] = useState(1);
  const [view, setView] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getListdata = useCallback(async (page) => {
    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/${view}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: page - 1,
          query: activeQuery,
        })
      })
      const resData = await readAdminJson(res)
      setListData(resData.data)
      setSearchTotal(Math.max(1, Math.ceil(resData.total / 10)));
    } catch (error) {
      toast.error(getAdminErrorMessage(error.message), { toastId: 'admin-list-error' })
      setListData([])
      setSearchTotal(1)
    } finally {
      setIsLoading(false);
    }
  }, [activeQuery, view])

  useEffect(() => {
    getListdata(currentPage)
  }, [currentPage, getListdata]);

  const handleNextPage = () => {
    const nextPage = currentPage + 1;

    if (nextPage > searchTotal) {
      toast.error('当前已为最后一页！')
      return;
    }

    setCurrentPage(nextPage);
    setInputPage(nextPage)
  };

  const handlePrevPage = () => {
    const prevPage = currentPage - 1;

    if (prevPage >= 1) {
      setCurrentPage(prevPage);
      setInputPage(prevPage)
    }
  };

  const handleJumpPage = () => {
    const page = parseInt(inputPage, 10);

    if (!isNaN(page) && page >= 1 && page <= searchTotal) {
      setCurrentPage(page);
    } else {
      toast.error('请输入有效的页码！');
    }
  };

  const handleViewToggle = () => {
    setView(view === 'list' ? 'log' : 'list');
    setCurrentPage(1);
    setInputPage(1);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setActiveQuery(searchQuery.trim());
    setCurrentPage(1);
    setInputPage(1);
  };

  return (
    <div className="liquid-page flex h-full min-h-screen w-full flex-col items-center overflow-auto">
      <header className="fixed left-3 right-3 top-3 z-50">
        <div className="glass-bar mx-auto flex w-full max-w-6xl flex-col gap-3 rounded-lg px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              className='glass-button glass-button-primary rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45'
              onClick={handleViewToggle}
              disabled={isLoading}
            >
              切换到 {view === 'list' ? '日志页' : '数据页'}
            </button>
            <span className="rounded-lg border border-white/60 bg-white/45 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm backdrop-blur">
              当前：{view === 'list' ? '数据页' : '日志页'}
            </span>
            {activeQuery && (
              <span className="rounded-lg border border-sky-200/70 bg-sky-50/60 px-3 py-2 text-xs font-medium text-sky-700 shadow-sm backdrop-blur">
                搜索：{activeQuery}
              </span>
            )}
          </div>

          <form onSubmit={handleSearch} className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input min-w-0 flex-1 rounded-lg px-3 py-2 text-sm outline-none transition focus:border-sky-300"
              placeholder="搜索"
            />
            <button type="submit" className="glass-button rounded-lg px-4 py-2 text-sm font-semibold transition">
              搜索
            </button>
          </form>

          <div className="flex items-center gap-2">
            <Link href="/" className="glass-button rounded-lg px-4 py-2 text-sm font-semibold transition">主页</Link>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="glass-button rounded-lg px-4 py-2 text-sm font-semibold transition">登出</button>
          </div>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-6xl px-3 pb-28 pt-56 sm:px-5 sm:pt-32">
        <section className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1 text-sm text-slate-600">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Telegraph Image 管理台</h1>
            <p className="mt-1 text-sm text-slate-600">第 {currentPage} / {searchTotal} 页</p>
          </div>
          <div className="rounded-lg border border-white/60 bg-white/45 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm backdrop-blur">
            {isLoading ? '正在刷新数据' : `当前显示 ${listData.length} 条`}
          </div>
        </section>

        <Table data={listData} isLoading={isLoading} />
      </main>

      <div className="fixed inset-x-3 bottom-3 z-50">
        <div className="glass-bar mx-auto flex w-full max-w-3xl flex-wrap items-center justify-center gap-3 rounded-lg px-4 py-3">
          <button
            className='glass-button rounded-lg px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 sm:text-sm'
            onClick={handlePrevPage}
            disabled={currentPage === 1 || isLoading}
          >
            上一页
          </button>
          <span className="rounded-lg bg-white/40 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm sm:text-sm">第 {`${currentPage}/${searchTotal}`} 页</span>
          <button
            className='glass-button rounded-lg px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 sm:text-sm'
            onClick={handleNextPage}
            disabled={isLoading}
          >
            下一页
          </button>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              className="glass-input w-20 rounded-lg px-3 py-2 text-sm outline-none"
              placeholder="页码"
            />
            <button
              className='glass-button rounded-lg px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 sm:text-sm'
              onClick={handleJumpPage}
              disabled={isLoading}
            >
              跳转
            </button>
          </div>
        </div>
      </div>

      <ToastContainer icon={false} limit={1} position="top-right" />
    </div>
  )
}
