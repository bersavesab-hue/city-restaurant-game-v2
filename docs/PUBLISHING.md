# 发布清单

当前候选版本：**0.8.65 Playtest / versionCode 865**

## CI 自动完成

每次正式流水线必须通过：
- Playable-flow；
- 老存档兼容；
- 连锁扩张；
- 第六阶段生命周期；
- 第七阶段 UI/装修/引导；
- 第八阶段反馈与发布 Gate；
- 20 年性能压力；
- 90 天经营回归；
- 365 天长期回归；
- Android Web Bundle；
- Debug APK 构建。

发布产物包含：
- `city-restaurant-v0.8.65-playtest.apk`
- `release-metadata.json`
- `SHA256SUMS.txt`

## 当前测试包可做

- 内部测试；
- 小范围外部测试；
- 收集本机反馈报告；
- 验证 Android 23+ 设备兼容性；
- 验证存档、长期经营、UI 和性能。

## 正式上架前仍必须人工完成

1. 确定正式应用包名。当前测试包名为 `com.cityrestaurant.v2playtest`。
2. 创建并妥善保管**生产签名证书**。禁止把测试签名直接用于正式商店版本。
3. 根据目标平台创建正式应用：
   - TapTap；
   - 抖音小游戏（需要单独适配小游戏运行环境，不等同于 APK）；
   - Google Play（如发布，需要生成并签名 AAB）。
4. 准备商店资料：
   - 应用图标；
   - 横竖宣传图；
   - 5–8 张正式截图；
   - 一句话介绍；
   - 完整介绍；
   - 更新日志；
   - 隐私政策公开链接；
   - 客服/反馈联系方式。
5. 如果加入广告、支付、账号、云存档或联网反馈，重新做隐私和合规检查。
6. 正式版本提高 `versionCode`，并保持 `package.json`、ReleaseInfo 和 Android Gradle 版本一致。

## 推荐发布顺序

先使用当前 Playtest APK 做封闭测试并收集反馈；修复高频问题后，再生成独立的 Release Candidate。生产签名、正式包名和平台 SDK 应只在 RC 阶段接入，避免测试阶段污染正式应用身份。
