# Playtest 验收记录

候选版本：**0.8.66 Playtest / versionCode 866**

游戏/UI代码基线：
- `d6b008f9c12e5167fcf1ace23f1f19233706d90c`
- 后续提交仅用于发布工作流与本验收记录，不修改经营玩法。

## 已完成的自动验收

- Playable-flow；
- 老存档兼容；
- 连锁扩张；
- 第六阶段生命周期；
- 第七阶段 UI / 装修 / 新手引导；
- 第八阶段反馈与发布；
- 发布前试玩验收；
- 20 年性能压力；
- 90 天经营回归；
- 365 天长期回归；
- Android Web Bundle；
- Android Debug APK；
- 版本化发布包、SHA-256 与 release metadata。

## 本轮发布前缺陷清理

- 首次启动不再自动注入测试员工；
- 新手“招聘/配置员工”步骤恢复为真实玩家流程；
- 未知页面不再展示“未接入测试页”占位；
- 页面加载错误不再直接向玩家暴露 JavaScript 堆栈；
- 自动存档由每 5 秒调整为每 30 秒，同时保留日切和进入后台保存；
- 关闭 Android 系统备份，保证本地存档/反馈行为与隐私说明一致；
- WebView 显式关闭调试、content provider、跨域 file 访问和混合内容；
- 应用名称统一为“城市餐饮创业”，Android 网页壳不再出现旧“城市餐厅测试版”标题；
- 升级 Android 16 / API 36 上架基线；
- Android 工具链升级至 AGP 8.10.1 + Gradle 8.11.1；
- 新增独立 Android Release Smoke，避免长期经营 CI 被频繁 UI 提交反复取消。

## Android 候选包合同

- applicationId：`com.cityrestaurant.v2playtest`
- versionName：`0.8.66`
- versionCode：`866`
- minSdk：23
- compileSdk：36
- targetSdk：36
- 构建类型：Debug Playtest
- 签名：稳定测试证书
- 网络权限：无
- 系统备份：关闭

## 已验证的产物内容

发布 ZIP 应包含：
- `city-restaurant-v0.8.66-playtest.apk`
- `release-metadata.json`
- `SHA256SUMS.txt`
- `PRIVACY.md`
- `docs/PUBLISHING.md`
- `docs/STORE_LISTING_DRAFT.md`
- `docs/PLAYTEST_ACCEPTANCE.md`

APK 内必须至少包含：
- `assets/index.html`
- `assets/game.js`
- `assets/game.css`
- 正式运行图片资源。

## 仍属于正式商店发布前的人工阻塞

以下内容不是代码缺陷，不能用测试配置冒充完成：

1. 正式应用包名；
2. 生产签名证书；
3. Google Play 正式 AAB；
4. TapTap / 抖音对应平台后台账号与 SDK 配置；
5. 正式商店截图和宣传图；
6. 对外可访问的隐私政策链接；
7. 客服或公开反馈联系方式；
8. 如果后续接广告、支付、账号、云存档或联网分析，需要重新进行隐私与合规验收。

当前 Playtest APK 适合内部测试和小范围外部试玩，不应直接作为生产商店签名包提交。
