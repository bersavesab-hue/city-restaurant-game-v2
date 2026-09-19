import "../theme/theme.css";
import "./runtime-enhancements.css";

import "../../systems/CustomerLoyaltyIntegrationSystem.js";
import "../../systems/WordOfMouthSystem.js";

import {
  customerSegmentSystem
} from "../../systems/CustomerSegmentSystem.js";

import {
  saveSystem
} from "../../core/SaveSystem.js";

import {
  feedbackSystem
} from "../../systems/FeedbackSystem.js";

import {
  gameState
} from "../../core/GameState.js";

import {
  gameFoundationSystem
} from "../../systems/GameFoundationSystem.js";

import {
  gameRuntimeLoop
} from "./GameRuntimeLoop.js";

import {
  cityMapViewportRuntime
} from "./CityMapViewportRuntime.js";

import {
  formalPageRuntime
} from "./FormalPageRuntime.js";

import {
  gameplayNavigationSystem
} from "../navigation/GameplayNavigationSystem.js";

import {
  restaurantSystem
} from "../../systems/RestaurantSystem.js";

import {
  financeSystem
} from "../../systems/FinanceSystem.js";

import {
  districtSystem
} from "../../systems/DistrictSystem.js";

import {
  propertySystem
} from "../../systems/PropertySystem.js";



import {
  openingFlowSystem
} from "../../systems/OpeningFlowSystem.js";

import {
  CityMapView
} from "../pages/city/CityMapView.js";

import {
  CityPropertyView
} from "../pages/city/CityPropertyView.js";

import {
  PropertyDetailView
} from "../pages/city/PropertyDetailView.js";


import {
  OpeningSetupView
} from "../pages/opening/OpeningSetupView.js";

import {
  EmployeeManagementView
} from "../pages/employees/EmployeeManagementView.js";

import {
  DishCenterView
} from "../pages/dishes/DishCenterView.js";

import {
  BusinessAnalyticsView
} from "../pages/analytics/BusinessAnalyticsView.js";

import {
  RenovationGameView
} from "../renovation/RenovationGameView.js";

import {
  RenovationConstructionView
} from "../renovation/RenovationConstructionView.js";

import {
  gameChromeSystem
} from "../components/GameChromeSystem.js";

import {
  renderBottomNavigation
} from "../components/GameChromeView.js";

import {
  bindVisualAsset,
  bindVisualAssets
} from "../assets/VisualAssetBinder.js";


const root =
  document.getElementById(
    "app"
  );

let restaurantId =
  null;

let currentView =
  null;


let currentRoute =
  null;

let routeRevision =
  0;

const navigationHistory =
  [];

let handlingBackNavigation =
  false;


const SEGMENT_NAMES =
  new Map();

let runtimeEnhancementObserver =
  null;

let runtimeEnhancementFrame =
  null;

const pendingEnhancementRoots =
  new Set();


function refreshSegmentNames() {
  SEGMENT_NAMES.clear();

  for (
    const segment
    of customerSegmentSystem
      .getAll()
  ) {
    SEGMENT_NAMES.set(
      segment.id,
      segment.name
    );
  }
}


function updateVisibleCustomerLabels() {
  root
    .querySelectorAll(
      ".city-customer-mix article > span:first-child"
    )
    .forEach(
      element => {
        const id =
          element.textContent
            ?.trim();

        const name =
          SEGMENT_NAMES.get(
            id
          );

        if (!name) {
          return;
        }

        element.textContent =
          name;

        element.dataset
          .segmentName =
          id;
      }
    );
}


function startRuntimeEnhancements() {
  refreshSegmentNames();
  updateVisibleCustomerLabels();

  void bindVisualAssets(
    root
  );

  runtimeEnhancementObserver
    ?.disconnect();


  const flush =
    () => {
      runtimeEnhancementFrame =
        null;

      const nodes =
        [
          ...pendingEnhancementRoots
        ];

      pendingEnhancementRoots
        .clear();


      let needsCustomerRefresh =
        false;


      for (
        const node
        of nodes
      ) {
        if (
          !node ||
          node.nodeType !== 1
        ) {
          continue;
        }


        if (
          node.matches?.(
            ".city-customer-mix, .city-customer-mix *"
          ) ||
          node.querySelector?.(
            ".city-customer-mix"
          )
        ) {
          needsCustomerRefresh =
            true;
        }


        if (
          node.matches?.(
            "[data-image-slot], [data-ingredient-id]"
          )
        ) {
          void bindVisualAsset(
            node
          );
        }


        void bindVisualAssets(
          node
        );
      }


      if (
        needsCustomerRefresh
      ) {
        updateVisibleCustomerLabels();
      }
    };


  runtimeEnhancementObserver =
    new MutationObserver(
      mutations => {
        for (
          const mutation
          of mutations
        ) {
          for (
            const node
            of mutation.addedNodes
          ) {
            if (
              node?.nodeType === 1
            ) {
              pendingEnhancementRoots
                .add(
                  node
                );
            }
          }
        }


        if (
          pendingEnhancementRoots.size ===
          0 ||
          runtimeEnhancementFrame !==
          null
        ) {
          return;
        }


        runtimeEnhancementFrame =
          requestAnimationFrame(
            flush
          );
      }
    );


  runtimeEnhancementObserver
    .observe(
      root,
      {
        childList:
          true,

        subtree:
          true
      }
    );
}


