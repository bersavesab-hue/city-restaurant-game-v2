# 当前交接

## 基线
- 仓库：`bersavesab-hue/city-restaurant-game-v2`
- 基线分支：`main`
- 原始基线提交：`e991e156d234fc0262d39b8f0d2af889624433ce`
- 当前工作分支：`ai/baseline-freeze-20260929`
- 当前版本：`0.16.2 / versionCode 1602`

## 已完成并验证
### T01 仓库基线
- 技术栈：JavaScript 核心 + 浏览器移动 UI + Android WebView 壳。
- 已确认底层包含门店、财务、员工、库存、采购、菜品、订单、顾客、营业模拟、装修、评价等系统。

### T02 规范冻结
已加入：
- `AGENTS.md`
- `docs/game-spec.md`
- `docs/ui-spec.md`
- `docs/tasks.md`
- `docs/handoff.md`
- `assets/manifest.json`

首发固定为单店成长，不为了换技术栈重写底层；逻辑坐标继续使用 540×960 基线。

### T03 构建与版本硬化
- package、package-lock、ReleaseInfo、Android Gradle 统一为 0.16.2 / versionCode 1602。
- Android：`com.cityrestaurant.mobileui`，minSdk 24，target/compileSdk 35。
- 普通 CI 与试玩 APK 分离；APK 只在手动或 `playtest-*` 节点构建。
- 测试包内嵌版本 + Git SHA，并生成 build-info / release metadata。
- 已删除仓库里的测试 keystore 文件。
- 当前 APK 使用 `android-debug`，不宣称支持稳定升级安装。

### T04 底层经营闭环
既有集成测试持续证明：
- 客流；
- 订单；
- 菜品生产；
- 库存消耗；
- 销售收入；
- 员工工作；
- 评价；
- 日结；
均使用真实底层系统完成。

### T05 时间、后台与存档
- 1× = 每现实 1 秒推进 2 游戏分钟；2×/4×按比例加速。
- 新档自动运行；有效旧档保留暂停/速度。
- 前台每 30 秒自动保存。
- 后台/pagehide 立即保存并停钟。
- 回前台不补算离线时间；首发无离线收益。
- 主档滚动备份；损坏时尝试备份恢复；未来版本存档禁止静默降级。
- 主档和备份都不可读时阻止自动覆盖。

### T04-UI 手机可玩桥接
已新增 `client/mobile/MobileGameController.js`，正式移动页面不再直接修改资金和库存，而是调用既有业务系统。

新档首次进入会建立一个真实测试门店状态：
- 单店；
- 真实资金账户；
- 厨师、服务员、收银员；
- 真实菜品与配方；
- 真实库存批次；
- 真实营业时间。

当前手机主页已经显示并可操作：
- 真实资金；
- 游戏日期和时间；
- 今日营业额；
- 今日订单；
- 星级；
- 门店等级和成长进度；
- 1×/2×/4×；
- 暂停/继续时间；
- 开始/暂停营业；
- 真实库存；
- 推荐原料采购；
- 配送中订单；
- 营业菜单；
- 最近日结；
- 手动保存；
- T04 测试用“快进 1 小时”。

采购按钮实际执行：供应商报价 → 资金扣除 → procurement_order → 调度配送 → 到货入库，不使用“购买成功”假数据。

说明：当前自动建立门店属于 T04 可玩桥接的测试起点，尚未替代后续正式的新手选址/租赁/装修/证照开店流程。正式首发流程在后续页面模块中接回。

## 最新验证
T04 轻量 CI：
- run：`36463888345`
- 核心/时间/结算：15/15
- 存档兼容与恢复：11/11
- UI/控制器：41/41
- 浏览器移动 UI：构建成功

T04 可玩 APK：
- workflow run：`36463981926`
- APK artifact：`10989685055`
- artifact 名：`restaurant-playtest-7467057b01916215448b37c376bd31d701c7b072`
- APK 内部 SHA-256：`ab6ccb59d687e983c961fda2ce476ce7157b3522427688a54c745203d20f75bb`
- Android 构建：成功
- 签名：`android-debug`，不作为稳定升级签名

### T06 UI 适配
适配规则已实际进入代码和门禁：
- 固定逻辑基线：540×960。
- 9:16：540×960。
- 9:19.5：540×1170。
- 9:20：540×1200。
- 长屏只增加逻辑高度，不拉伸 540×960 参考框。
- 顶部状态区锚定 safe-top。
- 底部一级导航锚定 safe-bottom。
- 中间内容区在两者之间弹性增长。
- 正式主页整体 `overflow:hidden`，不再整页上下滚。
- 经营、研发、员工等长列表只在自己的 `.formal-scroll-list` 内滚动。
- 宽屏/平板继续由 ScreenAdapter 扩展逻辑宽度，核心内容保持居中最大宽度。

