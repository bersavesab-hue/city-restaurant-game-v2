# Ingredient assets

运行 `npm run assets:ingredients` 会将正式食材图集写入：

`assets/images/ingredients/ingredient-atlas-v1.webp`

运行 `npm run build:android-js` 时会自动执行该步骤。

运行时由 `src/data/ingredientVisuals.js` 按正式 220 食材数据映射精灵位置，UI 不再依赖旧占位图。
