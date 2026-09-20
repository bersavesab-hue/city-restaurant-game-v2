# UI V2

这是 0.9.x 之后唯一允许使用的新 UI 根目录。

当前已锁定：

- Design System 1.2
- 城市参考稿 Global HUD
- 五项 Global Nav
- Expanded Navigation Rail
- AppShell
- Native Safe Insets
- 五个一级页面视觉蓝图 1.0
- 一级页面正式资源计划 1.0

## Global HUD

五个一级页统一采用城市参考稿：

左：门店/集团主图 + 管理视角 + 管理门店数  
中：天气 + 日期时间 + 暂停/1x/2x/4x  
右：资金 + 资金入口 + 等级 + 星级评分

页面不得自行修改 HUD 结构。

## 适配

- 所有手机宽度：HUD始终保持三段单行
- <400px：只压缩图标、列宽与间距，不允许改成两行
- Compact <600px
- Medium 600–839px
- Expanded >=840px
- Expanded使用左侧Navigation Rail
- Android触摸目标至少48×48

## 禁止事项

- 禁止恢复 src/ui
- 禁止旧入口兼容层
- 禁止页面自建HUD/Nav
- 禁止整页 transform: scale()
- 禁止 fixed 底栏
- 禁止关键数字截断
- 禁止用emoji/Unicode冒充正式图标


## 五个一级页面

正式蓝图位于：

- blueprints/PrimaryPageBlueprints.js
- blueprints/PrimaryVisualResourcePlan.js
- docs/UI_PRIMARY_PAGES_V1.md

页面信息结构已经整体定稿，后续实现只能按蓝图组合统一组件，禁止重新自由设计。

## 当前运行时

- AndroidBootstrap 已直接挂载唯一 AppShell。
- Global HUD 与 Global Nav 已进入 APK 正式启动链。
- 暂停 / 继续与 1x / 2x / 4x 已直接调用 TimeSystem。
- 一级导航只维护 city / store / operations / employees / more 五个状态，不建立旧 ID 兼容。
- 城市正式页已经挂载到唯一 Page Content；其他一级页后续按同一 AppShell 接入。
- android/entry.js 旧 Canvas 试玩入口已删除。

## 城市页当前状态

- 已锁定用户确认的成品图为城市页唯一母版。
- 正式页面位于 pages/city，不恢复任何 0.8.x 城市页面代码。
- 页面结构、动态数据位、五筛选、地图标签、详情Sheet、今日机会和地图本地控制已接入 Android 启动链。
- 地图主图、商圈缩略图、地图控制图标、指标图标仍通过既定 image slot 接入；接图时不得改变页面DOM或把业务文字烘焙进图片。

## 2026-09-21 实机校正

- Safe Area 已并入 HUD / Nav 背景，不再单独占白色布局行。
- 所有手机 HUD 固定单排，禁止恢复 Compact 双排。
- HUD/Nav/地图控件/指标图标已改成独立 SVG 文件，旧 sprite atlas 已删除。
- 城市商圈显示采用独立 CityMapVisualLayout，不再直接拿业务 mapPosition 当最终美术坐标。
- 商圈详情与今日机会缩略图改为正式城市主图的受控裁切，不再显示蓝色空块。