新增适配合同直接覆盖 9:16、9:19.5、9:20，不再把 540×1200 当成另一套 UI 坐标。

### T08 正式主页与五个一级入口
T04 的“开发测试面板”已经替换为正式主页骨架，保留原背景母版槽位，动态数据继续独立渲染。

正式一级导航固定为：
1. 门店
2. 经营
3. 研发
4. 员工
5. 更多

门店主页当前显示真实：
- 门店名称与营业状态；
- 日期、时间、速度；
- 资金；
- 星级评价；
- 门店等级和成长进度；
- 今日营业额和订单数；
- 满意度；
- 员工数；
- 菜品数；
- 配送中采购；
- 当前商圈、热度、消费力、竞争强度、主力客群；
- 员工 / 菜品 / 活动 / 仓储快捷入口。

四个其他一级页已经建立真实路由骨架：
- 经营：真实资金、推荐采购、在途采购、实时库存，并继续使用真实采购业务链。
- 研发：真实营业菜单、售价、销量、研究菜品数量和当前最好菜品。
- 员工：真实员工姓名、岗位、等级、状态和心情。
- 更多：真实游戏时间、暂停、1×/2×/4×、门店营业状态、手动存档。

正式主页已删除 T04 的“测试快进 1 小时”按钮。测试控制逻辑仍可保留在内部测试层，但不暴露给正式主页。

T06/T08 轻量 CI：
- run：`36469943239`
- 核心/时间/结算：15/15
- 存档兼容与恢复：11/11
- UI/路由/适配：45/45
- 浏览器移动 UI：构建成功

T06/T08 B 版 APK：
- workflow run：`36470028359`
- APK artifact：`10991312796`
- artifact 名：`restaurant-playtest-8cd47294d3e1475f3a3dd266b2d43f795c40c97b`
- APK 内部 SHA-256：`5d7b6ebc82f7b8f7385d409bebc5f08b3fb5f4d6bdd935c1e2caa62ed209c99e`
- Android 构建：成功
- 签名：`android-debug`，不作为稳定升级签名

## T07 资产清单与视觉母版整理

### 扫描结论
T07 开始时，当前正式分支没有运行时 PNG/JPG/WebP/SVG 成品素材；正式主页依赖 CSS 底板和动态文字控件。

历史提交 `33400d19c27c7617c110eb82c748468a69a015b4` 中找到 14 张旧主页拆图，本阶段已恢复到：

`client/mobile/assets/home/recovered/`

它们被明确隔离为历史参考/候选，不会被正式主页直接导入。

### 资产分类
- `candidate`：1 个，`city-skyline.png`，可作为商圈装饰候选。
- `repair`：2 个。
  - `scene-clean.png`：864×582，只是旧场景裁片，不是完整 9:16 背景。
  - `nav-home.png`：864×130，只有旧“门店选中”状态，不能支持五一级页动态选中。
- `reference`：11 个，包括旧员工头像、旧成长区按钮和旧区块标题。
- 当前最终主页静态资源槽位中，背景、顶部装饰、底部五导航、员工/菜品/活动/仓储四图标仍标记为 `missing`，继续使用 CSS/字符图标兜底，避免为了“有图”强行接旧素材。

### 固定槽位
正式主页已经写入：
- `home.background`
- `home.topChrome`
- `home.bottomNav`
- `home.quick.staff`
- `home.quick.dish`
- `home.quick.activity`
- `home.quick.storage`
- `home.districtDecoration`

以后替换视觉只换这些槽位，不修改 540×960 坐标体系和动态数据绑定。

### 动态/静态边界
永久禁止烘焙进图片：
- 日期、时间、速度；
- 资金、营业额、订单；
- 星级和评价数；
- 等级和成长进度；
- 满意度；
- 员工、菜品、库存、配送数据；
- 商圈实时指标。

允许进入图片的仅为无状态背景、边框、装饰、固定图标和固定栏目视觉。

### 自动资产门禁
新增 `scripts/check-ui-assets.mjs` 并进入 `npm run test:ci`。

