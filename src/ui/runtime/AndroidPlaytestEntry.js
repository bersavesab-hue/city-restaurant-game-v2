import "../theme/theme.css";

import {
  saveSystem
} from "../../core/SaveSystem.js";

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
  employeeSystem
} from "../../systems/EmployeeSystem.js";

import {
  ingredientCatalogSystem
} from "../../systems/IngredientCatalogSystem.js";

import {
  supplierSystem
} from "../../systems/SupplierSystem.js";

import {
  openingFlowSystem
} from "../../systems/OpeningFlowSystem.js";

import {
  CityMapView
} from "../pages/city/CityMapView.js";

import {
  PropertyDetailView
} from "../pages/city/PropertyDetailView.js";

import {
  RestaurantHomeView
} from "../pages/restaurant/RestaurantHomeView.js";

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
  RenovationFloorplanMobileView
} from "../renovation/RenovationFloorplanMobileView.js";

import {
  RenovationConstructionView
} from "../renovation/RenovationConstructionView.js";

import {
  gameChromeSystem
} from "../components/GameChromeSystem.js";

import {
  renderBottomNavigation
} from "../components/GameChromeView.js";


const root =
  document.getElementById(
    "app"
  );

let restaurantId =
  null;

let currentView =
  null;


function seedDistricts() {
  if (
    districtSystem
      .getAll()
      .length >
    0
  ) {
    return;
  }

  districtSystem.load(
    [
      {
        id:
          "east_gate",

        name:
          "东城商圈",

        trafficIndex:
          82,

        rentMultiplier:
          1.15,

        spendingPower:
          76,

        competition:
          63,

        customerMix: {
          office:
            45,

          family:
            30,

          student:
            15,

          tourist:
            10
        },

        mapPosition: {
          x:
            30,

          y:
            34
        }
      },

      {
        id:
          "university",

        name:
          "学府商圈",

        trafficIndex:
          78,

        rentMultiplier:
          0.88,

        spendingPower:
          58,

        competition:
          52,

        customerMix: {
          student:
            62,

          office:
            18,

          family:
            12,

          tourist:
            8
        },

        mapPosition: {
          x:
            68,

          y:
            28
        }
      },

      {
        id:
          "residential",

        name:
          "新城社区",

        trafficIndex:
          64,

        rentMultiplier:
          0.78,

        spendingPower:
          66,

        competition:
          38,

        customerMix: {
          family:
            61,

          office:
            19,

          student:
            12,

          tourist:
            8
        },

        mapPosition: {
          x:
            38,

          y:
            72
        }
      },

      {
        id:
          "commercial",

        name:
          "中央商业街",

        trafficIndex:
          92,

        rentMultiplier:
          1.42,

        spendingPower:
          88,

        competition:
          82,

        customerMix: {
          office:
            35,

          tourist:
            30,

          family:
            20,

          student:
            15
        },

        mapPosition: {
          x:
            74,

          y:
            68
        }
      }
    ],
    {
      overwrite:
        true
    }
  );
}


