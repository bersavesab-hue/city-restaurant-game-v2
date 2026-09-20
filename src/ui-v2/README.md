# UI V2

这是 0.9.x 之后唯一允许使用的新 UI 根目录。

当前已经建立：

- Design System 1.1
- Global HUD
- Global Navigation Bar
- Expanded Window Navigation Rail
- AppShell
- Native Safe Insets 契约

暂时没有任何正式一级页面。

## 设计与适配

- 设计稿基准：864×1536 竖屏。
- 运行时按实际窗口宽度/高度分类，不按具体手机型号。
- Compact <600px；Medium 600–839px；Expanded >=840px。
- Expanded 使用左侧 Navigation Rail；Compact/Medium 使用底部 Navigation Bar。
- Android最小触摸目标48×48。
- HUD只放管理范围、时间、速度、资金、等级评分。
- 天气、任务、活动、库存等页面信息不得塞进全局HUD。
- 五个一级页只允许填充 Page Content。

## 禁止事项

- 禁止恢复 src/ui。
- 禁止旧入口兼容层。
- 禁止页面自建HUD/Nav。
- 禁止整页 transform: scale()。
- 禁止 fixed 底栏。
- 禁止图片非等比拉伸。
- 禁止关键金额、时间、数量省略号截断。
- 禁止用 emoji / Unicode 字符冒充正式游戏图标。
