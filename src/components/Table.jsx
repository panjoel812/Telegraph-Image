import { useState, useEffect } from "react";
import Switcher from '@/components/SwitchButton';
import { toast } from "react-toastify";
import React, { useRef } from 'react';
import TooltipItem from '@/components/Tooltip';
import FullScreenIcon from "@/components/FullScreenIcon"
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { readAdminJson } from '@/lib/adminResponse';

export default function Table({ data: initialData = [], isLoading = false }) {

    const [data, setData] = useState(initialData); // 初始化状态
    const [modalData, setModalData] = useState(null);
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


    const handleDelete = async (initName) => {
        const confirmed = window.confirm('你确定要删除这个项目吗？');
        if (confirmed) {
            await deleteItem(initName);
        }
    };


    function getLastSegment(url) {
        const lastSlashIndex = url.lastIndexOf('/');
        return url.substring(lastSlashIndex + 1);
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
        <div className="glass-panel overflow-hidden rounded-lg">
            <div className="overflow-x-auto">
            <table className="min-w-full items-center justify-between text-left">
                <thead >
                    <tr className="sticky top-0 z-20 bg-white/65 backdrop-blur-xl">
                        <th className="border-b border-white/60 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">name</th>
                        <th className="sticky left-0 z-10 border-b border-white/60 bg-white/75 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 backdrop-blur-xl">preview</th>
                        <th className="border-b border-white/60 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">time</th>
                        <th className="border-b border-white/60 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">referer</th>
                        <th className="border-b border-white/60 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">ip</th>
                        <th className="border-b border-white/60 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">PV</th>
                        <th className="border-b border-white/60 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">rating</th>
                        <th className="sticky right-0 z-10 border-b border-white/60 bg-white/75 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 backdrop-blur-xl">限制访问</th>
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

                            <tr key={index} className="group transition hover:bg-white/38">

                                <td onClick={() => handleNameClick(item)} className="max-w-64 cursor-pointer truncate border-b border-white/45 px-4 py-3 text-center text-sm font-medium text-slate-700 transition group-hover:text-sky-700">
                                    {item.url}
                                </td>
                                <td
                                    className="sticky left-0 z-10 h-24 w-24 border-b border-white/45 bg-white/62 px-4 py-3 text-sm text-slate-700 backdrop-blur-xl"
                                >

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

                                </td>
                                <td className="max-w-48 border-b border-white/45 px-4 py-3 text-center text-sm text-slate-600">
                                    {item.time}
                                </td>
                                <td className="max-w-48 break-all border-b border-white/45 px-4 py-3 text-center text-sm text-slate-600">
                                    <TooltipItem tooltipsText={item.referer} position="bottom" >{item.referer}</TooltipItem>
                                </td>
                                <td className="max-w-48 border-b border-white/45 px-4 py-3 text-center text-sm text-slate-600">
                                    <TooltipItem tooltipsText={item.ip} position="bottom" >{item.ip}</TooltipItem>
                                </td>
                                <td className="max-w-2 border-b border-white/45 px-4 py-3 text-center text-sm font-semibold text-slate-700">{item.total}</td>
                                <td className="max-w-2 border-b border-white/45 px-4 py-3 text-center text-sm font-semibold text-slate-700">{item.rating}</td>
                                <td className="sticky right-0 z-10 border-b border-white/45 bg-white/62 px-4 py-3 text-center text-sm text-slate-700 backdrop-blur-xl">
                                    <div className="flex flex-row justify-center">
                                        <Switcher initialChecked={item.rating} initName={item.url} />
                                        <button
                                            onClick={() => {
                                                handleDelete(item.url)
                                            }}
                                            className="glass-button-danger ml-2 rounded-lg px-3 py-1 text-sm font-semibold transition hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-red-300"
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
                    <div ref={modalRef} className="glass-panel relative flex h-1/2 w-9/10 flex-none flex-col rounded-lg sm:w-9/10 md:w-96 lg:w-120 xl:w-144 2xl:w-160">
                        <button className="glass-button absolute right-2 top-2 rounded-lg p-1 text-red-600 hover:text-red-700" onClick={handleCloseModal}>
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className='flex flex-col  mt-10'>
                            {[
                                { text: getImgUrl(modalData.url), onClick: () => handleCopy(getImgUrl(modalData.url)) },
                                { text: `![${modalData.url}](${getImgUrl(modalData.url)})`, onClick: () => handleCopy(`![${modalData.name}](${getImgUrl(modalData.url)})`) },
                                { text: `<a href="${getImgUrl(modalData.url)}" target="_blank"><img src="${getImgUrl(modalData.url)}"></a>`, onClick: () => handleCopy(`<a href="${getImgUrl(modalData.url)}" target="_blank"><img src="${getImgUrl(modalData.url)}"></a>`) },
                                { text: `[img]${getImgUrl(modalData.url)}[/img]`, onClick: () => handleCopy(`[img]${getImgUrl(modalData.url)}[/img]`) },
                            ].map((item, i) => (
                                <input
                                    key={`input-${i}`}
                                    readOnly
                                    value={item.text}
                                    onClick={item.onClick}
                                    className="glass-input mx-2 my-1 rounded-lg px-3 py-2 text-sm focus:outline-none"
                                />


                            ))}
                        </div>

                    </div>
                </div>


            )}

        </div>
    );
}
