import test from "node:test";
import assert from "node:assert/strict";

import {
  getDishVisualSource,
  getDishVisualSlot
} from "../src/ui/assets/DishVisualResolver.js";


test(
  "固定菜使用official目录且图片槽位跟随dishId",
  () => {
    const dish = {
      id:
        "green_pepper_beef",

      custom:
        false
    };

    assert.equal(
      getDishVisualSource(
        dish
      ),
      "assets/images/dishes/official/green_pepper_beef.webp"
    );

    assert.equal(
      getDishVisualSlot(
        dish
      ),
      "dish-green_pepper_beef"
    );
  }
);


test(
  "自研菜使用generated目录并保持固定dishId映射",
  () => {
    const dish = {
      id:
        "custom_dish_000138",

      custom:
        true
    };

    assert.equal(
      getDishVisualSource(
        dish
      ),
      "assets/images/dishes/generated/custom_dish_000138.webp"
    );

    assert.equal(
      getDishVisualSlot(
        dish
      ),
      "dish-custom_dish_000138"
    );
  }
);