门禁会：
- 检查 manifest 中每个文件都真实存在；
- 解析 PNG IHDR；
- 固定真实宽高；
- 固定透明通道元数据；
- 检查所有资产 `dynamicDataBaked=false`；
- 检查所有静态槽位 `dynamicDataAllowed=false`；
- 阻止正式 HomePage 直接引用 `recovered/` 历史资源。

当前 14 张历史 PNG 的真实尺寸和 alpha 信息已经写回 `assets/manifest.json`，任何误改都会直接让 CI 失败。

T07 最终 CI：
- run：`36471768331`
- 资产 manifest：14/14 文件验证通过
- 静态槽位：8 个验证通过
- 核心/时间/结算：15/15
- 存档兼容与恢复：11/11
- UI/路由/适配/资产合同：49/49
- 浏览器移动 UI：构建成功

本阶段没有改游戏行为和屏幕逻辑，因此没有重复生成 APK。

## T09-1 采购 / 库存完整闭环

### 正式经营子页面
“经营”一级页现在拆为三个真实子页：
1. 采购
2. 库存
3. 采购单

一级页本身继续禁止整页滚动；原料、供应商、库存批次和采购单历史只在自己的内部列表滚动。

### 采购
当前支持：
- 查看所有当前等级可用供应商能供应的原料；
- 菜单实际需要的原料优先排序；
- 查看现有库存和在途数量；
- 切换供应商；
- 查看关系、可靠度、最低起订、每日剩余额度、配送时间、品质区间；
- 按最低起订量增加/减少；
- 一键最低量 / 今日最大剩余额度；
- 现付；
- 若供应商提供账期，可选择真实账期；
- 手动获取一次真实供应商报价；
- 报价锁定后页面刷新不重新随机价格和品质；
- 报价显示事件修正后的最终价格和预计配送时间；
- 资金不足时现付确认按钮禁用；
- 确认后调用真实 ProcurementSystem。

### 采购单
真实采购单会显示：
- 原料；
- 数量；
- 供应商；
- 最终金额；
- 付款方式；
- 配送中 / 已到货 / 已取消；
- 配送剩余游戏时间；
- 已到货是否进入库存批次。

配送中的采购单可取消：
- 现付单走真实退款；
- 账期单走真实应付款取消规则；
- 调度任务同步取消。

### 库存
库存页的数据集合为：

**现有库存 ∪ 当前可采购原料**

因此即使某个原料已有库存、但当前供应商未解锁或停售，也不会从库存 UI 消失。

支持：
- 原料总览；
- 可用数量；
- 在途数量；
- 实际库存批次；
- 批次数量；
- 品质；
- 新鲜度；
- 新鲜 / 正常 / 临期 / 腐坏状态；
- 剩余保质天数；
- 批次单位成本；
- 单个腐坏批次清理；
- 一键清理全部腐坏批次。

### 已验证真实链
自动测试已经证明：
- 报价在 UI 重渲染后保持锁定；
- 报价→下单→实际扣款；
- 取消采购单→实际退款；
- 下单→Scheduler 到时→ProcurementSystem.receive；
- 到货→InventorySystem 新增真实批次；
- 采购单和已扣资金经过 SaveSystem 保存、GameState 清空、重新 load 后仍恢复正确。

### T09-1 C 版 APK
- workflow run：`36507097105`
- APK artifact：`11006594686`
- artifact 名：`restaurant-playtest-cb19db806c14237ac0b8d2b699978b68b3e91ade`
- APK SHA-256：`a30f43b34bb140c52c8f99e92f432661c6409c10ce829ec527d12f34b294c3dd`
- Android：BUILD SUCCESSFUL
- 签名：`android-debug`

本节点完整门禁：
- 资产：14 文件 / 8 槽位通过；
- 核心/时间/结算：15/15；
- 存档兼容/恢复：11/11；
- UI/路由/适配/资产/采购控制器：53/53；
- 浏览器移动 UI：成功；
- Android APK：成功。

## T09-2 菜品完整闭环

### 正式菜品子页面
“研发”一级页现在拆为：
1. 营业菜单
2. 菜品库
3. 研发

### 营业菜单
当前支持：
- 查看菜单栏位占用；
- 查看当前在售/下架菜品；
- 菜品详情；
- 基础售价、累计销量、累计营收；
- 菜品熟练度与品阶；
- 售价 -5 / -1 / +1 / +5；
- 真实 MenuSystem.setPrice；
- 上架 / 下架真实调用 MenuSystem.setActive；
- 每次价格变化继续进入 PriceHistorySystem。

