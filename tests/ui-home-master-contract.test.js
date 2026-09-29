import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  PRIMARY_NAV,
  renderHomePage
} from "../client/mobile/HomePage.js";

const mobileApp =
  fs.readFileSync(
    new URL(
      "../client/mobile/MobileApp.js",
      import.meta.url
    ),
    "utf8"
  );

const homePage =
  fs.readFileSync(
    new URL(
      "../client/mobile/HomePage.js",
      import.meta.url
    ),
    "utf8"
  );

const css =
  fs.readFileSync(
    new URL(
      "../client/mobile/app.css",
      import.meta.url
    ),
    "utf8"
  );

const toolkit =
  fs.readFileSync(
    new URL(
      "../client/mobile/DevToolkit.js",
      import.meta.url
    ),
    "utf8"
  );

function fixture() {
  return {
    restaurant: {
      name:
        "测试餐厅",
      status:
        "open",
      reviewScore:
        4.2,
      totalReviews:
        16,
      customerSatisfaction:
        73
    },

    finance: {
      balance:
        123456
    },

    progress: {
      level:
        3,
      title:
        "商圈新秀",
      nextTitle:
        "成熟门店",
      remainingExperience:
        1800,
      progress:
        .42,
      maxLevel:
        false
    },

    property: {
      name:
        "测试铺位"
    },

    district: {
      name:
        "测试商圈",
      trafficIndex:
        81,
      spendingPower:
        76,
      competition:
        55,
      customerMix: {
        office_worker:
          60,
        resident:
          40
      }
    },

    employees: [
      {
        name:
          "张师傅",
        roleId:
          "chef",
        level:
          2,
        status:
          "active",
        mood:
          70
      }
    ],

    inventory: [
      {
        ingredientId:
          "rice",
        name:
          "大米",
        batches:
          1,
        usableQuantity:
          12
      }
    ],

    menu: [
      {
        dishId:
          "rice_bowl",
        dishName:
          "招牌盖饭",
        price:
          28,
        soldCount:
          12
      }
    ],

    research: {
      total:
        1,
      bestDish: {
        name:
          "招牌盖饭"
      }
    },

    dishes: {
      tab:
        "menu",
      activeMenuCount:
        1,
      menuLimit:
        4,
      menuItems: [
        {
          id:
            "menu_1",
          dishId:
            "rice_bowl",
          price:
            28,
          active:
            true
        }
      ],
      dishes: [
        {
          id:
            "rice_bowl",
          name:
            "招牌盖饭",
          category:
            "rice",
          basePrice:
            28,
          custom:
            false,
          onMenu:
            true,
          active:
            true,
          currentPrice:
            28,
          soldCount:
            12,
          totalRevenue:
            336,
          menuItem: {
            id:
              "menu_1",
            price:
              28,
            active:
              true
          },
          progress: {
            dishRankName:
              "家常",
            masteryLevel:
              1,
            recipeQualityScore:
              62
          },
          recipe: {
            id:
              "recipe_1",
            method:
              "stir_fry",
            cookingMinutes:
              12,
            difficulty:
              30,
            ingredients: [
              {
                ingredientId:
                  "rice",
                quantity:
                  1
              }
            ]
          },
          ingredients: [
            {
              ingredientId:
                "rice",
              name:
                "大米",
              quantity:
                1,
              unit:
                "kg",
              stock:
                12
            }
          ]
        }
      ],
      selectedDish: {
        id:
          "rice_bowl",
        name:
          "招牌盖饭",
        category:
          "rice",
        basePrice:
          28,
        custom:
          false,
        onMenu:
          true,
        active:
          true,
        currentPrice:
          28,
        soldCount:
          12,
        totalRevenue:
          336,
        menuItem: {
          id:
            "menu_1",
          price:
            28,
          active:
            true
        },
        progress: {
          dishRankName:
            "家常",
          masteryLevel:
            1,
          recipeQualityScore:
            62
        },
        recipe: {
          id:
            "recipe_1",
          method:
            "stir_fry",
          cookingMinutes:
            12,
          difficulty:
            30,
          ingredients: [
            {
              ingredientId:
                "rice",
              quantity:
                1
            }
          ]
        },
        ingredients: [
          {
            ingredientId:
              "rice",
            name:
              "大米",
            quantity:
              1,
            unit:
              "kg",
            stock:
              12
          }
        ]
      },
      research: {
        methods: [
          {
            id:
              "stir_fry",
            name:
              "炒制",
            icon:
              "炒",
            baseMinutes:
              12,
            defaultCategory:
              "stir_fry"
          }
        ],
        ingredients: [
          {
            id:
              "rice",
            name:
              "大米",
            category:
              "grain",
            unit:
              "kg"
          },
          {
            id:
              "pork",
            name:
              "猪肉",
            category:
              "meat",
            unit:
              "kg"
          }
        ],
        methodId:
          "stir_fry",
        selectedMethod: {
          id:
            "stir_fry",
          name:
            "炒制",
          icon:
            "炒",
          baseMinutes:
            12,
          defaultCategory:
            "stir_fry"
        },
        ingredientIds: [
          "rice",
          "pork"
        ],
        selectedIngredients: [
          {
            id:
              "rice",
            name:
              "大米",
            category:
              "grain",
            unit:
              "kg"
          },
          {
            id:
              "pork",
            name:
              "猪肉",
            category:
              "meat",
            unit:
              "kg"
          }
        ],
        generatedName:
          "炒制大米猪肉",
        lastResult:
          null
      }
    },

    schedule: {
      openHour: 9,
      closeHour: 22,
      enabled: true
    },

    staff: {
      tab: "team",
      employeeLimit: 6,
      monthlyPayroll: 15000,
      totalArrears: 0,
      nextPayrollDay: 30,
      payrollHistory: [],
      schedule: [],
      selectedSchedule: [],
      recommendation: {
        roles: [
          {
            roleId:
              "chef",
            current:
              1,
            recommended:
              1,
            reason:
              "当前厨师配置合理"
          }
        ]
      },
      employees: [
        {
          id:
            "employee_1",
          name:
            "张师傅",
          roleId:
            "chef",
          level:
            2,
          status:
            "active",
          salary:
            6500,
          mood:
            70,
          loyalty:
            62,
          fatigue:
            18,
          potentialName:
            "良好",
          trainingCount:
            1,
          skills: {
            cooking:
              48,
            speed:
              35,
            quality:
              42
          },
          rank: {
            id:
              "apprentice",
            name:
              "学徒"
          },
          dynamics: {
            satisfaction: {
              score:
                72,
              label:
                "满意"
            },
            training: {
              label:
                "1/3次培训"
            }
          },
          turnover: {
            score:
              18,
            level:
              "low"
          },
          salarySatisfaction: {
            score:
              70,
            recommended:
              6800
          },
          promotion: {
            eligible:
              false,
            maxRank:
              false,
            next: {
              name:
                "熟手"
            }
          },
          trainingPrograms: [
            {
              id:
                "basic_training",
              name:
                "基础岗位训练",
              cost:
                600,
              experience:
                120,
              fatigueGain:
                6,
              unlocked:
                true,
              unlockRank: {
                name:
                  "学徒"
              }
            }
          ]
        }
      ],
      selectedEmployee: {
        id:
          "employee_1",
        name:
          "张师傅",
        roleId:
          "chef",
        level:
          2,
        status:
          "active",
        salary:
          6500,
        mood:
          70,
        loyalty:
          62,
        fatigue:
          18,
        potentialName:
          "良好",
        trainingCount:
          1,
        skills: {
          cooking:
            48,
          speed:
            35,
          quality:
            42
        },
        rank: {
          id:
            "apprentice",
          name:
            "学徒"
        },
        dynamics: {
          satisfaction: {
            score:
              72,
            label:
              "满意"
          },
          training: {
            label:
              "1/3次培训"
          }
        },
        turnover: {
          score:
            18,
          level:
            "low"
        },
        salarySatisfaction: {
          score:
            70,
          recommended:
            6800
        },
        promotion: {
          eligible:
            false,
          maxRank:
            false,
          next: {
            name:
              "熟手"
          }
        },
        trainingPrograms: [
          {
            id:
              "basic_training",
            name:
              "基础岗位训练",
            cost:
              600,
            experience:
              120,
            fatigueGain:
              6,
            unlocked:
              true,
            unlockRank: {
              name:
                "学徒"
            }
          }
        ]
      },
      candidates: [
        {
          id:
            "candidate_1",
          name:
            "李师傅",
          roleId:
            "chef",
          roleName:
            "厨师",
          age:
            28,
          experienceMonths:
            48,
          potentialName:
            "优秀",
          profileName:
            "稳健型",
          expectedSalary:
            7200,
          stability:
            78,
          learning:
            72,
          stressTolerance:
            70,
          teamwork:
            76,
          initiative:
            68,
          traits: [
            "稳定"
          ]
        }
      ],
      selectedCandidate: {
        id:
          "candidate_1",
        name:
          "李师傅",
        roleId:
          "chef",
        roleName:
          "厨师",
        age:
          28,
        experienceMonths:
          48,
        potentialName:
          "优秀",
        profileName:
          "稳健型",
        expectedSalary:
          7200,
        stability:
          78,
        learning:
          72,
        stressTolerance:
          70,
        teamwork:
          76,
        initiative:
          68,
        traits: [
          "稳定"
        ]
      }
    },

    procurement: {
      ingredientName:
        "大米",
      currentQuantity:
        12,
      quantity:
        5
    },

    pendingDeliveries:
      1,

    today: {
      revenue:
        860,
      orders:
        31
    },

    time: {
      day:
        18,
      clock:
        "12:25",
      totalMinutes:
        1800
    },

    business: {
      tab:
        "procurement",
      catalog: [
        {
          id:
            "rice",
          name:
            "大米",
          unit:
            "kg",
          currentQuantity:
            12,
          pendingQuantity:
            0,
          requiredByMenu:
            true
        }
      ],
      selectedIngredient: {
        id:
          "rice",
        name:
          "大米",
        unit:
          "kg",
        currentQuantity:
          12,
        pendingQuantity:
          0
      },
      inventoryCatalog: [
        {
          id:
            "rice",
          name:
            "大米",
          unit:
            "kg",
          currentQuantity:
            12,
          totalQuantity:
            12,
          spoiledQuantity:
            0,
          batches:
            1,
          pendingQuantity:
            0
        }
      ],
      supplierOptions: [
        {
          id:
            "supplier_a",
          name:
            "测试供应商",
          relationship:
            60,
          reliability:
            90,
          minimumOrder:
            5,
          remainingCapacity:
            100,
          deliveryMinutes:
            120,
          qualityMin:
            2,
          qualityMax:
            4,
          maxCreditDays:
            7
        }
      ],
      selectedSupplier: {
        id:
          "supplier_a",
        name:
          "测试供应商",
        relationship:
          60,
        reliability:
          90,
        minimumOrder:
          5,
        remainingCapacity:
          100,
        deliveryMinutes:
          120,
        qualityMin:
          2,
        qualityMax:
          4,
        maxCreditDays:
          7
      },
      quantity:
        5,
      paymentMode:
        "cash",
      quote:
        null,
      quoteLocked:
        false,
      canUseCredit:
        true,
      creditDays:
        7,
      orders: [],
      pendingOrders: [],
      inventoryIngredient: {
        id:
          "rice",
        name:
          "大米",
        unit:
          "kg"
      },
      batches: [],
      spoiledBatches: [],
      spoiledQuantity:
        0,
      marketing: {
        categories: [
          "local_acquisition",
          "discount_conversion"
        ],
        category:
          "all",
        activeLimit:
          2,
        active: [],
        history: [],
        modifiers: {
          demandMultiplier:
            1,
          priceMultiplier:
            1,
          marketAppealMultiplier:
            1,
          repeatIntentMultiplier:
            1,
          reviewPropensityMultiplier:
            1,
          serviceCapacityMultiplier:
            1,
          qualityBonus:
            0
        },
        noonExpectedVisitors:
          12.4,
        topReviewIssue:
          null,
        topReviewPositive:
          null,
        actions: [
          {
            id:
              "local_ads",
            name:
              "本地广告",
            category:
              "local_acquisition",
            description:
              "在门店周边投放基础曝光。",
            cost:
              2000,
            durationDays:
              5,
            cooldownDays:
              5,
            minRestaurantLevel:
              1,
            targetSegments: [
              "resident"
            ],
            modifiers: {
              demandMultiplier:
                1.12,
              priceMultiplier:
                1,
              marketAppealMultiplier:
                1.08,
              repeatIntentMultiplier:
                1,
              reviewPropensityMultiplier:
                1,
              serviceCapacityMultiplier:
                1,
              qualityBonus:
                0
            },
            availability: {
              canStart:
                true,
              reasons: [],
              availableDay:
                18,
              currentDay:
                18
            },
            active:
              null,
            last:
              null,
            remainingDays:
              0,
            cooldownRemaining:
              0
          }
        ],
        selectedAction: {
          id:
            "local_ads",
          name:
            "本地广告",
          category:
            "local_acquisition",
          description:
            "在门店周边投放基础曝光。",
          cost:
            2000,
          durationDays:
            5,
          cooldownDays:
            5,
          minRestaurantLevel:
            1,
          targetSegments: [
            "resident"
          ],
          modifiers: {
            demandMultiplier:
              1.12,
            priceMultiplier:
              1,
            marketAppealMultiplier:
              1.08,
            repeatIntentMultiplier:
              1,
            reviewPropensityMultiplier:
              1,
            serviceCapacityMultiplier:
              1,
            qualityBonus:
              0
          },
          availability: {
            canStart:
              true,
            reasons: [],
            availableDay:
              18,
            currentDay:
              18
          },
          active:
            null,
          last:
            null,
          remainingDays:
            0,
          cooldownRemaining:
            0
        }
      }
    },

    runtime: {
      paused:
        false,
      speed:
        2
    },

    lastMessage:
      "真实数据已连接"
  };
}


