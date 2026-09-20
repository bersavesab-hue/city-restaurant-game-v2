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

- >=400px：HUD三段单行
- <400px：同一HUD只重排为两行
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
