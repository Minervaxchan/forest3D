# forest3D · 林间来信

移动端优先的 2.5D 可玩 H5 原型。React + TypeScript + GSAP + Vite，无后端、无 3D 引擎、无 GLB。

## 运行

```sh
npm install
npm run dev
```

打开终端显示的本地地址。首次点击「点击进入森林」开启音乐；耳机体验更佳。
手机与电脑同一局域网时可访问终端显示的 Network 地址。陀螺仪需浏览器支持及安全上下文；普通局域网 HTTP 仍可拖动探索。

```sh
npm run build
npm run lint
npm run preview
```

## 浏览器验证

先启动开发服务（默认 5173），再执行 `npm run test:e2e`。
测试使用已安装的 Microsoft Edge；设置 `BROWSER_CHANNEL=chromium` 可使用 Playwright Chromium（需先 `npx playwright install chromium`）。
设置 `TEST_BASE_URL` 可验证生产预览。截图保存在 `docs/screenshots/`。

## 素材

用户参考原图在 `references/`。依据参考生成的角色、日夜背景、前景源图在 `src/assets/`；运行时 WebP 在 `public/assets/`，可用 `npm run assets:build` 重新压缩。
BGM 为程序合成占位音乐，环境音接口已预留。

详见 [V0.1_IMPLEMENTATION.md](docs/V0.1_IMPLEMENTATION.md) 与 [ASSET_PROMPTS.md](docs/ASSET_PROMPTS.md)。