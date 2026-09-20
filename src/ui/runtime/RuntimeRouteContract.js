import {
  PRIMARY_UI_IDS,
  LEGACY_PRIMARY_ROUTE_ALIASES
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
    ...Object.keys(
      LEGACY_PRIMARY_ROUTE_ALIASES
    ),
    "members"
  ]);

export {
  MAIN_ROOT_PAGE_IDS,
  NATIVE_RUNTIME_PAGE_IDS,
  INTENTIONAL_PLACEHOLDER_PAGE_IDS,
  LEGACY_PAGE_IDS
};
