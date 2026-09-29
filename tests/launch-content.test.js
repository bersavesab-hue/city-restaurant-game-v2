import test from "node:test";
import assert from "node:assert/strict";

import {
  LAUNCH_STAGES,
  LAUNCH_EVENT_IDS,
  LAUNCH_CONTENT_TOTALS
} from "../src/data/launchContent.v1.js";

import {
  DISHES_V1
} from "../src/data/dishes.v1.js";

import {
  RECIPES_V1
} from "../src/data/recipes.v1.js";

import {
  INGREDIENTS_V1
} from "../src/data/ingredients.v1.js";

import {
  SUPPLIERS_V1
} from "../src/data/suppliers.v1.js";

import {
  MARKETING_ACTIONS_V1
} from "../src/data/marketingActions.v1.js";

import {
  RANDOM_EVENTS_V1
} from "../src/data/randomEvents.v1.js";

import {
  RENOVATION_TEMPLATES_V1
} from "../src/data/renovationTemplates.v1.js";

import {
  EMPLOYEE_ROLES
} from "../src/data/employeeRoles.js";

import {
  launchProgressionSystem
} from "../src/systems/LaunchProgressionSystem.js";

import {
  app
} from "../src/main.js";


function ids(
  rows
) {
  return new Set(
    rows.map(
      item =>
        item.id
    )
  );
}


test(
  "launch profile freezes three clear single-store growth stages",
  () => {
    assert.deepEqual(
      LAUNCH_STAGES.map(
        item => [
          item.minLevel,
          item.maxLevel
        ]
      ),
      [
        [1, 3],
        [4, 6],
        [7, 10]
      ]
    );

    assert.deepEqual(
      LAUNCH_STAGES.map(
        item =>
          item.name
      ),
      [
        "街坊立足",
        "商圈成长",
        "城市招牌"
      ]
    );

    assert.equal(
      launchProgressionSystem
        .getStageForLevel(
          1
        )
        .id,
      "street_survival"
    );

    assert.equal(
      launchProgressionSystem
        .getStageForLevel(
          4
        )
        .id,
      "district_growth"
    );

    assert.equal(
      launchProgressionSystem
        .getStageForLevel(
          10
        )
        .id,
      "city_signature"
    );
  }
);


test(
  "launch content budget stays intentionally smaller than the underlying data library",
  () => {
    assert.deepEqual(
      LAUNCH_CONTENT_TOTALS,
      {
        stages:
          3,
        dishes:
          18,
        ingredientCategories:
          10,
        suppliers:
          9,
        employeeRoles:
          6,
        marketingActions:
          4,
        renovationTemplates:
          9,
        randomEvents:
          18
      }
    );

    assert.ok(
      DISHES_V1.length >
      LAUNCH_CONTENT_TOTALS
        .dishes
    );

    assert.ok(
      INGREDIENTS_V1.length >
      LAUNCH_CONTENT_TOTALS
        .ingredientCategories
    );

    assert.ok(
      SUPPLIERS_V1.length >
      LAUNCH_CONTENT_TOTALS
        .suppliers
    );

    assert.ok(
      RANDOM_EVENTS_V1.length >
      LAUNCH_CONTENT_TOTALS
        .randomEvents
    );
  }
);


test(
  "all curated launch references resolve to real production data",
  () => {
    const dishIds =
      ids(
        DISHES_V1
      );

    const recipeIds =
      ids(
        RECIPES_V1
      );

    const supplierIds =
      ids(
        SUPPLIERS_V1
      );

    const marketingIds =
      ids(
        MARKETING_ACTIONS_V1
      );

    const renovationIds =
      ids(
        RENOVATION_TEMPLATES_V1
      );

    const eventIds =
      ids(
        RANDOM_EVENTS_V1
      );

    const ingredientCategories =
      new Set(
        INGREDIENTS_V1.map(
          item =>
            item.category
        )
      );

    const employeeRoleIds =
      new Set(
        Object.keys(
          EMPLOYEE_ROLES
        )
      );

    const cumulative =
      launchProgressionSystem
        .getCumulativeContent(
          10
        );

    for (
      const dishId
      of cumulative.dishIds
    ) {
      assert.ok(
        dishIds.has(
          dishId
        ),
        `missing launch dish ${dishId}`
      );

      const dish =
        DISHES_V1.find(
          item =>
            item.id ===
            dishId
        );

      assert.ok(
        recipeIds.has(
          dish.defaultRecipeId
        ),
        `missing launch recipe ${dish.defaultRecipeId}`
      );
    }

    for (
      const category
      of cumulative
        .ingredientCategories
    ) {
      assert.ok(
        ingredientCategories
          .has(
            category
          ),
        `missing ingredient category ${category}`
      );
    }

    for (
      const supplierId
      of cumulative.supplierIds
    ) {
      assert.ok(
        supplierIds.has(
          supplierId
        ),
        `missing launch supplier ${supplierId}`
      );
    }

    for (
      const roleId
      of cumulative
        .employeeRoleIds
    ) {
      assert.ok(
        employeeRoleIds.has(
          roleId
        ),
        `missing employee role ${roleId}`
      );
    }

    for (
      const actionId
      of cumulative
        .marketingActionIds
    ) {
      assert.ok(
        marketingIds.has(
          actionId
        ),
        `missing marketing action ${actionId}`
      );
    }

    for (
      const templateId
      of cumulative
        .renovationTemplateIds
    ) {
      assert.ok(
        renovationIds.has(
          templateId
        ),
        `missing renovation template ${templateId}`
      );
    }

    for (
      const eventId
      of LAUNCH_EVENT_IDS
    ) {
      assert.ok(
        eventIds.has(
          eventId
        ),
        `missing launch event ${eventId}`
      );
    }
  }
);


test(
  "stage content grows cumulatively instead of replacing earlier content",
  () => {
    const stage1 =
      launchProgressionSystem
        .getCumulativeContent(
          1
        );

    const stage2 =
      launchProgressionSystem
        .getCumulativeContent(
          4
        );

    const stage3 =
      launchProgressionSystem
        .getCumulativeContent(
          7
        );

    assert.equal(
      stage1.dishIds.length,
      8
    );

    assert.equal(
      stage2.dishIds.length,
      14
    );

    assert.equal(
      stage3.dishIds.length,
      18
    );

    assert.equal(
      stage1
        .ingredientCategories
        .length,
      8
    );

    assert.equal(
      stage2
        .ingredientCategories
        .length,
      10
    );

    assert.equal(
      stage3
        .ingredientCategories
        .length,
      10
    );

    for (
      const id
      of stage1.dishIds
    ) {
      assert.ok(
        stage2.dishIds
          .includes(
            id
          )
      );

      assert.ok(
        stage3.dishIds
          .includes(
            id
          )
      );
    }
  }
);


test(
  "automatic district-event selection only uses the 18-event launch pool",
  () => {
    app.core
      .gameState
      .reset();

    app.systems
      .gameFoundationSystem
      .initialize({
        seedProperties:
          false,
        overwriteReferenceData:
          true
      });

    const launchIds =
      new Set(
        LAUNCH_EVENT_IDS
      );

    for (
      let index = 0;
      index < 80;
      index += 1
    ) {
      const picked =
        app.systems
          .districtEventSystem
          .pickRandomEvent(
            null,
            1
          );

      assert.ok(
        launchIds.has(
          picked
        ),
        `automatic event outside launch pool: ${picked}`
      );
    }
  }
);