### 菜品库
当前展示：
- 当前门店等级已解锁的标准菜品；
- 当前门店自己研发的 custom_dish；
- 是否已加入菜单；
- 菜品类别；
- 基价；
- 菜品详情与配方；
- 当前菜单未满时可真实加入菜单。

菜单加入仍受 StoreProgressSystem 的 menuItems 上限约束，不绕过底层规则。

### 配方详情
每道菜显示：
- 配方；
- 烹饪方式；
- 烹饪时间；
- 难度；
- 每种原料单份需求；
- 当前真实库存；
- 库存不足时的短缺状态。

### 菜品研发
研发页直接使用 DishResearchSystem：
- 选择真实烹饪方式；
- 从真实 ingredient catalog 选择 2–6 种原料；
- 不允许重复原料；
- 自动按现有命名规则生成研发菜名；
- 原料用量调用 DishResearchSystem.getRandomQuantity；
- research() 真实计算评分、难度、烹饪时间、研发成本与建议售价；
- 真实扣研发资金；
- 真实创建 custom_dish；
- 真实创建 custom_recipe；
- RestaurantDishSystem 自动创建门店菜品成长状态；
- 研发完成后自动选择新菜，可加入营业菜单。

本阶段不伪造“固定研发结果”；灵感、评分和建议售价继续保留现有随机波动规则。

### 已验证真实链
自动测试已经证明：
- 菜品改价实际进入 MenuSystem；
- 上架/下架实际改变 menu_item.active；
- 研发实际扣除资金；
- 研发后存在真实 custom_dish；
- 研发后存在真实 custom_recipe；
- 新菜存在 RestaurantDishSystem 成长状态；
- 新菜可以真实加入菜单；
- 改价、下架、自研菜和菜单状态经过 SaveSystem 保存、GameState 清空、重新 load 后仍正确恢复。

### T09-2 菜品 APK
- workflow run：`36508099878`
- APK artifact：`11007529125`
- artifact 名：`restaurant-playtest-f53e84d810c8e74249d63a9fd61f1e77f430f3f1`
- APK SHA-256：`1a8af96ea39df2240836925b2f3d093189bc7cfd4b807e94c71f6e9ee6a43d54`
- Android：BUILD SUCCESSFUL
- 签名：`android-debug`

本节点完整门禁：
- 资产：14 文件 / 8 槽位；
- 核心/时间/结算：15/15；
- 存档兼容/恢复：11/11；
- UI/路由/适配/资产/采购/菜品：56/56；
- 浏览器移动 UI：成功；
- Android APK：成功。

## T09-3 员工完整闭环

### 正式员工子页面
“员工”一级页现在拆为：
1. 团队
2. 招聘
3. 排班
4. 薪资

### 团队与员工详情
当前支持：
- 在册员工列表；
- 岗位、等级、职业职级；
- 心情、忠诚、疲劳；
- 员工满意度；
- 离职风险；
- 潜力；
- 核心技能；
- 培训次数；
- 职业晋升状态。

员工满意度继续调用 EmployeeDynamicsSystem，离职风险继续调用 EmployeeStaffingSystem，不在 UI 端重新计算一套规则。

### 招聘
人才市场直接使用 EmployeeStaffingSystem：
- 首次进入时生成真实候选人池；
- 候选人包含年龄、行业经验、岗位、潜力、画像、特质、稳定性、学习能力、抗压、协作、主动性；
- 显示真实期望月薪；
- 展示 StaffingRecommendationSystem 当前岗位建议；
- 可刷新人才池；
- 招聘后真实创建 employee；
- 候选人状态变为 hired；
- 继续受 StoreProgressSystem 员工人数上限约束。

### 培训与晋升
培训直接调用 EmployeeCareerSystem：
- 展示岗位可用培训项目；
- 职级未解锁项目不可训练；
- 资金不足不可训练；
- 疲劳 >= 90 时不可训练；
- 培训真实扣费；
- 真实增加经验、技能、疲劳、心情/忠诚和 trainingCount；
- 晋升按钮继续使用真实经验、工作时长、主技能、忠诚度条件；
- 符合条件才可晋升，并按底层规则调整职级和工资。

### 排班
排班直接写入 EmployeeStaffingSystem 的 employee_shift：
- 7 天独立开/关；
- 显示实际开始/结束时间；
- 默认班次从门店开门时间开始；
- 单日预设最长 8 小时，不把 9:00-22:00 整段强塞给员工；
- “标准排班”生成周一至周五 5 天、每天 8 小时；
- 周六周日保持休息；
- 可一键清空该员工排班。

