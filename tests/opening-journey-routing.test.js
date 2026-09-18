import test from "node:test";
import assert from "node:assert/strict";

import {
  OpeningFlowSystem
} from "../src/systems/OpeningFlowSystem.js";


function buildSystem(
  status
) {
  const system =
    new OpeningFlowSystem();


  system.getStatus =
    () => ({
      restaurant: {
        locationId:
          null
      },

      lease:
        null,

      renovation: {
        initialized:
          false,

        active:
          false
      },

      construction:
        null,

      hasOpened:
        false,

      ...status
    });


  return system;
}


test(
  "没有签约时自动进入房源选择",
  () => {
    const system =
      buildSystem({});


    assert.equal(
      system.getRecommendedPage(
        "restaurant"
      ),
      "properties"
    );
  }
);


test(
  "签约后自动进入装修",
  () => {
    const system =
      buildSystem({
        restaurant: {
          locationId:
            "property_1"
        },

        lease: {
          id:
            "lease_1"
        }
      });


    assert.equal(
      system.getRecommendedPage(
        "restaurant"
      ),
      "renovation"
    );
  }
);


test(
  "装修施工期间自动进入施工页",
  () => {
    const system =
      buildSystem({
        restaurant: {
          locationId:
            "property_1"
        },

        lease: {
          id:
            "lease_1"
        },

        construction: {
          id:
            "construction_1"
        }
      });


    assert.equal(
      system.getRecommendedPage(
        "restaurant"
      ),
      "renovation_construction"
    );
  }
);


test(
  "装修验收后进入开店准备",
  () => {
    const system =
      buildSystem({
        restaurant: {
          locationId:
            "property_1"
        },

        lease: {
          id:
            "lease_1"
        },

        renovation: {
          initialized:
            true,

          active:
            true
        }
      });


    assert.equal(
      system.getRecommendedPage(
        "restaurant"
      ),
      "opening-setup"
    );
  }
);


test(
  "正式开业后进入经营总控",
  () => {
    const system =
      buildSystem({
        restaurant: {
          locationId:
            "property_1"
        },

        lease: {
          id:
            "lease_1"
        },

        renovation: {
          initialized:
            true,

          active:
            true
        },

        hasOpened:
          true
      });


    assert.equal(
      system.getRecommendedPage(
        "restaurant"
      ),
      "operating-command-center"
    );
  }
);
