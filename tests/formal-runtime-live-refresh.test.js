import test from "node:test";
import assert from "node:assert/strict";

import {
  eventBus
} from "../src/core/EventBus.js";

import {
  FormalPageRuntime
} from "../src/ui/runtime/FormalPageRuntime.js";

import {
  operatingCommandCenterPageSystem
} from "../src/ui/pages/command-center/OperatingCommandCenterPageSystem.js";

import {
  operatingCommandCenterView
} from "../src/ui/pages/command-center/OperatingCommandCenterView.js";


test(
  "经营总控在小时营业结束和日结后自动刷新且销毁后取消监听",
  () => {
    const originalGetPage =
      operatingCommandCenterPageSystem
        .getPage;

    const originalRenderMarkup =
      operatingCommandCenterView
        .renderMarkup;


    let renders = 0;


    operatingCommandCenterPageSystem
      .getPage =
      restaurantId => ({
        pageId:
          "operating-command-center",

        restaurantId
      });


    operatingCommandCenterView
      .renderMarkup =
      () => {
        renders += 1;

        return (
          `<main data-render="${renders}"></main>`
        );
      };


    const root = {
      innerHTML:
        "",

      addEventListener() {},

      removeEventListener() {},

      contains() {
        return true;
      }
    };


    try {
      const runtime =
        new FormalPageRuntime();


      const mounted =
        runtime.mount({
          pageId:
            "operating-command-center",

          root,

          restaurantId:
            "restaurant_live_test"
        });


      assert.equal(
        renders,
        1
      );


      eventBus.emit(
        "traffic:hourCompleted",
        {
          restaurantId:
            "restaurant_live_test"
        }
      );


      assert.equal(
        renders,
        2
      );


      eventBus.emit(
        "traffic:hourCompleted",
        {
          restaurantId:
            "other_restaurant"
        }
      );


      assert.equal(
        renders,
        2
      );


      eventBus.emit(
        "settlement:completed",
        {
          settlement: {
            restaurantId:
              "restaurant_live_test"
          }
        }
      );


      assert.equal(
        renders,
        3
      );


      mounted.destroy();


      eventBus.emit(
        "traffic:hourCompleted",
        {
          restaurantId:
            "restaurant_live_test"
        }
      );


      assert.equal(
        renders,
        3
      );
    } finally {
      operatingCommandCenterPageSystem
        .getPage =
        originalGetPage;

      operatingCommandCenterView
        .renderMarkup =
        originalRenderMarkup;
    }
  }
);
