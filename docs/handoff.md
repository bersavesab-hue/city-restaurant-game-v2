# 当前交接

## 基线
- 仓库：`bersavesab-hue/city-restaurant-game-v2`
- 基线分支：`main`
- 原始基线提交：`e991e156d234fc0262d39b8f0d2af889624433ce`
- 当前工作分支：`ai/baseline-freeze-20260929`
- 当前验证提交：`ab1693f4a920cbf6818a37c77e94391ecdef5a4b`
- 当前版本：`0.16.2 / versionCode 1602`

## 已完成并验证
### T01 仓库基线
- 技术栈确认：JavaScript 核心 + 浏览器移动 UI + Android WebView 壳，不是 Godot。
- 仓库包含约 111 个系统文件、61 个数据文件和 124 个既有测试文件。
- 底层已有门店、财务、员工、库存、采购、菜品、订单、顾客、营业模拟、装修、评价等成熟模块。
- 当前正式主页仍是设计画布，底层系统尚未通过正常玩家 UI 暴露。

### T02 规范冻结
已加入：
- `AGENTS.md`
- `docs/game-spec.md`
- `docs/ui-spec.md`
- `docs/tasks.md`
- `docs/handoff.md`
- `assets/manifest.json`

首发方向固定为单店成长，不为换技术栈重写底层，不再混用 540×960 / 540×1200 / 960 宽等逻辑坐标。

### T03 构建与版本硬化
- package、package-lock、ReleaseInfo、Android Gradle 统一到 0.16.2。
- Android 实际配置统一为 package `com.cityrestaurant.mobileui`、minSdk 24、target/compileSdk 35。
- 新增 `scripts/check-version-sync.mjs`。
- 普通 CI 只跑核心经营、存档、UI 和浏览器打包，不生成 APK。
- APK workflow 只保留手动触发和 `playtest-*` 标签。
- 测试 APK 内嵌版本号与 Git SHA，并生成 `build-info.json`。
- 删除仓库中未使用的 `.github/test-signing/debug.keystore.b64`。
- 发布元数据不再谎称使用稳定测试签名。

一次性 Android 验证：
- workflow run：`36460165910`
- APK artifact：`10987680449`
- Android 构建：成功
- APK SHA-256：`23946e06caad0cc3b77e7d6089a97c26cb20f13949a758dd3e0bcc0837d22470`
- 当前签名：`android-debug`，不具备稳定升级签名保证。

### T04 底层经营闭环
既有经营集成测试继续通过，能够证明真实客流、订单、库存消耗、收入、员工工作、评价和日结。底层不需要先重写。

### T05 时间、后台与存档
已固定并接入：
- 1× = 每现实 1 秒推进 2 游戏分钟；2×/4×按比例加速。
- 新档自动开始；有效旧档保留原暂停/速度。
- 前台每 30 秒自动存档。
- 切后台/pagehide 立即保存并停钟。
- 回前台重启计时器，不补算后台时间；首发无离线收益。
- 主存档写入前保留上一份有效存档为滚动备份。
- 主档损坏可回滚到备份；未来版本存档禁止静默降级。
- 主档和备份均不可读时禁止自动覆盖坏档。

最终轻量 CI run：`36461419951`
- 核心/实时/结算测试：15/15
- 存档兼容与恢复：11/11
- UI 合同：38/38
- 浏览器移动 UI 打包：成功
- 版本一致性：通过

## 当前主要断层
当前最重要的问题不是缺底层，而是：
1. `HomePage.js` 仍被刻意清空为设计画布。
2. 玩家无法通过正式手机 UI 创建/进入门店、采购、营业和查看经营结果。
3. DevToolkit 已能做布局，但它不是正式玩法 UI。
4. 目前不应继续先做美术，也不应恢复旧硬编码假数据 UI。

## 下一任务
**T04-UI：把最小经营闭环接回手机 UI。**

第一阶段只做真实可玩控制面板：
- 读取或创建真实单店状态；
- 显示真实资金、时间、门店状态、星级、营业数据；
- 提供真实采购、营业/暂停、速度控制和结算/成长反馈；
- 所有按钮必须走现有业务系统；
- 禁止硬编码“购买成功”等假结果；
- 先验证 APK 可连续经营，再进入 T06/T08 正式主页母版和视觉接入。
