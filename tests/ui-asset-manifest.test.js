import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const manifest =
  JSON.parse(
    fs.readFileSync(
      new URL(
        "../assets/manifest.json",
        import.meta.url
      ),
      "utf8"
    )
  );

const home =
  fs.readFileSync(
    new URL(
      "../client/mobile/HomePage.js",
      import.meta.url
    ),
    "utf8"
  );

const buildScript =
  fs.readFileSync(
    new URL(
      "../scripts/build-mobile-ui.mjs",
      import.meta.url
    ),
    "utf8"
  );


test(
  "formal home static slots are declared in the asset manifest",
  () => {
    const slotIds =
      new Set(
        manifest.slots.map(
          slot =>
            slot.id
        )
      );

    for (
      const id
      of [
        "home.background",
        "home.topChrome",
        "home.bottomNav",
        "home.quick.staff",
        "home.quick.dish",
        "home.quick.activity",
        "home.quick.storage"
      ]
    ) {
      assert.ok(
        slotIds.has(
          id
        ),
        id
      );

      assert.match(
        home,
        new RegExp(
          `data-asset-slot="${id.replaceAll(
            ".",
            "\\."
          )}"`
        )
      );
    }
  }
);


test(
  "runtime home does not directly import recovered legacy artwork",
  () => {
    assert.doesNotMatch(
      home,
      /assets\/home\/recovered\//
    );
  }
);


test(
  "asset manifest forbids dynamic gameplay data inside artwork",
  () => {
    assert.equal(
      manifest.rules
        .dynamicDataMayBeBakedIntoArtwork,
      false
    );

    for (
      const asset
      of manifest.assets
    ) {
      assert.equal(
        asset.dynamicDataBaked,
        false,
        asset.id
      );
    }

    for (
      const slot
      of manifest.slots
    ) {
      assert.equal(
        slot.dynamicDataAllowed,
        false,
        slot.id
      );
    }
  }
);


test(
  "mobile build copies the versioned asset directory when it exists",
  () => {
    assert.match(
      buildScript,
      /client\/mobile\/assets/
    );

    assert.match(
      buildScript,
      /fs\.cpSync\(/
    );
  }
);
