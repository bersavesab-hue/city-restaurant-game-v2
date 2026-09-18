const MAIN_ROOT_PAGE_IDS =
  Object.freeze([
    "city",
    "restaurant",
    "operations",
    "employees",
    "more"
  ]);


const NATIVE_RUNTIME_PAGE_IDS =
  Object.freeze([
    "properties",
    "property_detail",

    "renovation",
    "renovation_construction",

    "opening-setup",

    "employee_roster",

    "dishes",
    "analytics",

    "restaurant-home"
  ]);


/*
 * 这些页面目前确实没有独立正式 View。
 * 允许暂时占位，但必须显式登记。
 *
 * 后面真正做出页面时，必须从这里删除。
 */
const INTENTIONAL_PLACEHOLDER_PAGE_IDS =
  Object.freeze([
    "lease",
    "employee_training",
    "members",
    "chain",
    "settings"
  ]);


const LEGACY_PAGE_IDS =
  Object.freeze([
    "restaurant_home",
    "employee-home",
    "employees-home"
  ]);


export {
  MAIN_ROOT_PAGE_IDS,
  NATIVE_RUNTIME_PAGE_IDS,
  INTENTIONAL_PLACEHOLDER_PAGE_IDS,
  LEGACY_PAGE_IDS
};
