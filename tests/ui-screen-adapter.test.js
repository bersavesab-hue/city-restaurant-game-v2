import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateScreenMetrics,
  SCREEN_DESIGN_SIZE
} from "../client/mobile/ScreenAdapter.js";

test(
  "screen adapter keeps the complete 540x960 reference frame visible",
  () => {
    const samples = [
      [540, 960],
      [360, 800],
      [393, 873],
      [412, 915],
      [1024, 1366],
      [1920, 1080]
    ];

    for (
      const [width, height]
      of samples
    ) {
      const metrics =
        calculateScreenMetrics({
          viewportWidth: width,
          viewportHeight: height
        });

      assert.ok(
        metrics.logicalWidth >=
          SCREEN_DESIGN_SIZE.width -
          0.001
      );

      assert.ok(
        metrics.logicalHeight >=
          SCREEN_DESIGN_SIZE.height -
          0.001
      );

      assert.ok(
        Math.abs(
          metrics.logicalWidth *
          metrics.scale -
          width
        ) < 0.001
      );

      assert.ok(
        Math.abs(
          metrics.logicalHeight *
          metrics.scale -
          height
        ) < 0.001
      );
    }
  }
);

test(
  "tall phones expand logical height instead of stretching the UI",
  () => {
    const metrics =
      calculateScreenMetrics({
        viewportWidth: 360,
        viewportHeight: 800
      });

    assert.equal(
      metrics.scale,
      2 / 3
    );

    assert.equal(
      metrics.logicalWidth,
      540
    );

    assert.equal(
      metrics.logicalHeight,
      1200
    );
  }
);

test(
  "wide and tablet screens expand logical width instead of cropping",
  () => {
    const metrics =
      calculateScreenMetrics({
        viewportWidth: 1024,
        viewportHeight: 1366
      });

    assert.equal(
      Math.round(
        metrics.logicalHeight
      ),
      960
    );

    assert.ok(
      metrics.logicalWidth > 540
    );
  }
);

test(
  "safe-area pixels are converted into logical coordinates",
  () => {
    const metrics =
      calculateScreenMetrics({
        viewportWidth: 360,
        viewportHeight: 800,
        safeTop: 24,
        safeBottom: 18
      });

    assert.equal(
      metrics.safeTop,
      36
    );

    assert.equal(
      metrics.safeBottom,
      27
    );
  }
);
