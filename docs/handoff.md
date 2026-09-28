# 当前交接

## 基线
- 仓库：`bersavesab-hue/city-restaurant-game-v2`
- 基线分支：`main`
- 基线提交：`e991e156d234fc0262d39b8f0d2af889624433ce`
- 本轮工作分支：`ai/baseline-freeze-20260929`
- package 版本：`0.16.2`

## 已验证事实
- 技术栈为 JavaScript 核心 + 浏览器移动 UI + Android WebView 壳，不是 Godot 工程。
- 仓库约有 347 个文件，其中约 111 个 `src/systems` 系统文件、61 个 `src/data` 数据文件、124 个测试文件。
- `src/main.js` 已注册大量真实经营系统，包括门店、财务、员工、库存、采购、菜品、订单、顾客、营业模拟、装修、评价等。
- `tests/operating-day-e2e.test.js` 明确覆盖首日自动营业、订单完成、库存消耗、收入、员工工作、评价和日结。
- 存档系统已包含 format/schema 版本、迁移、加载失败回滚；浏览器环境默认使用 localStorage。
- 时间系统支持暂停、恢复及 1x/2x/4x；模拟系统支持逐分钟和快速推进。
- 当前移动 UI 逻辑基线为 540×960，长屏通过扩展逻辑高度适配，不拉伸参考框。
- 当前主页正式 DOM 被有意清空为设计画布；测试明确要求不存在正式导航和业务 UI。
- `client/mobile/assets` 当前不存在，打包脚本会在存在时才复制资源。
- 最新 `Mobile UI Playtest` run 36429801988 在基线提交上成功完成 UI 测试、前端打包、Android SDK/Gradle、debug APK 构建和产物上传。
- 对应 APK artifact：`restaurant-mobile-ui-apk`，artifact id `10973290459`。

## 已发现风险
1. 当前正式主页只有背景/空白画布，底层功能无法通过正常玩家 UI 使用。
2. Android `versionName` 仍为 `0.11.0`，与 package `0.16.2` 不一致。
3. Android 应用名称仍是“餐饮经营UI原型”，说明发布元数据尚未进入正式状态。
4. 现有移动 workflow 主要验证 UI 与 APK 构建，没有在每次 UI 构建时跑完整经营测试。
5. `.github/test-signing/debug.keystore.b64` 存在于仓库；目前未确认是否仍被任何流程使用。不得当作正式发布签名密钥。
6. 当前没有 AGENTS、game-spec、ui-spec、tasks、handoff 和资产 manifest 等统一执行规范。

## 下一任务
T02：完成规范文件写入并复查一致性。
随后执行 T03：构建与版本硬化，不先做美术。
