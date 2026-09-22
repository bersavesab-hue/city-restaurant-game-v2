const STORE_FILTERS =
  Object.freeze([
    Object.freeze({id: "all", label: "全部"}),
    Object.freeze({id: "open", label: "营业中"}),
    Object.freeze({id: "preparing", label: "筹备中"}),
    Object.freeze({id: "abnormal", label: "异常"})
  ]);

const STORE_ACTIONS =
  Object.freeze([
    Object.freeze({
      id: "renovation",
      title: "装修布局",
      subtitle: "调整空间与装修方案"
    }),
    Object.freeze({
      id: "equipment",
      title: "门店设施",
      subtitle: "查看设备与设施状态"
    }),
    Object.freeze({
      id: "lease",
      title: "租约管理",
      subtitle: "查看房租与租约信息"
    }),
    Object.freeze({
      id: "opening",
      title: "开店准备",
      subtitle: "推进新店筹备流程"
    })
  ]);

function renderStoreFilters() {
  return STORE_FILTERS
    .map(
      (filter,index) =>
        '<button class="ui-v2-store-frame__filter' +
        (index === 0 ? ' is-active' : '') +
        '" type="button" data-store-filter="' +
        filter.id +
        '">' +
        '<strong>' +
        filter.label +
        '(<span data-live="store-filter-' +
        filter.id +
        '">0</span>)</strong>' +
        '</button>'
    )
    .join("");
}

function renderStoreActions() {
  return STORE_ACTIONS
    .map(
      action =>
        '<button class="ui-v2-store-frame__action" type="button" data-store-action="' +
        action.id +
        '">' +
        '<span class="ui-v2-store-frame__action-icon" aria-hidden="true"></span>' +
        '<span>' +
        '<strong>' + action.title + '</strong>' +
        '<small>' + action.subtitle + '</small>' +
        '</span>' +
        '<i aria-hidden="true"></i>' +
        '</button>'
    )
    .join("");
}

function renderStoreFrame() {
  return (
    '<div class="ui-v2-store-frame" data-ui="store-frame">' +
      '<section class="ui-v2-store-frame__hero">' +
        '<div class="ui-v2-store-frame__hero-art" aria-hidden="true"></div>' +
        '<div class="ui-v2-store-frame__hero-copy">' +
          '<h1>门店管理</h1>' +
          '<p>统筹旗下门店，掌握经营状态</p>' +
        '</div>' +
      '</section>' +

      '<section class="ui-v2-store-frame__summary" aria-label="门店概况">' +
        '<article><small>门店总数</small><strong data-live="store-total">0</strong><em>家</em></article>' +
        '<article><small>营业中</small><strong data-live="store-open">0</strong><em>家</em></article>' +
        '<article><small>筹备中</small><strong data-live="store-preparing">0</strong><em>家</em></article>' +
        '<article><small>异常</small><strong data-live="store-abnormal">0</strong><em>家</em></article>' +
      '</section>' +

      '<section class="ui-v2-store-frame__filters" role="tablist" aria-label="门店筛选">' +
        renderStoreFilters() +
      '</section>' +

      '<section class="ui-v2-store-frame__stores">' +
        '<header>' +
          '<div><h2>旗下门店</h2><p data-live="store-overview">当前暂无门店</p></div>' +
          '<span data-live="store-capacity">0 家</span>' +
        '</header>' +
        '<div class="ui-v2-store-frame__store-list" data-store-list></div>' +
        '<div class="ui-v2-store-frame__empty" data-store-empty>' +
          '<span class="ui-v2-store-frame__empty-icon" aria-hidden="true"></span>' +
          '<strong>尚未开设门店</strong>' +
          '<p>先在城市地图选择商圈与房源，再开始第一家门店的筹备。</p>' +
          '<button type="button" data-store-action="go-city">前往城市选址</button>' +
        '</div>' +
      '</section>' +

      '<section class="ui-v2-store-frame__tasks">' +
        '<header><h2>今日待办</h2><span data-live="store-task-count">0项</span></header>' +
        '<div class="ui-v2-store-frame__task-list" data-store-task-list>' +
          '<div class="ui-v2-store-frame__task-empty">暂无待办，门店运营正常。</div>' +
        '</div>' +
      '</section>' +

      '<section class="ui-v2-store-frame__actions">' +
        '<header><h2>门店管理</h2><p>门店开设后逐步开放管理功能</p></header>' +
        '<div class="ui-v2-store-frame__action-grid">' +
          renderStoreActions() +
        '</div>' +
      '</section>' +

      '<dialog class="ui-v2-store-dialog" data-ui="store-dialog">' +
        '<header><h2 data-store-dialog-title>门店信息</h2><button type="button" data-store-dialog-close aria-label="关闭">×</button></header>' +
        '<div class="ui-v2-store-dialog__list" data-store-dialog-list></div>' +
      '</dialog>' +
    '</div>'
  );
}

function mountStoreFrame(root) {
  if (!root) {
    throw new TypeError(
      "StoreFrame root must be a DOM element"
    );
  }

  root.innerHTML =
    renderStoreFrame();

  return Object.freeze({
    destroy() {
      root.replaceChildren();
    }
  });
}

export {
  STORE_FILTERS,
  STORE_ACTIONS,
  renderStoreFrame,
  mountStoreFrame
};