function dispatchRuntimeEvent(
  phase,
  current,
  previous
) {
  window.dispatchEvent(
    new CustomEvent(
      `restaurant-game:${phase}`,
      {
        detail: {
          current,
          previous
        }
      }
    )
  );
}


function ensureRestaurant() {
  let restaurant =
    restaurantSystem
      .list()[0] ??
    null;

  if (!restaurant) {
    restaurant =
      restaurantSystem.create({
        name:
          "新城小馆"
      });
  }

  if (
    !financeSystem
      .findAccount(
        restaurant.id
      )
  ) {
    financeSystem.createAccount(
      restaurant.id,
      120000
    );
  }

  return restaurant.id;
}


function firstLaunch() {
  let loaded =
    false;

  try {
    if (
      saveSystem.has(
        "auto"
      )
    ) {
      saveSystem.load(
        "auto"
      );

      loaded =
        true;
    }
  } catch (
    error
  ) {
    console.warn(
      "存档载入失败",
      error
    );
  }

  gameFoundationSystem.initialize({
    seedProperties:
      true,

    overwriteReferenceData:
      true
  });

  restaurantId =
    ensureRestaurant();

  if (!loaded) {
    try {
      saveSystem.save(
        "auto"
      );
    } catch {}
  }
}


function updateVisibleClock() {
  const clock =
    gameRuntimeLoop.getClockText();

  const clockNode =
    root.querySelector(
      ".rg-topbar__clock strong"
    );

  if (clockNode) {
    clockNode.textContent =
      clock.clockText;
  }

  const dayNode =
    root.querySelector(
      ".rg-topbar__clock small"
    );

  if (dayNode) {
    dayNode.textContent =
      clock.dayText;
  }

  const runtime =
    gameState.getSection(
      "runtime"
    );

  root
    .querySelectorAll(
      '[data-action="speed"]'
    )
    .forEach(
      button => {
        button.classList.toggle(
          "is-active",
          !runtime.paused &&
          Number(
            button.dataset.speed
          ) ===
            runtime.speed
        );
      }
    );

  const pauseButton =
    root.querySelector(
      '[data-action="pause"]'
    );

  if (pauseButton) {
    pauseButton.textContent =
      runtime.paused
        ? "▶"
        : "Ⅱ";
  }
}


function startRuntimeSystems() {
  gameRuntimeLoop.resume();

  gameRuntimeLoop.start({
    onMinute(
      current,
      previous
    ) {
      updateVisibleClock();

      dispatchRuntimeEvent(
        "minute",
        current,
        previous
      );
    },

    onHour(
      current,
      previous
    ) {
      updateVisibleClock();
      updateVisibleCustomerLabels();

      dispatchRuntimeEvent(
        "hour",
        current,
        previous
      );
    },

    onDay(
      current,
      previous
    ) {
      saveNow();

      dispatchRuntimeEvent(
        "day",
        current,
        previous
      );
    },

    onError(error) {
      feedbackSystem
        .captureRuntimeError(
          error,
          "simulation-loop"
        );

      console.error(
        "经营模拟循环错误",
        error
      );
    }
  });

}


function saveNow() {
  try {
    saveSystem.save(
      "auto"
    );
  } catch (
    error
  ) {
    console.warn(
      "自动存档失败",
      error
    );
  }
}


function destroyCurrent() {
  cityMapViewportRuntime
    .stop();

  if (
    currentView &&
    typeof currentView
      .destroy ===
      "function"
  ) {
    try {
      currentView.destroy();
    } catch {}
  }

  currentView =
    null;

  root.innerHTML =
    "";
}


