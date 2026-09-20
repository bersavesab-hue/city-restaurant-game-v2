# 餐饮 V2 UI Design System 1.3

## 1. 当前阶段

城市一级页已经进入正式实现，唯一视觉母版为用户确认的 **864×1536 城市成品图**。

五个一级页面（城市 / 门店 / 经营 / 员工 / 更多）继续复用同一套 Global HUD、Global Nav、字体体系、间距体系与组件语言，不允许页面自行建立第二套规范。

城市页详细坐标见：

- docs/UI_CITY_REFERENCE_V1.md
- src/ui-v2/tokens/ReferenceLayout.js

## 2. 设计基准与运行时

视觉设计坐标继续使用 **864×1536 竖屏**。

运行时不执行整页等比缩放，而是根据实际窗口适配：

- Compact：宽度 < 600 CSS px
- Medium：600–839 CSS px
- Expanded：>= 840 CSS px

城市页使用“固定结构 + 弹性地图”：

- HUD结构固定
- Hero结构固定
- 五筛选固定单排
- Detail Sheet结构固定
- Global Nav结构固定
- 手机纵向高度差优先由地图区域吸收

## 3. 字体与字重

全项目中文字体优先级固定为：

Noto Sans SC → PingFang SC → Microsoft YaHei → system-ui。

统一字重只使用：

- 500 正文
- 600 次重点
- 700 标签
- 800 强标签
- 900 标题与关键数字

禁止页面临时使用 650 / 750 / 950 等非统一字重。

核心字号由 tokens.css 的语义 Token 控制：

- --ui-font-page-title
- --ui-font-page-subtitle
- --ui-font-filter
- --ui-font-detail-title
- --ui-font-detail-body
- --ui-font-metric-label
- --ui-font-metric-value
- --ui-font-section-title
- --ui-font-nav-label
- HUD 专用语义字号

以后要调视觉比例，只改 Token，不在页面里到处改字号。

## 4. 唯一 Global HUD

HUD 信息顺序固定为三段。

### 左侧：管理范围

- 门店 / 集团主图槽位
- 当前管理视角
- 管理对象说明
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
- 资金入口
- 等级
- 星级评分

员工数量、会员数量、库存警报、商圈状态等不得进入 Global HUD。

## 5. Global Nav

一级入口永远只有：

- city / 城市
- store / 门店
- operations / 经营
- employees / 员工
- more / 更多

Compact / Medium 使用五等分底栏。

Expanded 使用左侧 Navigation Rail。

## 6. 间距、圆角与阴影

间距只能使用：

4 / 8 / 12 / 16 / 20 / 24 / 32。

圆角只能使用：

8 / 12 / 16 / 20 / 24 / pill。

阴影统一通过语义 Token：

- --ui-shadow-control
- --ui-shadow-card
- --ui-shadow-sheet

禁止每个页面自行创造一套阴影和圆角。

## 7. 点击目标

安卓交互容器固定至少 **48×48 CSS px / dp等级**。

视觉图标可以更小，但真实点击容器不能小于 48。

## 8. 图片规则

正式图只能负责：

- 地图
- 商圈缩略图
- 图标
- 按钮底板
- 标签底板
- 区域描边
- 卡片装饰

动态文字与数字禁止烘焙：

- 名称
- 金额
- 商圈数量
- 客流
- 租金
- 等级
- 评分
- 状态数字
- 机会正文

所有图片必须使用 cover / contain，禁止非等比拉伸。

## 9. 已批准城市素材

已批准素材用途由：

src/ui-v2/assets/CityVisualAssetContract.js

统一登记。

后续切图与接图不得改变现有 CityPage DOM 和坐标结构。

## 10. Safe Insets

CSS env(safe-area-inset-*) 与 Android Native Insets 同时生效。

Android宿主读取：

- systemBars
- displayCutout
- mandatorySystemGestures

并注入：

- --ui-native-safe-top
- --ui-native-safe-right
- --ui-native-safe-bottom
- --ui-native-safe-left

## 11. 禁止事项

禁止：

- 页面自行创建第二套HUD
- 页面自行创建第二套一级导航
- 恢复0.8.x旧UI
- 恢复旧入口映射
- position: fixed 覆盖公共导航
- 整页 transform: scale()
- 页面自行发明字号体系
- 页面自行发明间距体系
- 关键数字省略号截断
- 图片非等比拉伸
