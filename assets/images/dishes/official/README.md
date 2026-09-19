# Official dish assets

正式固定菜成品图统一规格：**1024 × 1024 px**。

文件名必须严格使用 `dishes.v1.js` 中真实 `dishId`：

`<dishId>.webp`

页面绝不能按照“第1张 / 第2张 / 第3张”绑定图片。所有门店招牌菜、热销榜、菜单和排行榜均由当前菜品 `dishId` 自动寻找图片。

## 第一批已确认的图片映射

| 画面内容 | 正式 dishId | 正式文件名 |
|---|---|---|
| 花生辣鸡丁 / 宫保风味鸡丁 | `kungpao_chicken` | `kungpao_chicken.webp` |
| 豆瓣麻辣豆腐 | `mapo_tofu` | `mapo_tofu.webp` |
| 青椒牛肉 | `green_pepper_beef` | `green_pepper_beef.webp` |
| 番茄炒蛋 | `tomato_egg` | `tomato_egg.webp` |
| 豆瓣回锅肉 | `douban_pork_belly` | `douban_pork_belly.webp` |

下列已生成画面暂不强行绑定正式菜，避免图菜不一致：红烧肉单盘、鱼香肉丝、水煮鱼、蜜汁鸡翅、鲜虾什锦炒饭。只有在正式数据中存在视觉内容一致的菜品后才能进入 `official`。

## 自研菜

自研菜不得写入本目录。自研菜由程序化合成器生成一次后缓存到：

`assets/images/dishes/generated/<customDishId>.webp`

例如：

`assets/images/dishes/generated/custom_dish_000138.webp`

同一个自研菜 ID 永远读取同一个缓存图，保证外观稳定。
