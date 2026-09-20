const PRIMARY_UI_TABS = Object.freeze([
  Object.freeze({ id: "city", title: "城市", icon: "city", order: 10, layout: "workspace" }),
  Object.freeze({ id: "restaurant", title: "门店", icon: "store", order: 20, layout: "management" }),
  Object.freeze({ id: "operations", title: "经营", icon: "operations", order: 30, layout: "management" }),
  Object.freeze({ id: "employees", title: "员工", icon: "employees", order: 40, layout: "management" }),
  Object.freeze({ id: "more", title: "更多", icon: "more", order: 50, layout: "management" })
]);

const PRIMARY_UI_IDS = Object.freeze(
  PRIMARY_UI_TABS.map(item => item.id)
);

const PRIMARY_UI_ICON_BY_ID = Object.freeze(
  Object.fromEntries(
    PRIMARY_UI_TABS.map(item => [item.id, item.icon])
  )
);

function isPrimaryUiPage(value) {
  const id =
    String(
      value ??
      ""
    ).trim();

  return PRIMARY_UI_IDS.includes(
    id
  );
}

export {
  PRIMARY_UI_TABS,
  PRIMARY_UI_IDS,
  PRIMARY_UI_ICON_BY_ID,
  isPrimaryUiPage
};
