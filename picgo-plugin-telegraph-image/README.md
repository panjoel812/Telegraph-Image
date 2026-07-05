# picgo-plugin-telegraph-image

PicGo uploader plugin for Telegraph Image.

## Install Locally

In PicGo 3.0:

1. Open `插件`.
2. Click the local import icon in the plugin toolbar.
3. Select this folder: `picgo-plugin-telegraph-image`.
4. Quit PicGo completely and reopen it.
5. Open `图床设置`, select `Telegraph Image`, and fill the config.

## Config

| Field | Example |
| --- | --- |
| API 地址 | `https://image.example.com/api/picgo` |
| API_TOKEN | `your API_TOKEN` |
| 上传目标 | `tgchannel` or `r2` |
| 后台虚拟文件夹 | `PicGo` |

The API endpoint must point to the `/api/picgo` route provided by Telegraph Image.

## Response

The plugin reads the uploaded URL from:

1. `data.url`
2. `url`
3. `result[0]`

## CLI Install Alternative

On macOS:

```bash
cd "$HOME/Library/Application Support/picgo"
npm install /Users/panjoel/Documents/Project/Telegraph-Image/picgo-plugin-telegraph-image
```

Then restart PicGo.