### 薪资与人工成本
当前显示：
- 门店当前月工资总额；
- 员工个人月薪；
- 市场建议薪资；
- 薪资满意度；
- 总欠薪；
- 下一工资结算日；
- 工资结算历史。

调薪支持：
- -500
- -100
- 调整到建议薪资
- +100
- +500

调薪直接调用 EmployeeSystem.setSalary，不额外把工资四舍五入到百元。曾发现 ¥6530 + 500 被 UI 额外取整成 ¥7000 的问题，现已修正为准确的 ¥7030。

工资仍按 EmployeeStaffingSystem 既有规则每 30 个游戏日自动结算，不增加一个绕过时间系统的“手动发工资”按钮。

### 已验证真实链
自动测试已经证明：
- 人才市场能真实生成候选人；
- 招聘后员工人数真实增加；
- candidate 状态变为 hired；
- 培训实际扣除资金；
- trainingCount 实际增加；
- 调薪准确写入 EmployeeSystem；
- 标准排班真实生成周一至周五 5 个 employee_shift；
- 每班 480 分钟；
- 调薪、排班、已招聘员工和候选人状态经过 SaveSystem 保存、GameState 清空、重新 load 后仍正确恢复。

### T09-3 员工 APK
- workflow run：`36509785307`
- APK artifact：`11009130987`
- artifact 名：`restaurant-playtest-074c6c1e056888d8b4f585ec0a430bf6fa421337`
- APK SHA-256：`f67217e422e011e266fd77be9cc716c672b9cf433ff34aa80ec6ae2f3eba6b56`
- Android：BUILD SUCCESSFUL
- 签名：`android-debug`

本节点完整门禁：
- 资产：14 文件 / 8 槽位；
- 核心/时间/结算：15/15；
- 存档兼容/恢复：11/11；
- UI/路由/适配/资产/采购/菜品/员工：59/59；
- 浏览器移动 UI：成功；
- Android APK：成功。

## T09-4 活动 / 营销完整闭环

### 正式活动入口
“经营”一级页现在包含：
1. 采购
2. 库存
3. 采购单
4. 活动

主页“活动”快捷入口会直接打开经营页的活动子页；“仓储”快捷入口会直接打开库存子页，不再先落到采购页。

### 活动列表与分类
活动页直接读取 MarketActionSystem / MARKETING_ACTIONS_V1，不建立第二套活动表。

当前覆盖 9 类真实营销：
- 本地获客；
- 优惠转化；
- 品牌建设；
- 内容社交；
- 外卖增长；
- 社区活动；
- 会员复购；
- 团体业务；
- 节日主题。

活动列表显示：
- 名称；
- 类别；
- 成本；
- 持续天数；
- 门店等级要求；
- 当前是否可开始；
- 进行中剩余天数；
- 冷却剩余天数。

### 活动开始条件
开始活动继续由 MarketActionSystem.getAvailability 判断，UI 不复制规则。

真实限制包括：
- 门店等级；
- 资金；
- 同时最多 2 个活动；
- 同一活动不能重复启动；
- exclusiveGroup 同类互斥；
- 所需销售渠道；
- 活动冷却。

开始后直接调用 MarketActionSystem.startAction：
- 真实扣除 MARKETING 费用；
- 写入 activeMarketActions；
- 写入 marketActionHistory；
- 记录 startDay / endDay；
- 发出 market:actionStarted。

### 活动效果
UI 显示底层实际 modifiers，包括：
- demandMultiplier 客流需求；
- priceMultiplier 实际成交价；
- marketAppealMultiplier 市场吸引；
- repeatIntentMultiplier 复购倾向；
- reviewPropensityMultiplier 评价意愿；
- serviceCapacityMultiplier 服务容量；
- qualityBonus 品质加成；
- segmentMultipliers 指定客群；
- channelMultipliers 指定渠道。

这些值不是“说明文字”，已被现有经营系统实际读取：
- TrafficDemandSystem 使用 demand / appeal / segment / channel 修正；
- TrafficSystem 使用服务容量和渠道修正；
- OrderSystem 使用 priceMultiplier 计算实际订单单价和收入；
- CustomerExperienceSystem 使用 quality / repeat / review / service 修正评价与复购。

### 活动结束与冷却
活动不提供绕过底层规则的“手动秒结束”按钮。

OperatingCycleSystem 的每日 onDay 已调用 MarketActionSystem.processDay：
- 到 endDay 后自动结束；
- activeMarketActions 自动清理；
- history 状态改为 ended；
- 发出 market:actionEnded；
- 之后按 cooldownDays 进入冷却；
- availableDay 到达后才允许再次开始。