function seedProperties() {
  if (
    propertySystem
      .list()
      .length >
    0
  ) {
    return;
  }

  const properties = [
    [
      "east_gate",
      "东城临街小铺",
      86,
      78,
      6800
    ],

    [
      "east_gate",
      "东城十字路口铺",
      142,
      128,
      10500
    ],

    [
      "university",
      "学府路餐饮铺",
      96,
      90,
      5200
    ],

    [
      "university",
      "大学城二层商铺",
      180,
      162,
      7600
    ],

    [
      "residential",
      "新城社区入口铺",
      118,
      108,
      4800
    ],

    [
      "residential",
      "社区中心餐饮铺",
      165,
      150,
      6500
    ],

    [
      "commercial",
      "中央商业街旺铺",
      128,
      116,
      13800
    ],

    [
      "commercial",
      "商业街旗舰店",
      260,
      235,
      22800
    ]
  ];

  for (
    const [
      districtId,
      name,
      area,
      usableArea,
      rent
    ]
    of properties
  ) {
    propertySystem.create({
      districtId,
      name,
      area,
      usableArea,

      baseMonthlyRent:
        rent,

      seats:
        Math.max(
          10,
          Math.floor(
            usableArea /
            4
          )
        ),

      depositMonths:
        2,

      frontageMeters:
        Math.max(
          4,
          Math.round(
            area /
            20
          )
        ),

      ceilingHeight:
        3.6,

      parkingSpaces:
        districtId ===
        "residential"
          ? 8
          : 3,

      foodServiceAllowed:
        true,

      exhaustAllowed:
        true,

      floors: [
        {
          id:
            "floor_1",

          label:
            "1F",

          area,
          usableArea,

          width:
            16,

          height:
            10,

          entrances: [
            {
              x:
                1,

              y:
                9
            }
          ],

          windows: [
            {
              x:
                4,

              y:
                0
            },

            {
              x:
                9,

              y:
                0
            }
          ],

          columns: [
            {
              x:
                7,

              y:
                5,

              width:
                1,

              height:
                1
            }
          ],

          utilityPoints: [
            {
              type:
                "water",

              x:
                14,

              y:
                8
            },

            {
              type:
                "power",

              x:
                13,

              y:
                8
            },

            {
              type:
                "exhaust",

              x:
                15,

              y:
                4
            }
          ]
        }
      ]
    });
  }
}


function seedIngredients() {
  if (
    ingredientCatalogSystem
      .count() >
    0
  ) {
    return;
  }

  ingredientCatalogSystem.load(
    [
      {
        id:
          "pork",

        name:
          "猪肉",

        category:
          "meat",

        unit:
          "g",

        baseQuality:
          3,

        storageType:
          "chilled",

        basePurchasePrice:
          1,

        shelfLifeDays:
          4,

        edibleRate:
          0.9,

        baseWasteRate:
          0.08
      },

      {
        id:
          "chicken",

        name:
          "鸡肉",

        category:
          "poultry",

        unit:
          "g",

        baseQuality:
          3,

        storageType:
          "chilled",

        basePurchasePrice:
          1,

        shelfLifeDays:
          4,

        edibleRate:
          0.88,

        baseWasteRate:
          0.08
      },

      {
        id:
          "egg",

        name:
          "鸡蛋",

        category:
          "egg",

        unit:
          "piece",

        baseQuality:
          3,

        storageType:
          "chilled",

        basePurchasePrice:
          2,

        shelfLifeDays:
          12,

        edibleRate:
          0.95,

        baseWasteRate:
          0.02
      },

      {
        id:
          "tomato",

        name:
          "番茄",

        category:
          "vegetable",

        unit:
          "g",

        baseQuality:
          3,

        storageType:
          "chilled",

        basePurchasePrice:
          1,

        shelfLifeDays:
          6,

        edibleRate:
          0.92,

        baseWasteRate:
          0.06
      },

      {
        id:
          "pepper",

        name:
          "青椒",

        category:
          "vegetable",

        unit:
          "g",

        baseQuality:
          3,

        storageType:
          "chilled",

        basePurchasePrice:
          1,

        shelfLifeDays:
          6,

        edibleRate:
          0.9,

        baseWasteRate:
          0.07
      },

      {
        id:
          "rice",

        name:
          "大米",

        category:
          "grain",

        unit:
          "g",

        baseQuality:
          3,

        storageType:
          "dry",

        basePurchasePrice:
          1,

        shelfLifeDays:
          180,

        edibleRate:
          1,

        baseWasteRate:
          0.01
      },

      {
        id:
          "soy_sauce",

        name:
          "酱油",

        category:
          "seasoning",

        unit:
          "ml",

        baseQuality:
          3,

        storageType:
          "room",

        basePurchasePrice:
          1,

        shelfLifeDays:
          180,

        edibleRate:
          1,

        baseWasteRate:
          0
      },

      {
        id:
          "oil",

        name:
          "食用油",

        category:
          "oil",

        unit:
          "ml",

        baseQuality:
          3,

        storageType:
          "room",

        basePurchasePrice:
          1,

        shelfLifeDays:
          180,

        edibleRate:
          1,

        baseWasteRate:
          0
      }
    ],
    {
      overwrite:
        true
    }
  );
}


