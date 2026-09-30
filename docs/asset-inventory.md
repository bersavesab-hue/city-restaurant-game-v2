# T07 资产清单与视觉母版

## 结论

当前正式分支在 T07 开始前没有任何运行时 PNG/JPG/WebP/SVG 成品素材，正式主页依赖 CSS 底板和文字控件。仓库历史提交 `33400d19c27c7617c110eb82c748468a69a015b4` 中存在 14 个由旧主页设计稿拆出的 PNG，本阶段已恢复到：

`client/mobile/assets/home/recovered/`

这些文件只作为历史参考和候选素材保存，不允许因为“已经存在”就直接重新盖回正式主页。

## 资产状态定义

- `candidate`：静态画面本身可能可直接复用，但仍需真机视觉确认。
- `repair`：内容可保留，但尺寸、裁切、状态数量或用途与当前正式主页不完整匹配。
- `reference`：只作为风格或旧设计参考，不进入当前运行时。
- `missing`：当前正式 UI 有明确槽位，但没有最终美术文件；CSS/字符图标继续作为可运行兜底。

## 恢复素材分类

| 文件 | 状态 | 当前判断 |
|---|---|---|
| city-skyline.png | candidate | 可作为商圈装饰候选，不包含运行时数值 |
| scene-clean.png | repair | 旧餐厅场景裁片，不是完整 9:16 / cover-safe 背景 |
| nav-home.png | repair | 只有旧“门店选中”状态，无法支持五一级页动态选中 |
| avatar-chef.png | reference | 角色示意头像，不能代表所有随机厨师 |
| avatar-server.png | reference | 角色示意头像，不能代表所有随机服务员 |
| growth-business.png | reference | 旧成长区按钮，当前主页结构已变化 |
| growth-renovation.png | reference | 同上 |
| growth-research.png | reference | 同上 |
| growth-staff.png | reference | 同上 |
| opportunity-header.png | reference | 旧“今日机会”区标题图，当前正式主页无同结构 |
| growth-header.png | reference | 旧结构标题图 |
| feed-header.png | reference | 旧结构标题图 |
| market-header.png | reference | 旧结构标题图 |
| schedule-header.png | reference | 旧结构标题图 |

## 正式主页静态槽位

当前代码已固定以下槽位；以后换素材时只替换槽位资源，不改 540×960 逻辑坐标，也不改真实数据绑定：

| 槽位 | 当前状态 | 当前兜底 |
|---|---|---|
| home.background | missing | CSS 背景 |
| home.topChrome | missing | CSS 顶部状态框 |
| home.bottomNav | missing | CSS 五入口导航 |
| home.quick.staff | missing | 字符图标 |
| home.quick.dish | missing | 字符图标 |
| home.quick.activity | missing | 字符图标 |
| home.quick.storage | missing | 字符图标 |
| home.districtDecoration | candidate | city-skyline.png，可在视觉确认后启用 |

## 动态/静态边界

下列内容永久属于动态层，禁止烘焙进图片：

- 游戏日、时钟、暂停/速度；
- 资金、营业额、订单；
- 星级、评价数；
- 门店等级、成长进度；
- 满意度；
- 员工人数与员工数据；
- 菜品数、菜单价格、销量；
- 库存数量、配送状态；
- 商圈热度、消费力、竞争强度、主力客群。

允许进入静态素材的内容仅包括背景、边框、无数值装饰、固定图标、固定栏目装饰和不随状态变化的视觉元素。

## 工程约束

`scripts/check-ui-assets.mjs` 作为确定性门禁：

1. manifest 中所有资产必须真实存在；
2. PNG 必须能解析标准 IHDR；
3. 输出真实宽高和透明通道信息；
4. 每个运行时静态槽位都必须明确 `dynamicDataAllowed=false`；
5. 每个登记资产都必须明确 `dynamicDataBaked=false`；
6. 不通过人工拉伸图片来适配手机比例；
7. 原始母版保留，后续裁切/缩放必须由确定性脚本产生。

## 下一次实际补图的优先级

先补 4 类真正缺失的资源，不生成整张带数据 UI：

1. 主页可 cover 的无字背景母版；
2. 顶部状态栏固定装饰框；
3. 五一级入口的统一图标/选中态方案；
4. 员工 / 菜品 / 活动 / 仓储四个快捷入口图标。

上述四类完成后才继续补次级装饰。旧标题图和旧成长按钮不优先返工。
