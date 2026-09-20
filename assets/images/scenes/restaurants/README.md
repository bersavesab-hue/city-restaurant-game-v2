# Restaurant scene assets

正式门店场景横图统一规格：**1600 × 900 px**。

固定文件名：

- 门店经营总控主场景已迁移至 `assets/images/ui/store-home/hero/store-hero.webp`，此目录不再维护重复入口。
- `restaurant-home-hero.webp`：门店主页主场景
- `restaurant-live.webp`：营业现场场景
- `default.webp`：最终通用兜底

运行时由 `VisualAssetBinder` 自动识别。某个专用场景未制作时，会按顺序自动回退到可用场景，不需要修改页面代码。