test(
  "formal home keeps the background master and real-data shell",
  () => {
    const html =
      renderHomePage(
        fixture(),
        "store"
      );

    assert.match(
      html,
      /background-master-v1/
    );

    assert.match(
      html,
      /formal-primary-v1/
    );

    assert.match(
      html,
      /data-coordinate-space="logical"/
    );

    for (
      const value
      of [
        "测试餐厅",
        "¥123,456",
        "第18天",
        "12:25",
        "★ 4.2",
        "¥860",
        "31",
        "测试商圈"
      ]
    ) {
      assert.ok(
        html.includes(
          value
        ),
        value
      );
    }

    assert.doesNotMatch(
      html,
      /86,240|第28天|12:15|4\.7/
    );

    assert.doesNotMatch(
      html,
      /测试快进 1 小时|data-game-action="advance-hour"/
    );
  }
);


test(
  "formal home exposes exactly five primary routes",
  () => {
    assert.deepEqual(
      PRIMARY_NAV.map(
        item =>
          item.id
      ),
      [
        "store",
        "business",
        "research",
        "staff",
        "more"
      ]
    );

    assert.deepEqual(
      PRIMARY_NAV.map(
        item =>
          item.label
      ),
      [
        "门店",
        "经营",
        "研发",
        "员工",
        "更多"
      ]
    );

    for (
      const page
      of PRIMARY_NAV
    ) {
      const html =
        renderHomePage(
          fixture(),
          page.id
        );

      assert.match(
        html,
        new RegExp(
          `data-primary-page="${page.id}"`
        )
      );

      assert.match(
        html,
        new RegExp(
          `data-nav="${page.id}"`
        )
      );
    }
  }
);


