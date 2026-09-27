# STS2 卡面裁剪工具

这是一个纯前端 React + TypeScript + Vite 图片裁剪工具。图片只在当前浏览器内处理，不上传服务器。

## 本地运行

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
```

构建产物位于 `dist/`。

## Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Framework preset: `Vite`

不需要 Worker、数据库或环境变量。

## 预设配置

编辑 `src/config/presets.ts` 中的 `cropPresets` 即可调整预设名称、输出宽高、圆角半径与导出文件名后缀；UI、实时预览与最终导出会共享同一套配置和 Canvas 渲染逻辑。
