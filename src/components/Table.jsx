import { useState, useEffect } from "react";
import Switcher from '@/components/SwitchButton';
import { toast } from "react-toastify";
import React, { useRef } from 'react';
import FullScreenIcon from "@/components/FullScreenIcon"
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { readAdminJson } from '@/lib/adminResponse';

export default function Table({ data: initialData = [], isLoading = false }) {

    const [data, setData] = useState(initialData); // 初始化状态
    const [modalData, setModalData] = useState(null);
    const [pendingDelete, setPendingDelete] = useState(null);
    const modalRef = useRef(null);



    useEffect(() => {
        setData(initialData); // 更新数据
    }, [initialData]);

    const handleClickOutside = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            setModalData(null);
        }
    };

    const origin = typeof window !== 'undefined' ? window.location.origin : '';




    const getImgUrl = (url) => {
        return url.startsWith("/file/") || url.startsWith("/cfile/") || url.startsWith("/rfile/") ? `${origin}/api${url}` : url;
    };

    const handleNameClick = (item) => {
        setModalData(item);
    };

    const handleCloseModal = () => {
        setModalData(null);
    };



    const handleCopy = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`链接复制成功`);
        });
    };



    const deleteItem = async (initName) => {
        try {
            const res = await fetch(`/api/admin/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: initName,
                }),
            });
            const res_data = await readAdminJson(res);
            if (res_data.success) {
                toast.success('删除成功!');
                setData(prevData => prevData.filter(item => item.url !== initName));
            } else {
                toast.error(res_data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };


    const handleDelete = (initName) => {
        setPendingDelete(initName);
    };

    const confirmDelete = async () => {
        if (!pendingDelete) {
            return;
        }
        const target = pendingDelete;
        setPendingDelete(null);
        await deleteItem(target);
    };


    function getLastSegment(url) {
        const lastSlashIndex = url.lastIndexOf('/');
        return url.substring(lastSlashIndex + 1);
    }

    function getDisplayName(item) {
        return item.name || getLastSegment(item.url || '');
    }

    function getFolderName(item) {
        return item.folder || '默认';
    }
    const renderFile = (fileUrl, index) => {
        const _url = getLastSegment(fileUrl);
        const getFileExtension = (url) => {
            const parts = url.split('.');
            return parts.length > 1 ? parts.pop().toLowerCase() : '';
        };
        const fileExtension = getFileExtension(_url);



        const imageExtensions = [
            'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'tif', 'webp',
            'svg', 'ico', 'heic', 'heif', 'raw', 'psd', 'ai', 'eps'
        ];

        const videoExtensions = [
            'mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'ogg',
            'ogv', 'm4v', '3gp', '3g2', 'mpg', 'mpeg', 'mxf', 'vob'
        ];

        if (imageExtensions.includes(fileExtension)) {

            return (
                <img
                    key={`image-${index}`}
                    src={fileUrl}
                    alt={`Uploaded ${index}`}
                    className="w-full h-full object-cover"
                />
            );
        }
        else if (videoExtensions.includes(fileExtension)) {
            return (
                <video
                    key={`video-${index}`}
                    src={fileUrl}
                    className="w-full h-full object-cover"
                    controls
                >
                    Your browser does not support the video tag.
                </video>
            );
        }
        else {
            return (
                <img
                    key={`image-${index}`}
                    src={fileUrl}
                    alt={`Uploaded ${index}`}
                    className="w-full h-full object-cover"
                />
            );
        }
    };

    function toggleFullScreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            const element = document.querySelector('.PhotoView-Portal');
            if (element) {
                element.requestFullscreen();
            }
        }
    }

    // const isImage = (url) => {
    //     return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
    // };

    const isVideo = (url) => {
        return /\.(mp4|mkv|avi|mov|wmv|flv|webm|ogg|ogv|m4v|3gp|3g2|mpg|mpeg|mxf|vob)$/i.test(url);
    }

    const elementSize = 400;
    return (
        <div className="apple-sheet relative overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[1064px] table-fixed text-left">
                <colgroup>
                    <col className="w-[140px]" />
                    <col className="w-[220px]" />
                    <col className="w-[104px]" />
                    <col className="w-[150px]" />
                    <col className="w-[70px]" />
                    <col className="w-[80px]" />
                    <col className="w-[150px]" />
                    <col className="w-[190px]" />
                </colgroup>
                <thead >
                    <tr className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl">
                        <th className="border-b border-black/5 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-black/55">文件夹</th>
                        <th className="border-b border-black/5 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-black/55">文件名</th>
                        <th className="border-b border-black/5 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-black/55">preview</th>
                        <th className="border-b border-black/5 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-black/55">time</th>
                        <th className="border-b border-black/5 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-black/55">PV</th>
                        <th className="border-b border-black/5 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-black/55">rating</th>
                        <th className="border-b border-black/5 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-black/55">链接</th>
                        <th className="sticky right-0 z-10 border-b border-black/5 bg-white/75 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-black/55 backdrop-blur-xl">限制访问</th>
                    </tr>
                </thead>
                <tbody className={isLoading ? 'opacity-60' : ''}>

                    <PhotoProvider
                        maskOpacity={0.5}
                        toolbarRender={({ rotate, onRotate, onScale, scale }) => {
                            return (
                                <>
                                    <svg
                                        className="PhotoView-Slider__toolbarIcon"
                                        width="44"
                                        height="44"
                                        viewBox="0 0 768 768"
                                        fill="white"
                                        onClick={() => onScale(scale + 0.5)}
                                    >
                                        <path d="M384 640.5q105 0 180.75-75.75t75.75-180.75-75.75-180.75-180.75-75.75-180.75 75.75-75.75 180.75 75.75 180.75 180.75 75.75zM384 64.5q132 0 225.75 93.75t93.75 225.75-93.75 225.75-225.75 93.75-225.75-93.75-93.75-225.75 93.75-225.75 225.75-93.75zM415.5 223.5v129h129v63h-129v129h-63v-129h-129v-63h129v-129h63z" />
                                    </svg>
                                    <svg
                                        className="PhotoView-Slider__toolbarIcon"
                                        width="44"
                                        height="44"
                                        viewBox="0 0 768 768"
                                        fill="white"
                                        onClick={() => onScale(scale - 0.5)}
                                    >
                                        <path d="M384 640.5q105 0 180.75-75.75t75.75-180.75-75.75-180.75-180.75-75.75-180.75 75.75-75.75 180.75 75.75 180.75 180.75 75.75zM384 64.5q132 0 225.75 93.75t93.75 225.75-93.75 225.75-225.75 93.75-225.75-93.75-93.75-225.75 93.75-225.75 225.75-93.75zM223.5 352.5h321v63h-321v-63z" />
                                    </svg>
                                    <svg
                                        className="PhotoView-Slider__toolbarIcon"
                                        onClick={() => onRotate(rotate + 90)}
                                        width="44"
                                        height="44"
                                        fill="white"
                                        viewBox="0 0 768 768"
                                    >
                                        <path d="M565.5 202.5l75-75v225h-225l103.5-103.5c-34.5-34.5-82.5-57-135-57-106.5 0-192 85.5-192 192s85.5 192 192 192c84 0 156-52.5 181.5-127.5h66c-28.5 111-127.5 192-247.5 192-141 0-255-115.5-255-256.5s114-256.5 255-256.5c70.5 0 135 28.5 181.5 75z" />
                                    </svg>
                                    {document.fullscreenEnabled && <FullScreenIcon onClick={toggleFullScreen} />}
                                </>
                            );
                        }}>
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-14 text-center text-sm font-medium text-slate-500">
                                    {isLoading ? '正在加载数据...' : '暂无数据'}
                                </td>
                            </tr>
                        )}

                        {data.map((item, index) => (

                            <tr key={index} className="group h-28 transition hover:bg-white/38">

                                <td onClick={() => handleNameClick(item)} className="cursor-pointer border-b border-white/45 px-4 py-3 text-center text-sm font-medium text-slate-700 transition group-hover:text-sky-700">
                                    <div className="truncate" title={getFolderName(item)}>{getFolderName(item)}</div>
                                </td>
                                <td onClick={() => handleNameClick(item)} className="cursor-pointer border-b border-white/45 px-4 py-3 text-center text-sm font-medium text-slate-700 transition group-hover:text-sky-700">
                                    <div className="truncate" title={getDisplayName(item)}>{getDisplayName(item)}</div>
                                    <div className="mt-1 truncate text-[11px] font-normal text-slate-400" title={item.url}>{item.url}</div>
                                </td>
                                <td
                                    className="h-28 border-b border-white/45 px-4 py-3 text-sm text-slate-700"
                                >
                                    <div className="mx-auto h-16 w-20 overflow-hidden rounded-md bg-white/60 shadow-sm ring-1 ring-white/70">

                                    {
                                        isVideo(getImgUrl(item.url)) ? (

                                            <PhotoView key={item.url}
                                                width={elementSize}
                                                height={elementSize}
                                                render={({ scale, attrs }) => {
                                                    const width = attrs.style.width;
                                                    const offset = (width - elementSize) / elementSize;
                                                    const childScale = scale === 1 ? scale + offset : 1 + offset;
                                                    return (
                                                        <div {...attrs} className={`flex-none bg-white ${attrs.className || ''}`}>
                                                            {renderFile(getImgUrl(item.url), index)}
                                                        </div>
                                                    )

                                                }}
                                            >
                                                {renderFile(getImgUrl(item.url), index)}
                                            </PhotoView>
                                        ) : (
                                            <PhotoView key={item.url}
                                                src={getImgUrl(item.url)}
                                            >
                                                {renderFile(getImgUrl(item.url), index)}
                                            </PhotoView>

                                        )
                                    }
                                    </div>

                                </td>
                                <td className="border-b border-white/45 px-4 py-3 text-center text-sm leading-5 text-slate-600">
                                    <div className="line-clamp-2">{item.time}</div>
                                </td>
                                <td className="border-b border-white/45 px-4 py-3 text-center text-sm font-semibold text-slate-700">{item.total}</td>
                                <td className="border-b border-white/45 px-4 py-3 text-center text-sm font-semibold text-slate-700">{item.rating}</td>
                                <td className="border-b border-white/45 px-4 py-3 text-center text-sm text-slate-700">
                                    <button
                                        onClick={() => handleCopy(getImgUrl(item.url))}
                                        className="apple-button apple-button-muted mx-auto min-w-[86px]"
                                    >
                                        复制链接
                                    </button>
                                </td>
                                <td className="sticky right-0 z-10 border-b border-white/45 bg-white/76 px-4 py-3 text-center text-sm text-slate-700 backdrop-blur-xl">
                                    <div className="flex items-center justify-center gap-3">
                                        <Switcher initialChecked={item.rating} initName={item.url} />
                                        <button
                                            onClick={() => {
                                                handleDelete(item.url)
                                            }}
                                            className="apple-button apple-button-danger min-w-[56px] whitespace-nowrap"
                                        >
                                            删除
                                        </button>
                                    </div>
                                </td>
                            </tr>

                        ))}

                    </PhotoProvider>
                </tbody>
            </table>
            </div>


            {modalData && (
                <div onClick={handleClickOutside} className="fixed inset-0 z-50 m-5 flex items-center justify-center overflow-y-auto">
                    <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm"></div>
                    <div ref={modalRef} className="apple-sheet relative flex w-9/10 flex-none flex-col p-5 sm:w-9/10 md:w-96 lg:w-120 xl:w-144 2xl:w-160">
                        <button className="apple-button apple-button-muted absolute right-4 top-4 h-7 w-7 px-0 text-red-600" onClick={handleCloseModal}>
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className='mt-12 flex flex-col gap-2'>
                            {[
                                { text: getImgUrl(modalData.url), onClick: () => handleCopy(getImgUrl(modalData.url)) },
                                { text: `![${getDisplayName(modalData)}](${getImgUrl(modalData.url)})`, onClick: () => handleCopy(`![${getDisplayName(modalData)}](${getImgUrl(modalData.url)})`) },
                                { text: `<a href="${getImgUrl(modalData.url)}" target="_blank"><img src="${getImgUrl(modalData.url)}"></a>`, onClick: () => handleCopy(`<a href="${getImgUrl(modalData.url)}" target="_blank"><img src="${getImgUrl(modalData.url)}"></a>`) },
                                { text: `[img]${getImgUrl(modalData.url)}[/img]`, onClick: () => handleCopy(`[img]${getImgUrl(modalData.url)}[/img]`) },
                            ].map((item, i) => (
                                <input
                                    key={`input-${i}`}
                                    readOnly
                                    value={item.text}
                                    onClick={item.onClick}
                                    className="apple-text-field"
                                />


                            ))}
                        </div>

                    </div>
                </div>


            )}

            {pendingDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/30 p-6 backdrop-blur-sm">
                    <div className="liquid-alert w-[min(300px,calc(100vw-32px))]">
                        <div className="px-1">
                            <h2 className="text-[13px] font-bold leading-4 text-black/85">确认删除</h2>
                            <p className="mt-2 text-[11px] leading-[14px] text-black/75">
                                删除后这条图片记录将从管理后台移除。请确认你要删除该文件。
                            </p>
                            <p className="mt-2 truncate text-[11px] font-semibold leading-[14px] text-black/50" title={pendingDelete}>
                                {pendingDelete}
                            </p>
                        </div>
                        <div className="mt-4 flex flex-col gap-2">
                            <button
                                className="liquid-alert-button liquid-alert-button-danger"
                                onClick={confirmDelete}
                            >
                                删除
                            </button>
                            <button
                                className="liquid-alert-button liquid-alert-button-muted"
                                onClick={() => setPendingDelete(null)}
                            >
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