test(
  "formal route skeleton binds real system actions without fake success values",
  () => {
    const business =
      renderHomePage(
        fixture(),
        "business"
      );

    const more =
      renderHomePage(
        fixture(),
        "more"
      );

    for (
      const action
      of [
        "business-tab",
        "procurement-ingredient",
        "procurement-supplier",
        "procurement-quantity",
        "procurement-payment",
        "procurement-quote"
      ]
    ) {
      assert.match(
        business,
        new RegExp(
          `data-game-action="${action}"`
        )
      );
    }

    const quotedFixture =
      fixture();

    quotedFixture.business.quote = {
      unitPrice:
        8.5,
      totalPrice:
        42,
      quality:
        3,
      unit:
        "kg",
      deliveryMinutes:
        120
    };

    quotedFixture.business
      .quoteLocked =
      true;

    const quotedBusiness =
      renderHomePage(
        quotedFixture,
        "business"
      );

    assert.match(
      quotedBusiness,
      /data-game-action="procurement-purchase"/
    );

    assert.match(
      more,
      /data-game-action="toggle-time"/
    );

    assert.match(
      more,
      /data-game-action="speed"/
    );

    assert.match(
      more,
      /data-game-action="toggle-restaurant"/
    );

    assert.match(
      more,
      /data-game-action="save"/
    );

    assert.doesNotMatch(
      homePage,
      /购买成功|保存成功|营业成功/
    );
  }
);


