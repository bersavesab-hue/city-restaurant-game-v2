# 餐饮 V2 UI Design System 1.1

## 1. 当前阶段

0.9.2 完成公共游戏外壳的第二步：

- Global HUD
- 五项主导航
- 大屏 Navigation Rail
- Android Native Safe Insets

当前仍不创建城市、门店、经营、员工、更多的正式页面，不接正式图片，不建立页面路由。

## 2. 设计基准与运行时

视觉稿继续使用 **864×1536 竖屏**，只作为设计坐标参考。

运行时必须根据 **实际可用窗口尺寸** 自适应，不按手机型号、不按物理分辨率、也不只按长宽比分档。

宽度分级：

- Compact：< 600 CSS px
- Medium：600–839 CSS px
- Expanded：>= 840 CSS px

高度分级：

- Compact：< 480 CSS px
- Medium：480–899 CSS px
- Expanded：>= 900 CSS px

## 3. Global HUD 信息层级

全局 HUD 只保留跨页面、高频、持续需要的信息：

1. 当前管理范围：集团 / 当前门店
2. 游戏日期与时间
3. 暂停、1×、2×、4×
4. 现金
5. 等级与评分

天气、活动、任务、商圈状态、库存预警等不进入 Global HUD，放回各自页面，避免顶部长期拥挤。

Compact 手机使用两行 HUD：

- 第一行：管理范围 + 资金/等级评分
- 第二行：日期时间 + 时间控制

Medium / Expanded 有足够宽度时自动变成单行三分区：

- 管理范围
- 日期时间与速度
- 资金/等级评分

关键数字永远不使用省略号。

## 4. Global Nav

五个同级主入口固定为：

- city / 城市
- store / 门店
- operations / 经营
- employees / 员工
- more / 更多

这些是 UI V2 的新语义 ID，不兼容、不映射旧入口。

Compact / Medium 使用底部 Navigation Bar。

Expanded（>=840 CSS px）自动改成左侧 Navigation Rail，不允许把手机底栏无限拉宽到平板。

导航图标当前只定义 24×24 的正式图片槽位，不使用 emoji、Unicode 字符或临时 CSS 图形冒充最终图标。正式美术资源在资源阶段接入。

## 5. 点击目标

Android 主目标固定为 **48×48 CSS px / dp 等级**。

不再使用44px作为安卓基线。

图标本身可以小于48，但可点击容器不得小于48。

## 6. Safe Insets

CSS 的 env(safe-area-inset-*) 继续保留。

Android 宿主同时读取：

- systemBars
- displayCutout
- mandatorySystemGestures

并转换为 CSS px 注入：

- --ui-native-safe-top
- --ui-native-safe-right
- --ui-native-safe-bottom
- --ui-native-safe-left

最终安全区取 CSS env 与 Native Insets 的较大值，防止刘海、挖孔、圆角屏、系统手势区覆盖关键交互。

## 7. 公共外壳纪律

五个一级页只能填充 Page Content。

不得：

- 自己创建顶部状态栏
- 自己创建底部主导航
- position: fixed 覆盖 Global Nav
- 在页面里重新实现时间倍率
- 在页面里重复显示全局资金
- 恢复任何0.8.x UI类名和旧入口

## 8. 视觉方向

公共 HUD 与导航只使用 Design Token 中的深蓝 / 蓝 / 金黄 / 白色。

不在公共层加入大面积装饰插画。

公共层的目标是稳定、清晰、长期存在；页面主视觉由城市地图、门店场景、人物、菜品等正式美术承担。

## 9. 后续页面接入原则

在五个一级页面视觉稿确认前，Global HUD/Nav接口保持稳定。

页面只传真实动态数据到 HUD，不允许为了某个页面临时改变 HUD DOM 结构。