function errorPage(
  error
) {
  root.innerHTML = `
    <main
      style="
        min-height:100vh;
        padding:24px;
        color:#174f7e;
        background:#eaf7fd;
        font-family:sans-serif;
      "
    >
      <h2>
        页面加载失败
      </h2>

      <p
        style="
          padding:12px;
          border-radius:8px;
          background:#fff;
          line-height:1.6;
        "
      >
        已在本机记录诊断信息。可以返回门店继续游戏，
        或前往“更多 → 测试反馈”生成报告。
      </p>

      <button
        id="return-city"
        style="
          min-height:42px;
          margin-right:8px;
        "
      >
        返回门店
      </button>

      <button
        id="clear-save"
        style="
          min-height:42px;
        "
      >
        清除测试存档
      </button>
    </main>
  `;

  document
    .getElementById(
      "return-city"
    )
    ?.addEventListener(
      "click",
      () =>
        navigate(
          "restaurant"
        )
    );

  document
    .getElementById(
      "clear-save"
    )
    ?.addEventListener(
      "click",
      () => {
        saveSystem.remove(
          "auto"
        );

        location.reload();
      }
    );
}



function navigate(
  pageId,
  passedRestaurantId =
    restaurantId,
  params = {}
) {
  restaurantId =
    passedRestaurantId ??
    restaurantId;

  routeRevision +=
    1;

  const nextRoute = {
    pageId,
    restaurantId,
    params:
      structuredClone(
        params ??
        {}
      )
  };

  if (
    !handlingBackNavigation &&
    currentRoute
  ) {
    navigationHistory.push(
      currentRoute
    );

    while (
      navigationHistory.length >
      50
    ) {
      navigationHistory.shift();
    }
  }

  currentRoute =
    nextRoute;

  /*
   * 导航不是经营数据修改。
   * 不允许每次点击页面都同步序列化整个存档。
   */
  destroyCurrent();

  try {


    if (
      pageId ===
      "restaurant"
    ) {
      try {
        pageId =
          openingFlowSystem
            .getRecommendedPage(
              restaurantId
            );
      } catch {
        pageId =
          "opening-setup";
      }
    }


    pageId =
      gameplayNavigationSystem
        .resolveNavigationTarget(
          pageId
        );


    if (
      pageId ===
      "city"
    ) {
      currentView =
        new CityMapView({
          root,
          restaurantId,

          onNavigate:
            navigate
        });

      currentView.mount();

      cityMapViewportRuntime
        .start(
          root
        );

      return;
    }


    if (
      pageId ===
      "properties"
    ) {
      currentView =
        new CityPropertyView({
          onNavigate:
            navigate
        });

      currentView.mount(
        root,
        {
          restaurantId,
          filters:
            params
        }
      );

      return;
    }


    if (
      pageId ===
      "property_detail"
    ) {
      if (
        !params.propertyId
      ) {
        navigate(
          "city"
        );

        return;
      }

      currentView =
        new PropertyDetailView({
          root,
          restaurantId,

          propertyId:
            params.propertyId,

          onNavigate:
            navigate
        });

      currentView.mount();

      return;
    }


    if (
      pageId ===
      "opening-setup"
    ) {
      currentView =
        new OpeningSetupView({
          onNavigate:
            navigate
        });

      currentView.mount(
        root,
        {
          restaurantId
        }
      );

      return;
    }


    if (
      pageId ===
      "renovation"
    ) {
      currentView =
        new RenovationGameView({
          root,
          restaurantId,

          onSaved:
            result => {
              saveNow();

              if (
                result?.nextPage
              ) {
                navigate(
                  result.nextPage
                );
              }
            },

          onClose:
            result => {
              saveNow();

              navigate(
                result?.nextPage ??
                "opening-setup"
              );
            }
        });

      currentView.mount();

      return;
    }


    if (
      pageId ===
      "renovation_construction"
    ) {
      currentView =
        new RenovationConstructionView({
          root,
          restaurantId,

          onNavigate:
            navigate
        });

      currentView.mount();

      return;
    }


    if (
      pageId ===
      "employee_roster"
    ) {
      currentView =
        new EmployeeManagementView({
          root,
          restaurantId,

          onNavigate:
            navigate
        });

      currentView.mount();

      return;
    }



    if (
      pageId ===
      "dishes"
    ) {
      currentView =
        new DishCenterView({
          root,
          restaurantId,

          onNavigate:
            navigate
        });

      currentView.mount();

      return;
    }


    if (
      pageId ===
      "analytics"
    ) {
      currentView =
        new BusinessAnalyticsView({
          onNavigate:
            navigate
        });

      currentView.mount(
        root,
        {
          restaurantId,
          period:
            params.period ??
            "week",

          onNavigate:
            navigate
        }
      );

      return;
    }



    if (
      formalPageRuntime.has(
        pageId
      )
    ) {
      currentView =
        formalPageRuntime.mount({
          pageId,
          root,
          restaurantId,
          params,

          onNavigate:
            navigate
        });

      return;
    }


    const routeError =
      new Error(
        `Unknown page "${pageId}"`
      );

    feedbackSystem
      .captureRuntimeError(
        routeError,
        "navigation"
      );

    throw routeError;
  } catch (
    error
  ) {
    console.error(
      error
    );

    errorPage(
      error
    );
  }
}