function seedSupplier() {
  if (
    supplierSystem
      .list()
      .length >
    0
  ) {
    return;
  }

  const supplier =
    supplierSystem.create({
      name:
        "新城农副产品配送",

      relationship:
        55,

      reliability:
        90
    });

  for (
    const ingredient
    of ingredientCatalogSystem
      .getAll()
  ) {
    supplierSystem.addOffer(
      supplier.id,
      ingredient.id,
      {
        priceMultiplier:
          1,

        priceVolatility:
          0.08,

        qualityMin:
          2,

        qualityMax:
          4,

        deliveryMinutes:
          120,

        capacityPerDay:
          5000,

        minimumOrder:
          ingredient.unit ===
          "piece"
            ? 5
            : 50
      }
    );
  }
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

  if (
    employeeSystem
      .listByRestaurant(
        restaurant.id
      )
      .length ===
    0
  ) {
    employeeSystem.hire({
      restaurantId:
        restaurant.id,

      name:
        "周师傅",

      roleId:
        "chef"
    });

    employeeSystem.hire({
      restaurantId:
        restaurant.id,

      name:
        "林小雨",

      roleId:
        "server"
    });
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

  seedDistricts();
  seedProperties();
  seedIngredients();
  seedSupplier();

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
        V2测试包运行错误
      </h2>

      <pre
        style="
          white-space:pre-wrap;
          padding:12px;
          border-radius:8px;
          background:#fff;
        "
      >${String(
        error?.stack ??
        error
      )}</pre>

      <button
        id="return-city"
        style="
          min-height:42px;
          margin-right:8px;
        "
      >
        返回城市
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
          "city"
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


function placeholderPage(
  title,
  description
) {
  const navigation =
    gameChromeSystem
      .getNavigation({
        restaurantId,
        activePageId:
          "more"
      });

  root.innerHTML = `
    <main
      class="rg-screen"
      style="
        padding-top:20px;
      "
    >
      <section
        style="
          margin:8px;
          padding:18px;
          border:1px solid #62c9f6;
          border-radius:9px;
          background:white;
        "
      >
        <h2
          style="
            margin:0;
            color:#115486;
          "
        >
          ${title}
        </h2>

        <p
          style="
            color:#71869a;
          "
        >
          ${description}
        </p>
      </section>

      ${renderBottomNavigation(
        navigation
      )}
    </main>
  `;

  root
    .querySelectorAll(
      "[data-page-target]"
    )
    .forEach(
      button => {
        button.addEventListener(
          "click",
          () =>
            navigate(
              button.dataset
                .pageTarget
            )
        );
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

  saveNow();

  destroyCurrent();

  try {
    if (
      pageId ===
      "properties"
    ) {
      pageId =
        "city";
    }

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
        new RenovationFloorplanMobileView({
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
      "employees" ||
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
      "operations" ||
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
      "restaurant_home"
    ) {
      currentView =
        new RestaurantHomeView({
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
      "more"
    ) {
      placeholderPage(
        "更多功能",
        "当前APK主要用于测试选址、房源、装修、开店、员工、菜品和统一UI。"
      );

      return;
    }


    if (
      [
        "supply",
        "analytics",
        "finance",
        "lease",
        "employee_training",
        "employee_promotion",
        "employee_detail",
        "employee_recruitment"
      ].includes(
        pageId
      )
    ) {
      placeholderPage(
        "测试入口",
        `页面 ${pageId} 的正式运行入口还在整合，本次先测试已经完成的核心页面。`
      );

      return;
    }


    placeholderPage(
      "页面尚未接入",
      `当前测试APK暂未接入：${pageId}`
    );
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


window.addEventListener(
  "error",
  event => {
    console.error(
      event.error ??
      event.message
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


setInterval(
  saveNow,
  5000
);


firstLaunch();

navigate(
  "opening-setup"
);