### 活动观察数据
活动页会显示：
- 当前进行中活动数 / 2；
- 午间 12:00 实时预计客流；
- 选中活动的具体效果；
- 当前全部活动叠加后的综合修正；
- 最近活动历史；
- 当前评价诊断的主要问题/正向反馈。

### 并发提交清理
本阶段开发中出现一次并发提交把营销渲染函数重复写入 HomePage 的情况。

已处理：
- 保留并发提交对采购/库存列表数据源的正确修复；
- 保留经营页活动统计；
- 删除重复的 marketingCategoryLabel / marketingReasonLabel / renderMarketingPanel 等声明；
- 没有回退有效代码。

最终经营页：
- 采购原料列表使用 business.catalog；
- 库存列表使用 business.inventoryCatalog；
- 营销渲染只有一套实现。

### 已验证真实链
自动测试已经证明：
- 活动启动真实扣除资金；
- activeMarketActions 真实新增；
- marketActionHistory 真实写入；
- 活动需求倍率实际改变 TrafficDemandSystem 的预计客流；
- 限时优惠 priceMultiplier=0.9 会进入 OrderSystem，真实改变订单 unitPrice 与 totalRevenue；
- 带评价加成的活动会进入 CustomerExperienceSystem.marketingEffects.reviewPropensityMultiplier；
- 评价记录随 CustomerExperienceSystem 正常更新；
- 活动到期后 processDay 会结束活动；
- 结束后真实进入 cooldown；
- 到 availableDay 后重新可用；
- 进行中活动、历史记录和已扣资金经过 SaveSystem 保存、GameState 清空、重新 load 后仍正确恢复。

### T09-4 活动 APK
- workflow run：`36510957604`
- APK artifact：`11009053259`
- artifact 名：`restaurant-playtest-e2d8f1f0392c11d1344a0eac4940b03a3ab48637`
- APK SHA-256：`2c2ba2df5fe0725de4ce02712be9110f664f5a814237cb8da6e3ead2ce6bbbf0`
- Android：BUILD SUCCESSFUL
- 签名：`android-debug`

本节点完整门禁：
- 资产：14 文件 / 8 槽位；
- 核心/时间/结算：15/15；
- 存档兼容/恢复：11/11；
- UI/路由/适配/资产/采购/菜品/员工/活动：65/65；
- 浏览器移动 UI：成功；
- Android APK：成功。

## T09-4 活动 / 营销完整闭环

### 正式活动入口
活动没有新增第六个一级入口，而是作为“经营”一级页的第 4 个子页：
1. 采购
2. 库存
3. 采购单
4. 活动

主页“活动”快捷入口会直接打开“经营 → 活动”，主页“仓储”快捷入口会直接打开“经营 → 库存”。

### 活动列表与限制
当前 UI 直接读取 MarketActionSystem 的 9 类营销活动：
- 本地获客；
- 优惠转化；
- 品牌建设；
- 内容社交；
- 外卖增长；
- 社区活动；
- 会员复购；
- 团体业务；
- 节日主题。

每个活动真实展示：
- 成本；
- 持续游戏日；
- 冷却游戏日；
- 门店等级要求；
- 目标客群；
- 所需销售渠道；
- 当前是否可启动；
- 不可启动原因；
- 活动剩余时间；
- 历史状态。

系统继续使用底层既有约束：
- 最多同时 2 个活动；
- 同一 exclusiveGroup 不能同时叠加；
- 等级不足不能开启；
- 资金不足不能开启；
- 所需渠道未开启不能开启；
- 冷却期内不能重复开启。

### 开始与结束
开始活动直接调用 MarketActionSystem.startAction：
- FinanceSystem 真实扣除营销成本；
- 写入 activeMarketActions；
- 写入 marketActionHistory；
- 立即进入经营修正模型。

本阶段没有增加“随时取消并退款”这种底层不存在的规则。

活动按游戏日自动到期：
- MarketActionSystem.processDay 处理结束；
- OperatingCycleSystem 已在每日推进中调用；
- 到期后从 activeMarketActions 移除；
- 历史状态更新为 ended；
- 随后进入真实 cooldown。

### 对经营的真实影响
活动效果不是 UI 预览数字，已经进入实际经营链：

**客流**
- TrafficDemandSystem 读取 demandMultiplier；
- 分客群 segmentMultipliers；
- 分渠道 channelMultipliers；
- marketAppealMultiplier 进入吸引力与竞争计算。

