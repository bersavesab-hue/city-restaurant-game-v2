import test from "node:test";
import assert from "node:assert/strict";

import { eventBus } from "../src/core/EventBus.js";
import { BusinessAnalyticsView } from "../src/ui/pages/analytics/BusinessAnalyticsView.js";

test("经营数据页在小时经营和日结后自动刷新并在销毁后取消监听", () => {
  const view = new BusinessAnalyticsView({
    pageSystem: {
      getPage() {
        return {};
      }
    }
  });

  let renders = 0;
  view.render = () => { renders += 1; return {}; };

  view.mount({}, {
    restaurantId: "analytics_live_test",
    period: "day"
  });

  assert.equal(renders, 1);

  eventBus.emit("traffic:hourCompleted", {
    restaurantId: "analytics_live_test"
  });
  assert.equal(renders, 2);

  eventBus.emit("traffic:hourCompleted", {
    restaurantId: "other_restaurant"
  });
  assert.equal(renders, 2);

  eventBus.emit("settlement:completed", {
    settlement: {
      restaurantId: "analytics_live_test"
    }
  });
  assert.equal(renders, 3);

  view.destroy();

  eventBus.emit("traffic:hourCompleted", {
    restaurantId: "analytics_live_test"
  });
  assert.equal(renders, 3);
});
