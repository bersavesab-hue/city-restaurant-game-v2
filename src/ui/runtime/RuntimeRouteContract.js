import {
  PRIMARY_UI_IDS
} from "../contracts/PrimaryUiContract.js";

const MAIN_ROOT_PAGE_IDS =
  Object.freeze([
    ...PRIMARY_UI_IDS
  ]);

const NATIVE_RUNTIME_PAGE_IDS =
  Object.freeze([
    "properties",
    "property_detail",
    "renovation",
    "renovation_construction",
    "opening-setup",
    "dishes",
    "analytics"
  ]);

const INTENTIONAL_PLACEHOLDER_PAGE_IDS =
  Object.freeze([]);

const LEGACY_PAGE_IDS =
  Object.freeze([
    "operating-command-center",
    "operations-home",
    "employee_roster",
    "more-home",
    "restaurant_home",
    "restaurant-home",
    "employee-home",
    "employees-home",
    "members"
  ]);

export {
  MAIN_ROOT_PAGE_IDS,
  NATIVE_RUNTIME_PAGE_IDS,
  INTENTIONAL_PLACEHOLDER_PAGE_IDS,
  LEGACY_PAGE_IDS
};