test(
  "business route renders procurement inventory and order subpages without whole-page scrolling",
  () => {
    const inventoryFixture =
      fixture();

    inventoryFixture
      .business
      .tab =
      "inventory";

    inventoryFixture
      .business
      .batches = [
        {
          id:
            "batch_1",
          quantity:
            4,
          unit:
            "kg",
          quality:
            3,
          freshness:
            0,
          freshnessState:
            "spoiled",
          spoiled:
            true,
          expiresAt:
            1500,
          unitCost:
            6
        }
      ];

    inventoryFixture
      .business
      .spoiledBatches =
      inventoryFixture
        .business
        .batches;

    const inventoryHtml =
      renderHomePage(
        inventoryFixture,
        "business"
      );

    assert.match(
      inventoryHtml,
      /data-business-panel="inventory"/
    );

    assert.match(
      inventoryHtml,
      /data-game-action="inventory-discard-batch"/
    );

    const ordersFixture =
      fixture();

    ordersFixture
      .business
      .tab =
      "orders";

    ordersFixture
      .business
      .orders = [
        {
          id:
            "order_1",
          ingredientName:
            "大米",
          supplierName:
            "测试供应商",
          quantity:
            5,
          totalPrice:
            42,
          status:
            "pending",
          paymentMode:
            "cash",
          creditDays:
            0,
          remainingMinutes:
            60
        }
      ];

    ordersFixture
      .business
      .pendingOrders =
      ordersFixture
        .business
        .orders;

    const ordersHtml =
      renderHomePage(
        ordersFixture,
        "business"
      );

    assert.match(
      ordersHtml,
      /data-business-panel="orders"/
    );

    assert.match(
      ordersHtml,
      /data-game-action="procurement-cancel"/
    );

    assert.match(
      css,
      /\.business-panel-host[\s\S]*?overflow:\s*hidden/
    );
  }
);


