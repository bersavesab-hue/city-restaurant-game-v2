import test from "node:test";
import assert from "node:assert/strict";

import {
  getSlotAssetCandidates
} from "../src/ui/assets/VisualAssetBinder.js";


test(
  "正式视觉位按固定目录自动解析资产候选路径",
  () => {
    assert.deepEqual(
      getSlotAssetCandidates(
        "command-center-hero"
      ).slice(
        0,
        2
      ),
      [
        "assets/images/scenes/restaurants/command-center-hero.webp",
        "assets/images/scenes/restaurants/command-center-hero.png"
      ]
    );

    assert.equal(
      getSlotAssetCandidates(
        "command-dish-dish_001"
      ).includes(
        "assets/images/dishes/official/dish_001.webp"
      ),
      true
    );

    assert.equal(
      getSlotAssetCandidates(
        "command-employee-chef_01"
      ).includes(
        "assets/images/ui/employees/avatars/chef_01.webp"
      ),
      true
    );

    assert.equal(
      getSlotAssetCandidates(
        "restaurant-hero"
      ).includes(
        "assets/images/scenes/restaurants/restaurant-home-hero.webp"
      ),
      true
    );

    assert.equal(
      getSlotAssetCandidates(
        "restaurant-live"
      ).includes(
        "assets/images/scenes/restaurants/restaurant-live.webp"
      ),
      true
    );
  }
);


test(
  "显式图片路径优先于自动候选路径",
  () => {
    const candidates =
      getSlotAssetCandidates(
        "command-employee-chef_09",
        "assets/images/ui/employees/avatars/custom.webp"
      );

    assert.equal(
      candidates[0],
      "assets/images/ui/employees/avatars/custom.webp"
    );
  }
);
