import test from "node:test";
import assert from "node:assert/strict";

import {
  INGREDIENTS_V1
} from "../src/data/ingredients.v1.js";

import {
  INGREDIENT_VISUALS,
  getIngredientVisual,
  getIngredientVisualByIndex,
  getIngredientImagePath
} from "../src/data/ingredientVisuals.js";

test(
  "220种食材与220个美术槽位严格1比1对应",
  () => {
    assert.equal(
      INGREDIENT_VISUALS.length,
      220
    );

    assert.equal(
      new Set(
        INGREDIENT_VISUALS.map(
          item => item.image
        )
      ).size,
      220
    );

    INGREDIENTS_V1.forEach(
      (
        ingredient,
        offset
      ) => {
        const index =
          offset + 1;

        const visual =
          INGREDIENT_VISUALS[
            offset
          ];

        assert.equal(
          visual.index,
          index
        );

        assert.equal(
          visual.id,
          ingredient.id
        );

        assert.equal(
          visual.name,
          ingredient.name
        );

        assert.equal(
          visual.category,
          ingredient.category
        );

        assert.equal(
          visual.code,
          String(index)
            .padStart(
              3,
              "0"
            )
        );

        assert.equal(
          visual.batch,
          Math.floor(
            offset / 10
          ) + 1
        );

        assert.equal(
          visual.batchPosition,
          (
            offset %
            10
          ) + 1
        );

        assert.equal(
          visual.image,
          `assets/images/ingredients/${visual.code}_${ingredient.id}.webp`
        );
      }
    );
  }
);

test(
  "序号与ID调用返回同一食材美术槽位",
  () => {
    for (
      let index = 1;
      index <= 220;
      index += 1
    ) {
      const byIndex =
        getIngredientVisualByIndex(
          index
        );

      const byId =
        getIngredientVisual(
          byIndex.id
        );

      assert.deepEqual(
        byId,
        byIndex
      );

      assert.equal(
        getIngredientImagePath(
          byIndex.id
        ),
        byIndex.image
      );
    }
  }
);

test(
  "前20项严格沿用正式数据包顺序",
  () => {
    assert.deepEqual(
      INGREDIENT_VISUALS
        .slice(
          0,
          20
        )
        .map(
          item =>
            item.name
        ),
      [
        "猪肉",
        "五花肉",
        "猪里脊",
        "猪肋排",
        "梅花肉",
        "猪后腿肉",
        "猪肝",
        "猪大肠",
        "猪蹄",
        "牛肉",
        "牛腩",
        "牛里脊",
        "牛腱",
        "牛肚",
        "羊肉",
        "羊腿肉",
        "羊排",
        "羊肉卷",
        "鸡肉",
        "鸡胸肉"
      ]
    );
  }
);
