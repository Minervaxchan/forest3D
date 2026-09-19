# GitHub Pages

当前发布方式：GitHub Actions → GitHub Pages，仅上传 dist。
地址：https://minervaxchan.github.io/forest3D/

main 推送后自动 lint、build、Chromium 桌面/手机回归，全部通过才部署。
PR 只验证，不发布。也可在 Actions 手动运行 Deploy GitHub Pages。

BASE_PATH 控制构建根路径：本地默认 /，Pages 使用 /forest3D/。
角色、图层、蘑菇通过 assetUrl 统一读取 Vite BASE_URL；未来本地音频也应使用该方法。
高分辨率源图、references 和 docs 不在 dist 中。

本地模拟 Pages（PowerShell）：

```powershell
$env:BASE_PATH='/forest3D/'
npm run build
npm run preview
# 另一个终端
$env:TEST_BASE_URL='http://localhost:4186/forest3D/'
npm run test:e2e
```

失败构建不执行部署，现有站点继续运行。构建产物保留 7 天。
回退：对有问题的提交创建 git revert 提交并推送 main，经过同样检查重新部署。
此部署替代原路线中的 Cloudflare 默认方案，不代表 V1.0 人工验收完成。
仓库目前为公开状态；源码私有要求尚未满足，部署过程不修改仓库可见性。

配置依据：[Vite 官方说明](https://vite.dev/guide/static-deploy#github-pages)、
[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。
