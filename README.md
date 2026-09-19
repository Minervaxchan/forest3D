# forest3D · 林间来信

V0.3：移动端优先的 2.5D 可玩 H5。轻触蘑菇会发光，溪流会泛起涟漪，角色回应灯光并在夜景向你打招呼。新增首次素材准备/重试、互动发现提示和偏好保存。React + TypeScript + GSAP + Vite，无后端、无 3D 引擎、无 GLB。

## 运行

在线体验：https://minervaxchan.github.io/forest3D/ 。发布流程见 [DEPLOYMENT.md](docs/DEPLOYMENT.md)。

```sh
npm install
npm run dev
```

开发地址 http://localhost:5186，生产预览 http://localhost:4186；严格占用指定端口，避免混入其他项目。首次点击「点击进入森林」开启音乐；耳机体验更佳。
手机与电脑同一局域网时可访问终端显示的 Network 地址。陀螺仪需浏览器支持及安全上下文；普通局域网 HTTP 仍可拖动探索。

```sh
npm run build
npm run lint
npm run preview
```

## 浏览器验证

先启动开发服务（默认 5186），再执行 `npm run test:e2e`。
测试使用已安装的 Microsoft Edge；设置 `BROWSER_CHANNEL=chromium` 可使用 Playwright Chromium（需先 `npx playwright install chromium`）。
设置 `TEST_BASE_URL` 可验证生产预览。截图保存在 `docs/screenshots/v0.3/`，测试覆盖核心素材失败重试、可选素材降级、环境动作排队、拖动防误触和偏好保存。

## 素材

用户参考原图在 `references/`。依据参考生成的角色、日夜背景、前景源图在 `src/assets/`；运行时 WebP 在 `public/assets/`，可用 `npm run assets:build` 重新压缩。
音乐、溪流/风声、鸟鸣/虫声与交互声均为程序合成，支持外部音频替换。日夜声音支持交叉淡化。

当前架构见 [V0.3_IMPLEMENTATION.md](docs/V0.3_IMPLEMENTATION.md)，后续迭代见 [ROADMAP.md](docs/ROADMAP.md)。V0.3 尚待真机及人工画面/听感验收。

初版记录见 [V0.1_IMPLEMENTATION.md](docs/V0.1_IMPLEMENTATION.md) 与 [ASSET_PROMPTS.md](docs/ASSET_PROMPTS.md)。