**实际成交收入**
- OrderSystem 读取 priceMultiplier；
- 优惠活动会改变真实订单 unitPrice 和 totalRevenue；
- 测试已证明 flash_coupon 的 0.9 倍成交价实际进入真实订单，而不只是界面显示。

**品质 / 服务 / 复购 / 评价**
- CustomerExperienceSystem 读取 qualityBonus；
- serviceCapacityMultiplier；
- repeatIntentMultiplier；
- reviewPropensityMultiplier；
- 评价数量与顾客体验因此真实变化。

### 活动页实时信息
当前活动页面显示：
- 当前进行中活动数 / 上限；
- 午间预估客流；
- 当前所有活动综合效果；
- 活动分类筛选；
- 活动详情；
- 成本 / 持续 / 冷却 / 等级要求；
- 具体客流、成交价、吸引力、复购、评价意愿、服务能力、品质效果；
- 不可开始原因；
- 最近活动历史；
- 活动剩余游戏日。

### 保存恢复
自动测试已经证明：
- 活动开始后真实扣款；
- activeMarketActions 可保存；
- marketActionHistory 可保存；
- 保存后清空 GameState 再 load；
- 进行中活动、历史和已扣余额都正确恢复。

### T09-4 活动 APK
- workflow run：`36510957604`
- APK artifact：`11009053259`
- artifact 名：`restaurant-playtest-e2d8f1f0392c11d1344a0eac4940b03a3ab48637`
- APK SHA-256：`2c2ba2df5fe0725de4ce02712be9110f664f5a814237cb8da6e3ead2ce6bbbf0`
- Android：BUILD SUCCESSFUL
- 签名：`android-debug`

本节点完整门禁：
- 资产：14 文件 / 8 槽位；
- 核心/时间/结算：15/15；
- 存档兼容/恢复：11/11；
- UI/路由/适配/资产/采购/菜品/员工/活动：65/65；
- 浏览器移动 UI：成功；
- Android APK：成功。

## T09-5 装修 / 设施完整闭环

### 首发方案
T09-5 不接自由摆放编辑器作为玩家主玩法。

玩家侧采用：
1. 固定装修模板；
2. 系统自动摆位；
3. 真实施工；
4. 完工验收；
5. 后续固定设施升级继续自动找合法位置。

底层现有 RenovationEditorSystem 仍保留，用作自动布局与规则执行，不直接暴露自由编辑操作。

### 首次装修
当前可读取 24 套 RenovationPlanningSystem 固定模板。

模板真实判断：
- 门店等级；
- 可用面积；
- 设施是否解锁；
- 资金；
- 当前布局是否为空；
- 商业定位匹配；
- 面积匹配；
- 预算匹配。

移动端显示：
- 模板名称；
- 最低等级；
- 最低 / 理想面积；
- 匹配分；
- 家具设施成本；
- 基础施工成本；
- 项目总预算；
- 当前资金；
- 不可施工原因。

开始装修后：
- RenovationEditorSystem 自动生成合法摆位；
- 真实购买家具 / 设备；
- RenovationRealityCostSystem 计算基础施工费；
- RenovationConstructionSystem 创建施工任务；
- 装修布局在施工期间保持未启用；
- 不允许同时开启第二个施工项目。

### 施工
施工周期继续使用底层 estimateDurationDays：
- 最短 3 天；
- 最长 10 天；
- 面积和设施数量共同决定工期。

UI 显示：
- 当前阶段；
- 施工进度；
- 开工日；
- 预计完工日；
- 总工期；
- 剩余天数；
- 项目总额。

每日 OperatingCycleSystem 继续调用 RenovationConstructionSystem.processDay。

施工到期后进入 ready_for_inspection，不自动启用。

### 验收
玩家点击“验收并启用装修”后调用 RenovationConstructionSystem.inspect。

验收会：
- 检查施工是否完成；
- 检查布局 revision 是否被非法改变；
- 调用 RenovationSystem.activateLayout；
- 将 construction 标记 completed；
- 开启真实装修经营修正。

### 固定设施升级
首套装修完成后，页面切换为“固定设施升级”。

设施按以下分类显示：
- 桌椅；
- 厨房；
- 服务；
- 等候；
- 装饰。

每项显示：
- 名称；
- 规格；
- 价格；
- 解锁等级；
- 已安装数量；
- 餐位；
- 厨房工位；
- 厨房效率；
- 服务效率；
- 排队效率；
- 等候容量；
- 吸引力；
- 舒适度。

