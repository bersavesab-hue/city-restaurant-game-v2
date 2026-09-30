# 发布与测试包规范

当前代码基线版本：**0.16.2 Playtest / versionCode 1602**。

## 当前 Android 事实
- applicationId：`com.cityrestaurant.mobileui`
- minSdk：24
- compileSdk：35
- targetSdk：35
- Android 当前仍是 WebView 测试壳，不等同于微信/抖音小游戏适配完成。

## 两层自动化
普通代码改动优先运行轻量 CI：
- 版本一致性检查；
- 核心经管 smoke；
- 存档兼容；
- UI 合同测试；
- 浏览器 UI 打包。

试玩节点才运行 Android APK 构建。不要因为文案或小坐标调整要求玩家反复下载安装包。

## Playtest APK 必须包含
- package 版本；
- Git 提交短 SHA；
- `build-info.json`；
- APK SHA-256 元数据。

测试包内显示版本号与提交号，用于截图和问题反馈定位。

## 签名
- 正式生产签名绝不能提交到仓库。
- 仓库内现有测试签名文件不作为正式签名来源。
- 稳定的测试升级签名应通过 GitHub Secret 或其他受控凭据提供；未配置前，不得声称跨构建升级安装已经验证。

## 正式上架前
1. 确定正式应用名称和包名策略；包名变更会影响升级安装。
2. 创建并离线保管生产签名证书。
3. 按目标平台分别验证：
   - TapTap Android 包；
   - 微信小游戏运行环境；
   - 抖音小游戏运行环境。
4. 准备图标、截图、介绍、更新日志、隐私政策和客服信息。
5. 接入广告、支付、账号、云存档或联网 SDK 后重新做隐私和权限检查。
6. 每次正式发布递增 versionCode，并保持 package、ReleaseInfo 和 Android Gradle 一致。