window.restaurantGameBack =
  () => {
    const previous =
      navigationHistory.pop();

    if (!previous) {
      return false;
    }

    handlingBackNavigation =
      true;

    try {
      navigate(
        previous.pageId,
        previous.restaurantId,
        previous.params
      );
    } finally {
      handlingBackNavigation =
        false;
    }

    return true;
  };


root.addEventListener(
  "click",
  event => {
    const element =
      event.target
        ?.closest?.(
          "[data-page-target]"
        );

    if (
      !element ||
      !root.contains(
        element
      ) ||
      element.disabled
    ) {
      return;
    }


    const target =
      element.dataset
        .pageTarget;

    if (!target) {
      return;
    }


    const revisionBefore =
      routeRevision;


    const params = {};


    for (
      const [
        key,
        value
      ]
      of Object.entries(
        element.dataset
      )
    ) {
      if (
        key ===
        "pageTarget"
      ) {
        continue;
      }


      if (
        key.startsWith(
          "page"
        ) &&
        key.length >
          4
      ) {
        const raw =
          key.slice(
            4
          );

        const paramName =
          raw.charAt(0)
            .toLowerCase() +
          raw.slice(1);

        params[
          paramName
        ] =
          value;

        continue;
      }


      if (
        key.endsWith(
          "Id"
        )
      ) {
        params[
          key
        ] =
          value;
      }
    }


    setTimeout(
      () => {
        /*
         * 原页面自己的事件已经成功导航，
         * revision 会变化，因此这里不会重复执行。
         */
        if (
          routeRevision !==
          revisionBefore
        ) {
          return;
        }


        navigate(
          target,
          restaurantId,
          params
        );
      },
      0
    );
  },
  true
);


/* data-page-navigation-listener */

root.addEventListener(
  "click",
  event => {
    const element =
      event.target
        ?.closest?.(
          "[data-page-target]"
        );

    if (
      !element ||
      !root.contains(element) ||
      element.disabled
    ) {
      return;
    }

    const pageId =
      element.dataset
        .pageTarget;

    if (!pageId) {
      return;
    }

    event.preventDefault();

    const params = {};

    for (
      const [key, value]
      of Object.entries(
        element.dataset
      )
    ) {
      if (
        key === "pageTarget" ||
        key === "restaurantId"
      ) {
        continue;
      }

      if (
        key.startsWith("page") &&
        key.length > 4
      ) {
        const raw =
          key.slice(4);

        const paramName =
          raw.charAt(0)
            .toLowerCase() +
          raw.slice(1);

        params[paramName] =
          value;

        continue;
      }

      if (
        key.endsWith("Id")
      ) {
        params[key] =
          value;
      }
    }

    navigate(
      pageId,

      element.dataset
        .restaurantId ??
      restaurantId,

      params
    );
  },
  true
);


root.addEventListener(
  "click",
  event => {
    const button =
      event.target.closest?.(
        '[data-action="pause"], [data-action="speed"]'
      );

    if (!button) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (
      button.dataset.action ===
      "pause"
    ) {
      gameRuntimeLoop.togglePause();
    } else {
      gameRuntimeLoop.setSpeed(
        Number(
          button.dataset.speed
        )
      );
    }

    updateVisibleClock();
  },
  true
);

/* data-runtime-control-listener */


window.addEventListener(
  "error",
  event => {
    feedbackSystem
      .captureRuntimeError(
        event.error ??
        event.message,
        "window-error"
      );

    console.error(
      event.error ??
      event.message
    );
  }
);


window.addEventListener(
  "unhandledrejection",
  event => {
    feedbackSystem
      .captureRuntimeError(
        event.reason,
        "unhandled-rejection"
      );

    console.error(
      event.reason
    );
  }
);


document.addEventListener(
  "visibilitychange",
  () => {
    if (
      document
        .visibilityState ===
      "hidden"
    ) {
      saveNow();
    }
  }
);


const AUTO_SAVE_INTERVAL_MS =
  30000;


setInterval(
  saveNow,
  AUTO_SAVE_INTERVAL_MS
);


firstLaunch();
startRuntimeEnhancements();

navigate(
  "restaurant"
);

startRuntimeSystems();
updateVisibleClock();
