import {
  pageRegistry
} from "./PageRegistry.js";

import "./defaultPages.js";

const EMPLOYEE_PAGES = [
  {
    id: "employees-home",
    title: "员工",
    parent: "employees",
    order: 401,
    layout: "management"
  },
  {
    id: "workforce-capacity",
    title: "招聘与排班",
    parent: "employees",
    order: 415,
    layout: "management"
  }
];

for (const page of EMPLOYEE_PAGES) {
  if (!pageRegistry.has(page.id)) {
    pageRegistry.register(page);
  }
}

export {
  EMPLOYEE_PAGES
};
