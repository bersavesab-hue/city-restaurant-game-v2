# 餐饮 V2 UI Design System 1.2

## 1. 当前阶段

0.9.3 锁定唯一公共顶部 HUD：**城市参考稿 HUD**。

五个一级页面（城市 / 门店 / 经营 / 员工 / 更多）以后全部复用同一套 HUD 结构，不得自行增删字段或建立第二套顶部栏。

当前仍不创建五个一级正式页面，不接正式图片，不建立旧入口兼容。

## 2. 设计基准与运行时

视觉稿继续使用 **864×1536 竖屏**作为设计坐标参考。

运行时根据实际可用窗口尺寸适配：

- Compact：宽度 < 600 CSS px
- Medium：600–839 CSS px
- Expanded：>= 840 CSS px

高度同步分级：

- Compact：< 480 CSS px
- Medium：480–899 CSS px
- Expanded：>= 900 CSS px

## 3. 唯一 Global HUD：城市母版

HUD 信息顺序固定为三段。

### 左侧：管理范围

- 门店 / 集团主图槽位
- 当前管理视角，例如“集团视角”
- 管理对象说明，例如“管理旗下3家门店”
- 视角切换按钮

### 中间：时间系统

- 天气图标
- 游戏日期
- 游戏时间
- 暂停 / 继续
- 1x / 2x / 4x

### 右侧：核心资产

- 资金图标
- 当前现金
- 资金入口按钮
- 等级图标
- 当前等级
- 星级图标
- 当前评分

员工数量、会员数量、任务数、库存警报、商圈状态等不得进入 Global HUD。

## 4. HUD适配原则

城市参考稿是视觉母版，不代表所有窗口都强制单行。

- >= 400 CSS px：保持城市母版三段单行结构。
- < 400 CSS px：只允许把同一套三段内容重排为两行，以保证可读性和48px触摸目标。
- 不允许删字段、不允许换成另一套 HUD、不允许为某个一级页面单独改结构。
- 金额、时间、等级、评分禁止省略号截断。

## 5. HUD视觉资源槽位

正式资源阶段只向既有槽位接图，不改DOM结构：

- store-avatar
- scope-chevron
- weather
- pause / play
- money
- plus
- level
- rating

当前阶段不使用 emoji、Unicode 字符或临时CSS图标替代正式资源。

## 6. Global Nav

五个主入口固定为：

- city / 城市
- store / 门店
- operations / 经营
- employees / 员工
- more / 更多

Compact / Medium 使用底部 Navigation Bar。

Expanded（>=840 CSS px）使用左侧 Navigation Rail。

## 7. 点击目标

安卓交互目标固定为至少 **48×48 CSS px / dp等级**。

图标视觉本体可以更小，但交互容器不能小于48。

## 8. Safe Insets

CSS env(safe-area-inset-*) 与 Android Native Insets同时生效。

Android宿主读取：

- systemBars
- displayCutout
- mandatorySystemGestures

并注入：

- --ui-native-safe-top
- --ui-native-safe-right
- --ui-native-safe-bottom
- --ui-native-safe-left

## 9. 公共外壳纪律

五个一级页只能填充 Page Content。

禁止：

- 页面自己创建顶部栏
- 页面自己创建主导航
- 恢复0.8.x HUD
- 恢复旧入口映射
- position: fixed 覆盖导航
- 整页 transform: scale()
- 关键数字省略号截断
- 图片非等比拉伸