test(
  "dish route renders menu library and research actions from one real-data model",
  () => {
    const menuHtml =
      renderHomePage(
        fixture(),
        "research"
      );

    for (
      const action
      of [
        "dish-tab",
        "dish-select",
        "dish-price",
        "dish-toggle-active"
      ]
    ) {
      assert.match(
        menuHtml,
        new RegExp(
          `data-game-action="${action}"`
        )
      );
    }

    const researchFixture =
      fixture();

    researchFixture
      .dishes
      .tab =
      "research";

    const researchHtml =
      renderHomePage(
        researchFixture,
        "research"
      );

    for (
      const action
      of [
        "dish-research-method",
        "dish-research-ingredient",
        "dish-research"
      ]
    ) {
      assert.match(
        researchHtml,
        new RegExp(
          `data-game-action="${action}"`
        )
      );
    }

    assert.match(
      researchHtml,
      /炒制大米猪肉/
    );

    assert.match(
      css,
      /\.dish-panel-host[\s\S]*?overflow:\s*hidden/
    );
  }
);


test(
  "staff route exposes team recruitment schedule and payroll actions",
  () => {
    const team =
      renderHomePage(
        fixture(),
        "staff"
      );

    for (
      const action
      of [
        "staff-tab",
        "staff-select",
        "staff-train",
        "staff-promote"
      ]
    ) {
      assert.match(
        team,
        new RegExp(
          `data-game-action="${action}"`
        )
      );
    }

    const recruitFixture =
      fixture();

    recruitFixture
      .staff
      .tab =
      "recruit";

    const recruit =
      renderHomePage(
        recruitFixture,
        "staff"
      );

    for (
      const action
      of [
        "staff-candidate-select",
        "staff-refresh-candidates",
        "staff-hire-candidate"
      ]
    ) {
      assert.match(
        recruit,
        new RegExp(
          `data-game-action="${action}"`
        )
      );
    }

    const scheduleFixture =
      fixture();

    scheduleFixture
      .staff
      .tab =
      "schedule";

    scheduleFixture
      .staff
      .selectedSchedule = [
        {
          weekday:
            1,
          startClock:
            "09:00",
          endClock:
            "17:00"
        }
      ];

    const schedule =
      renderHomePage(
        scheduleFixture,
        "staff"
      );

    assert.match(
      schedule,
      /data-game-action="staff-shift-toggle"/
    );

    assert.match(
      schedule,
      /data-game-action="staff-schedule-all"/
    );

    assert.match(
      schedule,
      /09:00-17:00/
    );

    const payrollFixture =
      fixture();

    payrollFixture
      .staff
      .tab =
      "payroll";

    const payroll =
      renderHomePage(
        payrollFixture,
        "staff"
      );

    assert.match(
      payroll,
      /data-game-action="staff-salary"/
    );

    assert.match(
      payroll,
      /data-game-action="staff-fire"/
    );

    assert.match(
      css,
      /\.staff-panel-host[\s\S]*?overflow:\s*hidden/
    );
  }
);


