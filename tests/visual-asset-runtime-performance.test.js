import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";


const source =
  fs.readFileSync(
    "src/ui/assets/VisualAssetBinder.js",
    "utf8"
  );


test(
  "食材运行时直接使用正式Atlas而不逐图探测",
  () => {
    const start =
      source.indexOf(
        "async function bindIngredient"
      );

    const end =
      source.indexOf(
        "export async function bindVisualAsset",
        start
      );

    const block =
      source.slice(
        start,
        end
      );

    assert.match(
      block,
      /applyIngredientAtlas/
    );

    assert.doesNotMatch(
      block,
      /firstAvailable/
    );

    assert.doesNotMatch(
      block,
      /withExtensions/
    );
  }
);


test(
  "已经完成的图片绑定不会重复执行",
  () => {
    assert.match(
      source,
      /bindingState === "done"/
    );
  }
);
