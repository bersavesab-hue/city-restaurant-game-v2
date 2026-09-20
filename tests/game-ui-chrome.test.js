import test from "node:test";
import assert from "node:assert/strict";

import {
  renderGameTopBar,
  renderBottomNavigation,
  renderGameScreen
} from "../src/ui/components/GameChromeView.js";


test(
  "GameChrome 使用当前模型渲染顶部栏",
  () => {
    const html =
      renderGameTopBar({
        restaurantName:
          "测试门店",

        balance:
          12000,

        storeLevel:
          2,

        reputation:
          18,

        weather: {
          label:
            "晴"
        },

        clock: {
          clockText:
            "09:00",

          dateText:
            "第1天",

          paused:
            false,

          speed:
            1,

          speedOptions: [
            1,
            2,
            4
          ]
        }
      });


    assert.match(
      html,
      /rg-topbar/
    );

    assert.match(
      html,
      /测试门店/
    );

    assert.match(
      html,
      /12,000/
    );

    assert.match(
      html,
      /Lv\.2/
    );

    assert.match(
      html,
      /09:00/
    );

    assert.match(
      html,
      /data-page-target="settings"/
    );
  }
);


test(
  "GameChrome 仅在多门店时显示集团与门店作用域",
  () => {
    const html = renderGameTopBar({
      restaurantName: "东门小馆",
      scope: {
        type: "group",
        canSwitch: true,
        storeId: "store_1",
        stores: [
          { id: "store_1", name: "东门小馆" },
          { id: "store_2", name: "滨河店" }
        ]
      },
      clock: {}
    });

    assert.match(html, /集团视角/);
    assert.match(html, /东门小馆/);
    assert.match(html, /滨河店/);
    assert.match(html, /switch-management-scope/);
  }
);


test(
  "GameChrome 使用当前导航接口组合完整页面",
  () => {
    const nav =
      renderBottomNavigation([
        {
          id:
            "restaurant",

          label:
            "门店",

          active:
            true
        },

        {
          id:
            "employees",

          label:
            "员工"
        }
      ]);


    assert.match(
      nav,
      /data-page-target="restaurant"/
    );

    assert.match(
      nav,
      /data-page-target="employees"/
    );


    const screen =
      renderGameScreen({
        body:
          "<section>BODY</section>",

        bottomNavigation: [
          {
            id:
              "restaurant",

            label:
              "门店"
          }
        ]
      });


    assert.match(
      screen,
      /rg-screen/
    );

    assert.match(
      screen,
      /BODY/
    );

    assert.match(
      screen,
      /rg-bottom-nav/
    );
  }
);