test(
  "marketing business subpage renders real activity selection effects and start action",
  () => {
    const vm =
      fixture();

    vm.business.tab =
      "marketing";

    const html =
      renderHomePage(
        vm,
        "business"
      );

    for (
      const action
      of [
        "marketing-category",
        "marketing-select",
        "marketing-start"
      ]
    ) {
      assert.match(
        html,
        new RegExp(
          `data-game-action="${action}"`
        )
      );
    }

    assert.match(
      html,
      /本地广告/
    );

    assert.match(
      html,
      /客流 \+12%/
    );

    assert.match(
      html,
      /午间预估/
    );

    assert.match(
      html,
      /data-business-panel="marketing"/
    );

    assert.match(
      css,
      /\.marketing-panel[\s\S]*?grid-template-columns/
    );
  }
);


test(
  "home activity and storage shortcuts target the correct business subpages",
  () => {
    const html =
      renderHomePage(
        fixture(),
        "store"
      );

    assert.match(
      html,
      /data-route-action="business-tab"[\s\S]*?data-route-value="marketing"[\s\S]*?data-asset-slot="home\.quick\.activity"/
    );

    assert.match(
      html,
      /data-route-action="business-tab"[\s\S]*?data-route-value="inventory"[\s\S]*?data-asset-slot="home\.quick\.storage"/
    );

    assert.match(
      mobileApp,
      /routeAction[\s\S]*?performAction/
    );
  }
);


