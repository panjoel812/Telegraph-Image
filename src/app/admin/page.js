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

  const setViewMode = (nextView) => {
    setView(nextView);
    setCurrentPage(1);
    setInputPage(1);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setActiveQuery(searchQuery.trim());
    setCurrentPage(1);
    setInputPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveQuery('');
    setCurrentPage(1);
    setInputPage(1);
  };

  return (
    <div className="liquid-page flex h-full min-h-screen w-full flex-col items-center overflow-auto">
      <header className="fixed left-3 right-3 top-3 z-50">
        <div className="apple-toolbar mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="apple-segmented" aria-label="管理台视图">
              <button
                type="button"
                className="apple-segmented-item"
                data-active={view === 'list'}
                onClick={() => setViewMode('list')}
                disabled={isLoading}
              >
                数据页
              </button>
              <button
                type="button"
                className="apple-segmented-item"
                data-active={view === 'log'}
                onClick={() => setViewMode('log')}
                disabled={isLoading}
              >
                日志页
              </button>
            </div>
            {activeQuery && (
              <span className="apple-button apple-button-muted h-8">
                搜索：{activeQuery}
              </span>
            )}
          </div>

          <form onSubmit={handleSearch} className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-md">
            <label className="apple-search flex-1">
              <svg className="apple-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M7.1 12.2a5.1 5.1 0 1 0 0-10.2 5.1 5.1 0 0 0 0 10.2ZM11 11l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="apple-search-input"
                placeholder="搜索文件名、文件夹或链接"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-black/35 transition hover:bg-black/10 hover:text-black/55"
                  aria-label="清除搜索"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="m3.2 3.2 5.6 5.6M8.8 3.2 3.2 8.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </label>
            <button type="submit" className="apple-button apple-button-primary h-9">
              搜索
            </button>
          </form>

          <div className="flex items-center gap-2">
            <Link href="/" className="apple-button h-9">主页</Link>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="apple-button h-9">登出</button>
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
        <div className="apple-toolbar mx-auto flex w-full max-w-3xl flex-wrap items-center justify-center gap-3 px-4 py-3">
          <button
            className='apple-button h-9 disabled:cursor-not-allowed disabled:opacity-45'
            onClick={handlePrevPage}
            disabled={currentPage === 1 || isLoading}
          >
            上一页
          </button>
          <span className="apple-button apple-button-muted h-9">第 {`${currentPage}/${searchTotal}`} 页</span>
          <button
            className='apple-button h-9 disabled:cursor-not-allowed disabled:opacity-45'
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
              className="apple-text-field h-9 w-20"
              placeholder="页码"
            />
            <button
              className='apple-button h-9 disabled:cursor-not-allowed disabled:opacity-45'
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
