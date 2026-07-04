"use client";
import { useState, useRef, useCallback } from "react";
import { signOut } from "next-auth/react"
import Image from "next/image";
import { faImages, faTrashAlt, faUpload, faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import { useEffect } from 'react';
import Footer from '@/components/Footer'
import Link from "next/link";
import LoadingOverlay from "@/components/LoadingOverlay";


const LoginButton = ({ onClick, href, children }) => (
  <button
    onClick={onClick}
    className="glass-button-primary rounded-lg px-5 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-px"
  >
    {children}
  </button>
);


export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedFilesNum, setUploadedFilesNum] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null); // 添加状态用于跟踪选中的放大图片
  const [activeTab, setActiveTab] = useState('preview');
  const [uploading, setUploading] = useState(false);
  const [IP, setIP] = useState('');
  const [Total, setTotal] = useState('?');
  const [selectedOption, setSelectedOption] = useState('tgchannel'); // 初始选择第一个选项
  const [isAuthapi, setisAuthapi] = useState(false); // 初始选择第一个选项
  const [Loginuser, setLoginuser] = useState(''); // 初始选择第一个选项
  const [boxType, setBoxtype] = useState("img");

  const origin = typeof window !== 'undefined' ? window.location.origin : '';


  const parentRef = useRef(null);






  const headers = {

    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",

  }

  const readJsonResponse = useCallback(async (res) => {
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }
    return res.json();
  }, []);

  const ip = useCallback(async () => {
    try {

      const res = await fetch(`/api/ip`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }

      });
      const data = await readJsonResponse(res);
      if (data?.ip) {
        setIP(data.ip);
      }



    } catch (error) {
      console.warn('请求出错:', error);
    }
  }, [readJsonResponse]);

  const isAuth = useCallback(async () => {
    try {

      const res = await fetch(`/api/enableauthapi/isauth`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }

      });

      if (res.ok) {
        const data = await readJsonResponse(res);
        setisAuthapi(true)
        setLoginuser(data?.role)

      } else {
        setisAuthapi(false)
        setSelectedOption("58img")
      }



    } catch (error) {
      console.warn('请求出错:', error);
    }
  }, [readJsonResponse]);

  const getTotal = useCallback(async () => {
    try {

      const res = await fetch(`/api/total`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }

      });
      const data = await readJsonResponse(res);
      if (data?.total !== undefined) {
        setTotal(data.total);
      }



    } catch (error) {
      console.warn('请求出错:', error);
    }
  }, [readJsonResponse]);

  useEffect(() => {
    ip();
    getTotal();
    isAuth();
  }, [getTotal, ip, isAuth]);

  const handleFileChange = (event) => {
    const newFiles = event.target.files;
    const filteredFiles = Array.from(newFiles).filter(file =>
      !selectedFiles.find(selFile => selFile.name === file.name));
    // 过滤掉已经在 uploadedImages 数组中存在的文件
    const uniqueFiles = filteredFiles.filter(file =>
      !uploadedImages.find(upImg => upImg.name === file.name)
    );

    setSelectedFiles([...selectedFiles, ...uniqueFiles]);
  };

  const handleClear = () => {
    setSelectedFiles([]);
    // setUploadedImages([]);
  };

  const getTotalSizeInMB = (files) => {
    const totalSizeInBytes = Array.from(files).reduce((acc, file) => acc + file.size, 0);
    return (totalSizeInBytes / (1024 * 1024)).toFixed(2); // 转换为MB并保留两位小数
  };



  const handleUpload = async (file = null) => {
    setUploading(true);

    const filesToUpload = file ? [file] : selectedFiles;

    if (filesToUpload.length === 0) {
      toast.error('请选择要上传的文件');
      setUploading(false);
      return;
    }

    const formFieldName = selectedOption === "tencent" ? "media" : "file";
    let successCount = 0;

    try {
      for (const file of filesToUpload) {
        const formData = new FormData();

        formData.append(formFieldName, file);

        try {
          const targetUrl = selectedOption === "tgchannel" || selectedOption === "r2"
            ? `/api/enableauthapi/${selectedOption}`
            : `/api/${selectedOption}`;

          // const response = await fetch("https://img.131213.xyz/api/tencent", {
          const response = await fetch(targetUrl, {
            method: 'POST',
            body: formData,
            headers: headers
          });

          if (response.ok) {
            const result = await response.json();
            // console.log(result);

            file.url = result.url;

            // 更新 uploadedImages 和 selectedFiles
            setUploadedImages((prevImages) => [...prevImages, file]);
            setSelectedFiles((prevFiles) => prevFiles.filter(f => f !== file));
            successCount++;
          } else {
            // 尝试从响应中提取错误信息
            let errorMsg;
            try {
              const errorData = await response.json();
              errorMsg = errorData.message || `上传 ${file.name} 图片时出错`;
            } catch (jsonError) {
              // 如果解析 JSON 失败，使用默认错误信息
              errorMsg = `上传 ${file.name} 图片时发生未知错误`;
            }

            // 细化状态码处理
            switch (response.status) {
              case 400:
                toast.error(`请求无效: ${errorMsg}`);
                break;
              case 403:
                toast.error(`无权限访问资源: ${errorMsg}`);
                break;
              case 404:
                toast.error(`资源未找到: ${errorMsg}`);
                break;
              case 500:
                toast.error(`服务器错误: ${errorMsg}`);
                break;
              case 401:
                toast.error(`未授权: ${errorMsg}`);
                break;
              default:
                toast.error(`上传 ${file.name} 图片时出错: ${errorMsg}`);
            }
          }
        } catch (error) {
          toast.error(`上传 ${file.name} 图片时出错`);
        }
      }

      setUploadedFilesNum(uploadedFilesNum + successCount);
      toast.success(`已成功上传 ${successCount} 张图片`);

    } catch (error) {
      console.error('上传过程中出现错误:', error);
      toast.error('上传错误');
    } finally {
      setUploading(false);
    }
  };





  const handlePaste = (event) => {
    const clipboardItems = event.clipboardData.items;

    for (let i = 0; i < clipboardItems.length; i++) {
      const item = clipboardItems[i];
      if (item.kind === 'file' && item.type.includes('image')) {
        const file = item.getAsFile();
        setSelectedFiles([...selectedFiles, file]);
        break; // 只处理第一个文件
      }
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;

    if (files.length > 0) {
      const filteredFiles = Array.from(files).filter(file => !selectedFiles.find(selFile => selFile.name === file.name));
      setSelectedFiles([...selectedFiles, ...filteredFiles]);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // 根据图片数量动态计算容器高度
  const calculateMinHeight = () => {
    const rows = Math.ceil(selectedFiles.length / 4);
    return `${rows * 100}px`;
  };

  // 处理点击图片放大
  const handleImageClick = (index) => {

    if (selectedFiles[index].type.startsWith('image/')) {
      setBoxtype("img");
    } else if (selectedFiles[index].type.startsWith('video/')) {
      setBoxtype("video");
    } else {
      setBoxtype("other");
    }

    setSelectedImage(URL.createObjectURL(selectedFiles[index]));
  };

  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  const handleRemoveImage = (index) => {
    const updatedFiles = selectedFiles.filter((_, idx) => idx !== index);
    setSelectedFiles(updatedFiles);
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // alert('已成功复制到剪贴板');
      toast.success(`链接复制成功`);
    } catch (err) {
      toast.error("链接复制失败")
    }
  };

  const handleCopyCode = async () => {
    const codeElements = parentRef.current.querySelectorAll('code');
    const values = Array.from(codeElements).map(code => code.textContent);
    try {
      await navigator.clipboard.writeText(values.join("\n"));
      toast.success(`链接复制成功`);

    } catch (error) {
      toast.error(`链接复制失败\n${error}`)
    }
  }

  const handlerenderImageClick = (imageUrl, type) => {
    setBoxtype(type);
    setSelectedImage(imageUrl);
  };


  const renderFile = (data, index) => {
    const fileUrl = data.url;
    if (data.type.startsWith('image/')) {
      return (
        <img
          key={`image-${index}`}
          src={data.url}
          alt={`Uploaded ${index}`}
          className="object-cover w-36 h-40 m-2"
          onClick={() => handlerenderImageClick(fileUrl, "img")}
        />
      );

    } else if (data.type.startsWith('video/')) {
      return (
        <video
          key={`video-${index}`}
          src={data.url}
          className="object-cover w-36 h-40 m-2"
          controls
          onClick={() => handlerenderImageClick(fileUrl, "video")}
        >
          Your browser does not support the video tag.
        </video>
      );

    } else {
      // 其他文件类型
      return (
        <img
          key={`image-${index}`}
          src={data.url}
          alt={`Uploaded ${index}`}
          className="object-cover w-36 h-40 m-2"
          onClick={() => handlerenderImageClick(fileUrl, "other")}
        />
      );
    }



  };


  const renderTabContent = () => {
    switch (activeTab) {
      case 'preview':
        return (
          <div className="flex flex-col gap-3">
            {uploadedImages.map((data, index) => (
              <div key={index} className="glass-panel flex flex-col gap-4 rounded-lg p-3 md:flex-row">
                {renderFile(data, index)}
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                  {[
                    { text: data.url, onClick: () => handleCopy(data.url) },
                    { text: `![${data.name}](${data.url})`, onClick: () => handleCopy(`![${data.name}](${data.url})`) },
                    { text: `<a href="${data.url}" target="_blank"><img src="${data.url}"></a>`, onClick: () => handleCopy(`<a href="${data.url}" target="_blank"><img src="${data.url}"></a>`) },
                    { text: `[img]${data.url}[/img]`, onClick: () => handleCopy(`[img]${data.url}[/img]`) },
                  ].map((item, i) => (
                    <input
                      key={`input-${i}`}
                      readOnly
                      value={item.text}
                      onClick={item.onClick}
                      className="glass-input rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none"
                    />
                  ))}
                </div>
              </div>

            ))}
          </div>
        );
      case 'htmlLinks':
        return (
          <div ref={parentRef} className="glass-panel rounded-lg p-4 text-sm text-slate-700" onClick={handleCopyCode}>
            {uploadedImages.map((data, index) => (
              <div key={index} className="mb-2 ">
                <code className=" w-2 break-all">{`<img src="${data.url}" alt="${data.name}" />`}</code>
              </div>
            ))}
          </div >
        );
      case 'markdownLinks':
        return (
          <div ref={parentRef} className="glass-panel rounded-lg p-4 text-sm text-slate-700" onClick={handleCopyCode}>
            {uploadedImages.map((data, index) => (
              <div key={index} className="mb-2">
                <code className=" w-2 break-all">{`![${data.name}](${data.url})`}</code>
              </div>
            ))}
          </div>
        );
      case 'bbcodeLinks':
        return (
          <div ref={parentRef} className="glass-panel rounded-lg p-4 text-sm text-slate-700" onClick={handleCopyCode}>
            {uploadedImages.map((data, index) => (
              <div key={index} className="mb-2">
                <code className=" w-2 break-all">{`[img]${data.url}[/img]`}</code>
              </div>
            ))}
          </div>
        );
      case 'viewLinks':
        return (
          <div ref={parentRef} className="glass-panel rounded-lg p-4 text-sm text-slate-700" onClick={handleCopyCode}>
            {uploadedImages.map((data, index) => (
              <div key={index} className="mb-2">
                <code className=" w-2 break-all">{`${data.url}`}</code>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const handleSelectChange = (e) => {
    setSelectedOption(e.target.value); // 更新选择框的值
  };


  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const renderButton = () => {
    if (!isAuthapi) {
      return (
        <Link href="/login">
          <LoginButton>登录</LoginButton>
        </Link>
      );
    }
    switch (Loginuser) {
      case 'user':
        return <LoginButton onClick={handleSignOut}>登出</LoginButton>;
      case 'admin':
        return (
          <Link href="/admin">
            <LoginButton>管理</LoginButton>
          </Link>
        );
      default:
        return (
          <Link href="/login">
            <LoginButton>登录</LoginButton>
          </Link>
        );
    }
  };


  return (
    <main className="liquid-page min-h-screen overflow-x-hidden px-4 pb-24 pt-24 text-slate-900 sm:px-6 lg:px-8">
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
        <nav className="glass-bar flex h-14 w-full max-w-6xl items-center justify-between rounded-lg px-4">
          <Link href="/" className="flex items-center gap-3 text-base font-bold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/70 text-sky-600 shadow-sm">
              <FontAwesomeIcon icon={faImages} className="h-4 w-4" />
            </span>
            图床
          </Link>
          {renderButton()}
        </nav>
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-5">
        <div className="glass-panel rounded-lg p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-normal text-slate-950">图片或视频上传</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                上传文件最大 5 MB；本站已托管 <span className="font-semibold text-sky-600">{Total}</span> 张图片；你的 IP 是 <span className="font-semibold text-sky-600">{IP}</span>
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-sm font-semibold text-slate-600">上传接口</span>
              <select
                value={selectedOption}
                onChange={handleSelectChange}
                className="glass-input h-12 min-w-40 rounded-lg px-4 text-base font-semibold text-slate-900 outline-none"
              >
                <option value="tg">TG(会失效)</option>
                <option value="tgchannel">TG_Channel</option>
                <option value="r2">R2</option>
                <option value="58img">58img</option>
              </select>
            </div>
          </div>

          <div
            className="liquid-dropzone relative mt-5 overflow-hidden rounded-lg"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onPaste={handlePaste}
            style={{ minHeight: selectedFiles.length > 0 ? calculateMinHeight() : '300px' }}
          >
            <LoadingOverlay loading={uploading} />
            <div className="grid min-h-[300px] grid-cols-1 gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="liquid-file-card flex h-56 flex-col rounded-lg p-3">
                  <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg bg-white/60" onClick={() => handleImageClick(index)}>
                    {file.type.startsWith('image/') && (
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${file.name}`}
                        fill={true}
                        className="object-cover"
                      />
                    )}
                    {file.type.startsWith('video/') && (
                      <video
                        src={URL.createObjectURL(file)}
                        controls
                        className="h-full w-full object-cover"
                      />
                    )}
                    {!file.type.startsWith('image/') && !file.type.startsWith('video/') && (
                      <div className="flex h-full w-full items-center justify-center bg-white/60 p-4 text-center text-sm font-semibold text-slate-600">
                        <p className="break-all">{file.name}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-600" title={file.name}>{file.name}</p>
                    <div className="flex shrink-0 items-center gap-2">
                      <button className="liquid-icon-button text-sky-600" onClick={() => handleImageClick(index)} aria-label="预览">
                        <FontAwesomeIcon icon={faSearchPlus} />
                      </button>
                      <button className="liquid-icon-button text-red-500" onClick={() => handleRemoveImage(index)} aria-label="移除">
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </button>
                      <button className="liquid-icon-button text-emerald-600" onClick={() => handleUpload(file)} aria-label="上传">
                        <FontAwesomeIcon icon={faUpload} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {selectedFiles.length === 0 && (
                <div className="col-span-full flex min-h-[300px] flex-col items-center justify-center gap-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/68 text-sky-600 shadow-sm ring-1 ring-white/75">
                    <FontAwesomeIcon icon={faUpload} className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-700">拖拽文件到这里上传</p>
                    <p className="mt-1 text-sm text-slate-500">也可以粘贴屏幕截图，或使用下方按钮选择图片</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="glass-bar mt-4 grid grid-cols-1 gap-3 rounded-lg p-3 md:grid-cols-[auto_1fr_auto_auto] md:items-center">
            <label
              htmlFor="file-upload"
              className="glass-button-primary flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition hover:-translate-y-px"
            >
              <FontAwesomeIcon icon={faImages} className="h-4 w-4" />
              选择图片
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              multiple
            />
            <div className="glass-input flex h-11 items-center rounded-lg px-4 text-sm font-semibold text-slate-600">
              已选择 {selectedFiles.length} 张，共 {getTotalSizeInMB(selectedFiles)} M
            </div>
            <button
              className="glass-button-danger flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition hover:-translate-y-px"
              onClick={handleClear}
            >
              <FontAwesomeIcon icon={faTrashAlt} className="h-4 w-4" />
              清除
            </button>
            <button
              className={`glass-button-primary flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition hover:-translate-y-px ${uploading ? 'pointer-events-none opacity-50' : ''}`}
              onClick={() => handleUpload()}
            >
              <FontAwesomeIcon icon={faUpload} className="h-4 w-4" />
              上传
            </button>
          </div>
        </div>

        <ToastContainer />
        <div className="min-h-[180px]">
          {uploadedImages.length > 0 && (
            <>
              <div className="glass-bar mb-4 flex flex-wrap gap-2 rounded-lg p-2">
                {[
                  ['preview', 'Preview'],
                  ['htmlLinks', 'HTML'],
                  ['markdownLinks', 'Markdown'],
                  ['bbcodeLinks', 'BBCode'],
                  ['viewLinks', 'Links'],
                ].map(([tab, label]) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTab === tab ? 'glass-button-primary' : 'glass-button'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {renderTabContent()}
            </>
          )}
        </div>
      </section>

      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-5 backdrop-blur-sm" onClick={handleCloseImage}>
          <div className="glass-panel relative flex max-h-[86vh] max-w-[92vw] flex-col items-center justify-between rounded-lg p-3">
            <button
              className="glass-button-danger absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-lg leading-none"
              onClick={handleCloseImage}
            >
              &times;
            </button>

            {boxType === "img" ? (
              <img
                src={selectedImage}
                alt="Selected"
                width={500}
                height={500}
                className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain"
              />
            ) : boxType === "video" ? (
              <video
                src={selectedImage}
                width={500}
                height={500}
                className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain"
                controls
              />
            ) : boxType === "other" ? (
              <div className="glass-panel rounded-lg p-4 text-slate-800">
                <p>Unsupported file type</p>
              </div>
            ) : (
              <div>未知类型</div>
            )}
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto mt-8 flex w-full max-w-6xl justify-center">
        <div className="glass-bar flex h-12 w-full max-w-6xl items-center justify-center rounded-lg px-4 text-xs text-slate-500">
          <Footer />
        </div>
      </div>
    </main>
  );
}
