import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";


const openingSource =
  fs.readFileSync(
    new URL(
      "../src/ui/pages/opening/OpeningSetupView.js",
      import.meta.url
    ),
    "utf8"
  );


const constructionSource =
  fs.readFileSync(
    new URL(
      "../src/ui/renovation/RenovationConstructionView.js",
      import.meta.url
    ),
    "utf8"
  );


test(
  "首批采购到货后开店准备页面自动刷新",
  () => {
    assert.match(
      openingSource,
      /procurement:delivered/
    );

    assert.match(
      openingSource,
      /unsubscribeProcurement/
    );

    assert.match(
      openingSource,
      /destroy\(\)/
    );
  }
);


test(
  "装修施工完成后施工页面自动刷新",
  () => {
    assert.match(
      constructionSource,
      /renovationConstruction:ready/
    );

    assert.match(
      constructionSource,
      /unsubscribeConstructionReady/
    );

    assert.match(
      constructionSource,
      /destroy\(\)/
    );
  }
);