玩家选择设施后不进入自由摆放。

控制器会：
1. 打开 RenovationEditorSystem 临时会话；
2. 调用 RenovationPlanningSystem.getCandidateCoordinates；
3. 逐个尝试合法位置；
4. 由 RenovationEditorSystem.addItem 执行真实碰撞、边界、店面结构、门店上限检查；
5. 找到合法位置后保存；
6. 再次进入真实施工流程。

没有合法位置时直接拒绝安装，不强行重叠或越界。

### 装修真实经营效果
验收后继续由既有系统读取装修结果。

RenovationSystem：
- seats；
- tables；
- kitchenStations；
- kitchenEfficiency；
- serviceEfficiency；
- queueEfficiency；
- queueCapacityBonus；
- appealMultiplier；
- comfortBonus。

LayoutFlowSystem：
- 厨房动线；
- 前厅动线；
- 密度；
- 通道效率；
- 舒适度；
- 等候支持；
- flowScore；
- 布局问题诊断。

SeatingSystem 继续读取真实餐位与排队修正。

ServiceCapacitySystem 继续读取：
- renovationKitchenGuests；
- renovationServiceGuests；
- workforce；
- equipmentCapacity；
并参与真实厨房 / 前厅 / 收银产能限制。

本阶段将 ServiceCapacitySystem 正式暴露到 app.systems，移动控制器不复制第二套产能公式。

### 测试门店修正
T04 测试桥接原先单纯选择“最便宜铺位”，可能落到 cloud_kitchen。

为了使装修试玩链成立，测试桥接现在优先选择：
- 可用面积 >= 36㎡；
- 非 cloud_kitchen；
- 非 stall；
- 再按租金从低到高选择。

这只影响 T04 / T09 试玩桥接，不替代正式首发的新手选址 / 租赁流程。

### 已验证真实链
自动测试已证明：
- 首次进入装修页会创建真实 renovation_layout；
- 至少存在一套真实可执行模板；
- 模板开工后家具与基础施工真实扣款；
- renovation_construction 状态为 building；
- 施工期 layout.active=false；
- 施工时间推进后变为 ready_for_inspection；
- 验收后 layout.active=true；
- 餐位 >= 2；
- 厨房工位 >= 1；
- ServiceCapacitySystem 能读取 active renovation；
- 完成后的装修布局、设施和施工状态经过 SaveSystem 保存、GameState 清空、重新 load 后仍恢复正确；
- 已完成首装后可选择单个固定设施；
- 系统会自动找合法位置；
- 新设施会真实写入 placements；
- 后续设施升级再次进入施工；
- 首次基础施工已支付后，后续单设施升级 baseConstructionCost=0；
- 再次验收后装修效果继续生效。

### T09-5 装修 APK
- workflow run：`36512178887`
- APK artifact：`11010180850`
- artifact 名：`restaurant-playtest-94e228916e52a7e17fa2dfe9fe14f5fc5597266a`
- APK SHA-256：`4954a345d4e60d766be7c031f08b2b97ca771bfceb73bb94cb537dab1880d004`
- Android：BUILD SUCCESSFUL
- 签名：`android-debug`

本节点完整门禁：
- 核心 / 时间 / 结算：15/15；
- 存档兼容 / 恢复：11/11；
- UI / 路由 / 适配 / 资产 / 采购 / 菜品 / 员工 / 活动 / 装修：68/68；
- 浏览器移动 UI：成功；
- Android APK：成功。

## 当前状态
T09 经营模块 UI 补齐已经全部完成：
- T09-1 采购 / 库存：VERIFIED
- T09-2 菜品：VERIFIED
- T09-3 员工：VERIFIED
- T09-4 活动 / 营销：VERIFIED
- T09-5 装修 / 设施：VERIFIED
- T09：VERIFIED

已完成经营链只修真实回归问题，不再重做接口。

## 下一任务
**T10：首发成长与内容填充。**

重点：
1. 固定首发 3 个单店成长阶段；
2. 检查菜品数量是否达到首发预算；
3. 检查原料、供应商、员工、活动、装修内容是否在各阶段合理解锁；
4. 将门店等级、经验、阶段目标、功能解锁串成明确成长节奏；
5. 补足真正影响玩法的事件 / 目标，不增加无意义页面；
6. 首发字段冻结，避免内容阶段继续扩散接口。

完成 T10 后进入 T11 数值模拟与平衡。
