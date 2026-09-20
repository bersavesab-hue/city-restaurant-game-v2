import test from "node:test";
import assert from "node:assert/strict";

import {
  GameplayNavigationSystem
} from "../src/ui/navigation/GameplayNavigationSystem.js";


test(
  "主导航可以进入并正确返回",
  () => {
    const navigation =
      new GameplayNavigationSystem();


    assert.equal(
      navigation.getCurrentPage().id,
      "restaurant"
    );


    const city =
      navigation.navigate(
        "city"
      );


    assert.equal(
      city.pageId,
      "city"
    );


    const employees =
      navigation.navigate(
        "employees"
      );


    assert.equal(
      employees.pageId,
      "employees"
    );


    const operations =
      navigation.navigate(
        "operations"
      );


    assert.equal(
      operations.pageId,
      "operations"
    );


    const back1 =
      navigation.back();


    assert.equal(
      back1.pageId,
      "employees"
    );


    const back2 =
      navigation.back();


    assert.equal(
      back2.pageId,
      "city"
    );


    const back3 =
      navigation.back();


    assert.equal(
      back3.pageId,
      "restaurant"
    );
  }
);


test(
  "常用经营动作都解析到真实页面",
  () => {
    const navigation =
      new GameplayNavigationSystem();


    const cases = {
      finance:
        "finance",

      analytics:
        "analytics",

      supply:
        "supply",

      employees:
        "employees",

      workforce:
        "workforce-capacity",

      menu:
        "menu-optimization",

      capacity:
        "capacity",

      reputation:
        "reputation",

      channels:
        "channels",

      restaurant:
        "restaurant"
    };


    for (
      const [
        action,
        expected
      ]
      of Object.entries(
        cases
      )
    ) {
      assert.equal(
        navigation
          .resolveActionTarget(
            action
          ),
        expected,
        `${action} 路由错误`
      );
    }
  }
);
