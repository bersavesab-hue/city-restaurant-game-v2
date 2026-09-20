import { pageRegistry } from "./PageRegistry.js";
import { PRIMARY_UI_TABS } from "../contracts/PrimaryUiContract.js";

const CORE_PAGES = [
  ...PRIMARY_UI_TABS.map(({ id, title, order, layout }) => ({
    id,
    title,
    nav: "main",
    order,
    layout
  })),

  { id: "properties", title: "商圈与房源", parent: "city", order: 110, layout: "workspace" },
  { id: "property_detail", title: "房源详情", parent: "city", order: 120, layout: "management" },

  { id: "lease", title: "租约管理", parent: "restaurant", order: 210, layout: "management" },
  { id: "renovation", title: "装修布局", parent: "restaurant", order: 220, layout: "workspace" },
  { id: "renovation_construction", title: "装修施工", parent: "restaurant", order: 225, layout: "management" },
  { id: "opening-setup", title: "开店准备", parent: "restaurant", order: 230, layout: "management" },

  { id: "dishes", title: "菜品中心", parent: "operations", order: 310, layout: "management" },
  { id: "supply", title: "供应链", parent: "operations", order: 320, layout: "management" },
  { id: "analytics", title: "经营数据", parent: "operations", order: 330, layout: "dashboard" },
  { id: "finance", title: "财务", parent: "operations", order: 340, layout: "dashboard" },

  { id: "employee_training", title: "培训", parent: "employees", order: 420, layout: "management" },
  { id: "employee_promotion", title: "员工晋升", parent: "employees", order: 430, layout: "management", unlock: "employee_promotion" },

  { id: "member-marketing", title: "会员营销", parent: "more", order: 510, layout: "management", unlock: "membership" },
  { id: "compliance-center", title: "合规中心", parent: "more", order: 515, layout: "management" },
  { id: "chain", title: "连锁管理", parent: "more", order: 520, layout: "management", unlock: "second_store" },
  { id: "brand-investments", title: "长期品牌基建", parent: "more", order: 530, layout: "management", unlock: "membership" },
  { id: "feedback", title: "测试反馈", parent: "more", order: 580, layout: "management" },
  { id: "settings", title: "设置", parent: "more", order: 590, layout: "management" }
];

export function registerDefaultPages(registry = pageRegistry) {
  for (const page of CORE_PAGES) {
    if (!registry.has(page.id)) {
      registry.register(page);
    }
  }
  return registry;
}

registerDefaultPages();

export { CORE_PAGES };
