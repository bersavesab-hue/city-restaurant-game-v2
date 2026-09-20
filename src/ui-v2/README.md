# UI V2

这是 0.9.x 之后唯一允许使用的新 UI 根目录。

当前阶段只包含 Design System 1.0，不包含任何正式游戏页面。

## 固定规则

- 设计参考稿使用 864×1536 竖屏坐标系。
- 864×1536 不是运行时强制分辨率，不允许整页按设计稿比例拉伸。
- AppShell 永远只有五个纵向区域：顶部安全区、Global HUD、Page Content、Global Nav、底部安全区。
- HUD 与 Nav 使用受宽度约束的逻辑尺寸；Page Content 自动吸收不同手机的高度差。
- 页面不得自行创建第二套顶部栏或底部导航。
- 页面不得用 fixed 覆盖 Global Nav。
- 页面不得使用“所有纵向区域百分比分割到100%”的方案。
- 图片保持比例裁切，不允许为了适配屏幕拉伸变形。
- 动态金额、时间、关键数字禁止用省略号截断。
- 所有可点击控件最小 44×44 CSS px。
- 只允许新增 src/ui-v2；禁止恢复 src/ui 或旧入口兼容层。

## 屏幕档位

运行时按 height / width 分类：

- tall-phone：>= 2.1
- standard-phone：1.9–2.1
- wide-phone-tablet：< 1.9
- landscape：width > height

三档的差异只用于留白、列数、内容密度和主视觉可视面积，不允许建立三套完全不同的页面。