test(
  "renovation more subpage exposes fixed template facility and inspection actions",
  () => {
    const vm =
      fixture();

    vm.more = {
      tab:
        "renovation"
    };

    const template = {
      id:
        "balanced",
      name:
        "均衡小店",
      minLevel:
        1,
      minArea:
        36,
      idealArea:
        68,
      items: [
        "kitchen_station",
        "cashier_counter",
        "table_4"
      ],
      furnitureCost:
        12000,
      constructionCost:
        48000,
      estimatedTotalCost:
        60000,
      availableBalance:
        123456,
      fitScore:
        92,
      executable:
        true,
      reasons: []
    };

    vm.renovation = {
      initialized:
        true,
      summary: {
        active:
          false,
        placements:
          0,
        totalSpent:
          0,
        modifiers: {
          seats:
            0,
          tables:
            0,
          kitchenStations:
            0
        }
      },
      analysis: {
        grade:
          "B",
        scores: {
          comfort:
            80,
          flow:
            84
        }
      },
      construction:
        null,
      currentConstruction:
        null,
      progress:
        null,
      templates: [
        template
      ],
      selectedTemplate:
        template,
      categories: [
        "dining",
        "kitchen"
      ],
      facilityCategory:
        "all",
      facilities: [],
      selectedFacility:
        null,
      serviceCapacity: {
        kitchenGuests:
          20,
        serviceGuests:
          18
      },
      canEdit:
        true,
      layoutEmpty:
        true
    };

    const initial =
      renderHomePage(
        vm,
        "more"
      );

    assert.match(
      initial,
      /data-game-action="more-tab"/
    );

    assert.match(
      initial,
      /data-game-action="renovation-template-select"/
    );

    assert.match(
      initial,
      /data-game-action="renovation-start-template"/
    );

    assert.match(
      initial,
      /均衡小店/
    );

    const facility = {
      id:
        "decor_plant",
      name:
        "基础绿植",
      category:
        "decor",
      width:
        1,
      height:
        1,
      cost:
        500,
      unlockLevel:
        1,
      unlocked:
        true,
      affordable:
        true,
      installedCount:
        2,
      appeal:
        .006,
      comfort:
        .008
    };

    vm.renovation.layoutEmpty =
      false;

    vm.renovation.summary = {
      active:
        true,
      placements:
        8,
      totalSpent:
        60500,
      modifiers: {
        seats:
          10,
        tables:
          3,
        kitchenStations:
          1
      }
    };

    vm.renovation.categories = [
      "decor"
    ];

    vm.renovation.facilities = [
      facility
    ];

    vm.renovation.selectedFacility =
      facility;

    const upgrade =
      renderHomePage(
        vm,
        "more"
      );

    assert.match(
      upgrade,
      /data-game-action="renovation-facility-category"/
    );

    assert.match(
      upgrade,
      /data-game-action="renovation-facility-select"/
    );

    assert.match(
      upgrade,
      /data-game-action="renovation-install-facility"/
    );

    assert.match(
      upgrade,
      /系统自动布置/
    );

    vm.renovation.currentConstruction = {
      status:
        "ready_for_inspection",
      startDay:
        2,
      endDay:
        5,
      durationDays:
        3,
      projectCost:
        60500
    };

    vm.renovation.construction =
      vm.renovation
        .currentConstruction;

    vm.renovation.progress = {
      progress:
        100,
      remainingDays:
        0,
      phaseLabel:
        "等待完工验收"
    };

    const ready =
      renderHomePage(
        vm,
        "more"
      );

    assert.match(
      ready,
      /data-game-action="renovation-inspect"/
    );

    assert.match(
      ready,
      /验收并启用装修/
    );

    assert.match(
      css,
      /\.renovation-panel[\s\S]*?grid-template-columns/
    );
  }
);


test(
  "mobile runtime owns route state and keeps one reusable render path",
  () => {
    assert.match(
      mobileApp,
      /let activePage\s*=\s*"store"/
    );

    assert.match(
      mobileApp,
      /PRIMARY_NAV\.map/
    );

    assert.match(
      mobileApp,
      /\[data-nav\]/
    );

    assert.match(
      mobileApp,
      /renderHomePage\(\s*viewModel,\s*activePage\s*\)/
    );

    assert.match(
      mobileApp,
      /getActivePage:\s*\(\) => activePage/
    );
  }
);


test(
  "formal home stays non-scrolling while inner lists may scroll",
  () => {
    for (
      const marker
      of [
        "--screen-scale",
        "--logical-width",
        "--logical-height",
        "--safe-top",
        "--safe-bottom",
        ".home-top-chrome",
        ".home-primary-content",
        ".home-bottom-chrome",
        ".formal-scroll-list"
      ]
    ) {
      assert.ok(
        css.includes(
          marker
        ),
        marker
      );
    }

    const primaryBlocks =
      [
        ...css.matchAll(
          /\.home-primary-content\s*\{([\s\S]*?)\}/g
        )
      ].map(
        match =>
          match[1]
      );

    const positionedPrimary =
      primaryBlocks.find(
        block =>
          /top:/.test(
            block
          )
      ) ??
      "";

    assert.ok(
      positionedPrimary
    );

    assert.match(
      positionedPrimary,
      /overflow:\s*hidden/
    );

    assert.doesNotMatch(
      positionedPrimary,
      /overflow-y:\s*(auto|scroll)/
    );

    assert.match(
      css,
      /\.formal-scroll-list\s*\{[\s\S]*?overflow-y:\s*auto/
    );
  }
);


test(
  "editor keeps responsive logical coordinate support",
  () => {
    assert.match(
      toolkit,
      /city-restaurant-ui-dev-overrides\.v6/
    );

    assert.match(
      toolkit,
      /city-restaurant-ui-dev-project\.v6/
    );

    assert.match(
      toolkit,
      /component-layout-v7-typed-responsive-space/
    );

    assert.match(
      toolkit,
      /function uiScale\(\)/
    );

    assert.match(
      toolkit,
      /function logicalRect\(node\)/
    );
  }
);
