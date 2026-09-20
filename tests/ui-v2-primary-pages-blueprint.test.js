import test from "node:test";
import assert from "node:assert/strict";

import {
  UI_V2_COMPONENT_CATALOG
} from "../src/ui-v2/components/ComponentCatalog.js";

import {
  PRIMARY_PAGE_IDS,
  PRIMARY_PAGE_BLUEPRINTS
} from "../src/ui-v2/blueprints/PrimaryPageBlueprints.js";

import {
  SHARED_VISUAL_RESOURCES,
  PRIMARY_PAGE_VISUAL_RESOURCES,
  collectVisualResourceIds
} from "../src/ui-v2/blueprints/PrimaryVisualResourcePlan.js";

test(
  "五个一级页面一次性锁定且不包含旧入口",
  () => {
    assert.deepEqual(
      PRIMARY_PAGE_IDS,
      [
        "city",
        "store",
        "operations",
        "employees",
        "more"
      ]
    );

    const json =
      JSON.stringify(
        PRIMARY_PAGE_BLUEPRINTS
      );

    assert.doesNotMatch(
      json,
      /operating-command-center|operations-home|employee_roster|more-home|restaurant-home/
    );
  }
);

test(
  "五页均只描述Page Content不重建HUD和Nav",
  () => {
    for (
      const page
      of Object.values(
        PRIMARY_PAGE_BLUEPRINTS
      )
    ) {
      for (
        const section
        of page.sections
      ) {
        assert.notEqual(
          section.component,
          "global-hud"
        );

        assert.notEqual(
          section.component,
          "global-nav"
        );
      }
    }
  }
);

test(
  "门店经营员工更多的一级模块数量与确认稿一致",
  () => {
    const store =
      PRIMARY_PAGE_BLUEPRINTS.store;

    const operations =
      PRIMARY_PAGE_BLUEPRINTS.operations;

    const employees =
      PRIMARY_PAGE_BLUEPRINTS.employees;

    const more =
      PRIMARY_PAGE_BLUEPRINTS.more;

    assert.equal(
      store.sections.find(
        item =>
          item.id ===
          "store-tools"
      ).items,
      4
    );

    assert.equal(
      operations.sections.find(
        item =>
          item.id ===
          "operations-core-modules"
      ).items,
      6
    );

    assert.equal(
      employees.sections.find(
        item =>
          item.id ===
          "employees-actions"
      ).items,
      4
    );

    assert.equal(
      more.sections.find(
        item =>
          item.id ===
          "more-brand-growth"
      ).items,
      4
    );

    assert.equal(
      more.sections.find(
        item =>
          item.id ===
          "more-customer-safety"
      ).items,
      3
    );

    assert.equal(
      more.sections.find(
        item =>
          item.id ===
          "more-services"
      ).items,
      3
    );
  }
);

test(
  "一级页只允许从统一组件目录组合",
  () => {
    const allowed =
      new Set(
        Object.values(
          UI_V2_COMPONENT_CATALOG
        ).map(
          item =>
            item.id
        )
      );

    for (
      const page
      of Object.values(
        PRIMARY_PAGE_BLUEPRINTS
      )
    ) {
      for (
        const section
        of page.sections
      ) {
        assert.ok(
          allowed.has(
            section.component
          ),
          page.id +
            ":" +
            section.component
        );
      }
    }
  }
);

test(
  "正式资源计划禁止把动态文字烘焙进图片",
  () => {
    const all =
      [
        ...SHARED_VISUAL_RESOURCES,
        ...Object.values(
          PRIMARY_PAGE_VISUAL_RESOURCES
        ).flat()
      ];

    assert.ok(
      all.length >
      0
    );

    for (
      const item
      of all
    ) {
      assert.equal(
        item.textInImage,
        false,
        item.id
      );
    }

    assert.equal(
      new Set(
        collectVisualResourceIds()
      ).size,
      collectVisualResourceIds().length
    );
  }
);

test(
  "资源池最低数量满足当前五页设计基线",
  () => {
    const city =
      PRIMARY_PAGE_VISUAL_RESOURCES.city;

    const store =
      PRIMARY_PAGE_VISUAL_RESOURCES.store;

    const employees =
      PRIMARY_PAGE_VISUAL_RESOURCES.employees;

    assert.equal(
      city.find(
        item =>
          item.id ===
          "city-district-thumbnails"
      ).minimumCount,
      20
    );

    assert.equal(
      store.find(
        item =>
          item.id ===
          "store-facade-pool"
      ).minimumCount,
      12
    );

    assert.equal(
      employees.find(
        item =>
          item.id ===
          "employee-avatar-pool"
      ).minimumCount,
      40
    );
  }
);
