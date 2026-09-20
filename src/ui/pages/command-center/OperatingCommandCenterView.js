import {
  renderGameTopBar,
  renderNoticeTicker,
  renderPageTitle,
  renderBottomNavigation
} from "../../components/GameChromeView.js";

import {
  renderUiIcon
} from "../../components/UiIconView.js";


function escapeHtml(
  value
) {
  return String(
    value ??
    ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}


function money(
  value
) {
  return (
    "¥" +
    Math.round(
      Number(value) ||
      0
    ).toLocaleString(
      "zh-CN"
    )
  );
}


function percent(
  value
) {
  return (
    Math.max(
      0,
      Math.min(
        100,
        Math.round(
          Number(value) ||
          0
        )
      )
    ) +
    "%"
  );
}


function renderOverview(
  portfolio
) {
  const totals =
    portfolio?.totals ??
    {};

  const metrics = [
    [
      "▥",
      "营业额",
      money(
        totals.revenue
      ),
      "今日集团"
    ],
    [
      "●",
      "利润",
      money(
        totals.profit
      ),
      "今日集团"
    ],
    [
      "♟",
      "顾客总数",
      Number(
        totals.guests ??
        0
      ).toLocaleString(
        "zh-CN"
      ),
      "今日到店"
    ],
    [
      "♡",
      "满意度",
      percent(
        totals.satisfaction
      ),
      "门店均值"
    ]
  ];

  return (
    '<section class="store-hub-overview">' +
      '<header>' +
        '<div>' +
          '<span class="store-hub-overview__icon">' +
            '▥' +
          '</span>' +
          '<div>' +
            '<strong>集团经营概况</strong>' +
            '<small>实时汇总旗下门店经营表现</small>' +
          '</div>' +
        '</div>' +
        '<button type="button" data-page-target="analytics">' +
          '经营详情 ›' +
        '</button>' +
      '</header>' +
      '<div class="store-hub-overview__metrics">' +
        metrics
          .map(
            (
              [
                icon,
                label,
                value,
                sub
              ],
              index
            ) =>
              '<article class="store-hub-overview__metric store-hub-overview__metric--' +
                index +
              '">' +
                '<span aria-hidden="true">' +
                  icon +
                '</span>' +
                '<div>' +
                  '<small>' +
                    escapeHtml(
                      label
                    ) +
                  '</small>' +
                  '<strong>' +
                    escapeHtml(
                      value
                    ) +
                  '</strong>' +
                  '<b>' +
                    escapeHtml(
                      sub
                    ) +
                  '</b>' +
                '</div>' +
              '</article>'
          )
          .join(
            ""
          ) +
      '</div>' +
    '</section>'
  );
}


function renderStoreCard(
  store
) {
  const state =
    store.state ??
    "closed";

  const manager =
    store.manager ??
    null;

  const managerStyle =
    manager?.avatarPath
      ? ' style="background-image:url(&quot;' +
        escapeHtml(
          manager.avatarPath
        ) +
        '&quot;)"'
      : "";

  const progress =
    state ===
      "preparing"
      ? (
          '<div class="store-hub-card__progress">' +
            '<span><b>筹备进度</b><strong>' +
              percent(
                store.preparationProgress
              ) +
            '</strong></span>' +
            '<i><b style="width:' +
              percent(
                store.preparationProgress
              ) +
            '"></b></i>' +
          '</div>'
        )
      : "";

  const warning =
    store.issueCount >
      0
      ? (
          '<span class="store-hub-card__warning">' +
            store.issueCount +
            ' 项提醒' +
          '</span>'
        )
      : "";

  return (
    '<button ' +
      'type="button" ' +
      'class="store-hub-card store-hub-card--' +
        escapeHtml(
          state
        ) +
      (store.active
        ? ' is-active'
        : '') +
      '" ' +
      'data-store-state="' +
        escapeHtml(
          state
        ) +
      '" ' +
      'data-page-target="restaurant" ' +
      'data-restaurant-id="' +
        escapeHtml(
          store.id
        ) +
      '">' +

      '<span class="store-hub-card__visual store-hub-card__visual--' +
        Number(
          store.artIndex ??
          0
        ) +
      '">' +
        '<span class="store-hub-card__status">' +
          escapeHtml(
            store.statusLabel
          ) +
        '</span>' +
        '<span class="store-hub-card__menu" aria-hidden="true">•••</span>' +
      '</span>' +

      '<span class="store-hub-card__body">' +
        '<span class="store-hub-card__heading">' +
          '<span>' +
            '<strong>' +
              escapeHtml(
                store.name
              ) +
            '</strong>' +
            '<small>' +
              escapeHtml(
                store.locationLabel ??
                "尚未完成选址"
              ) +
            '</small>' +
          '</span>' +
          warning +
        '</span>' +

        '<span class="store-hub-card__metrics">' +
          '<span>' +
            '<small>营业额</small>' +
            '<strong>' +
              money(
                store.revenue
              ) +
            '</strong>' +
          '</span>' +
          '<span>' +
            '<small>利润</small>' +
            '<strong>' +
              money(
                store.profit
              ) +
            '</strong>' +
          '</span>' +
          '<span>' +
            '<small>满意度</small>' +
            '<strong>' +
              percent(
                store.satisfaction
              ) +
            '</strong>' +
          '</span>' +
        '</span>' +

        '<span class="store-hub-card__manager">' +
          '<span class="store-hub-card__avatar"' +
            managerStyle +
          '>' +
            (
              manager
                ? escapeHtml(
                    manager.name
                      ?.slice(
                        0,
                        1
                      ) ??
                    "店"
                  )
                : "店"
            ) +
          '</span>' +
          '<span>' +
            '<strong>' +
              escapeHtml(
                manager?.name ??
                "待配置负责人"
              ) +
            '</strong>' +
            '<small>' +
              escapeHtml(
                manager
                  ? (
                      manager.roleName +
                      " · Lv." +
                      manager.level
                    )
                  : "负责人未配置"
              ) +
            '</small>' +
          '</span>' +
        '</span>' +

        progress +
      '</span>' +
    '</button>'
  );
}


function renderStoreList(
  portfolio
) {
  const cards =
    portfolio?.cards ??
    [];

  const filters =
    portfolio?.filterCounts ??
    {
      all:
        cards.length,

      open:
        0,

      preparing:
        0,

      abnormal:
        0
    };

  const capacity =
    portfolio?.capacity ??
    cards.length;

  const canCreate =
    portfolio?.canCreateBranch ===
      true;

  return (
    '<section class="store-hub-stores">' +

      '<header class="store-hub-stores__header">' +
        '<div>' +
          '<strong>旗下门店</strong>' +
          '<small>' +
            cards.length +
            ' / ' +
            capacity +
          '</small>' +
        '</div>' +

        '<button ' +
          'type="button" ' +
          'class="store-hub-new-store' +
            (
              canCreate
                ? ''
                : ' is-locked'
            ) +
          '" ' +
          'data-page-target="chain">' +
          '<span aria-hidden="true">＋</span>' +
          '<strong>新开门店</strong>' +
        '</button>' +
      '</header>' +

      '<input class="store-hub-filter-control" type="radio" name="store-hub-filter" id="store-filter-all" checked>' +
      '<input class="store-hub-filter-control" type="radio" name="store-hub-filter" id="store-filter-open">' +
      '<input class="store-hub-filter-control" type="radio" name="store-hub-filter" id="store-filter-preparing">' +
      '<input class="store-hub-filter-control" type="radio" name="store-hub-filter" id="store-filter-abnormal">' +

      '<nav class="store-hub-filters" aria-label="门店筛选">' +
        '<label for="store-filter-all">全部 (' +
          filters.all +
        ')</label>' +
        '<label for="store-filter-open">营业中 (' +
          filters.open +
        ')</label>' +
        '<label for="store-filter-preparing">筹备中 (' +
          filters.preparing +
        ')</label>' +
        '<label for="store-filter-abnormal">异常 (' +
          filters.abnormal +
        ')</label>' +
      '</nav>' +

      '<div class="store-hub-cards" aria-label="门店列表">' +
        (
          cards.length
            ? cards
                .map(
                  renderStoreCard
                )
                .join(
                  ""
                )
            : (
                '<div class="store-hub-empty">' +
                  '<strong>当前还没有门店</strong>' +
                  '<span>完成选址与开店流程后，门店会自动出现在这里。</span>' +
                '</div>'
              )
        ) +
      '</div>' +

    '</section>'
  );
}


function renderTodos(
  todos
) {
  const list =
    Array.isArray(
      todos
    )
      ? todos
      : [];

  return (
    '<section class="store-hub-todos">' +
      '<header>' +
        '<div>' +
          '<span aria-hidden="true">▣</span>' +
          '<strong>今日待办</strong>' +
          '<b>' +
            list.length +
          '</b>' +
        '</div>' +
        '<button type="button" data-page-target="analytics">' +
          '查看全部 ›' +
        '</button>' +
      '</header>' +

      '<div class="store-hub-todos__list">' +
        (
          list.length
            ? list
                .map(
                  (
                    item,
                    index
                  ) =>
                    '<button ' +
                      'type="button" ' +
                      'class="store-hub-todo store-hub-todo--' +
                        escapeHtml(
                          item.severity ??
                          "medium"
                        ) +
                      '" ' +
                      (
                        item.target
                          ? (
                              'data-page-target="' +
                              escapeHtml(
                                item.target
                              ) +
                              '"'
                            )
                          : ""
                      ) +
                      '>' +

                      '<span class="store-hub-todo__icon" aria-hidden="true">' +
                        (
                          index === 0
                            ? "!"
                            : index === 1
                              ? "▣"
                              : "●"
                        ) +
                      '</span>' +

                      '<span>' +
                        '<strong>' +
                          escapeHtml(
                            item.title
                          ) +
                        '</strong>' +
                        '<small>' +
                          escapeHtml(
                            item.storeName
                              ? (
                                  item.storeName +
                                  " · " +
                                  (
                                    item.description ??
                                    ""
                                  )
                                )
                              : (
                                  item.description ??
                                  ""
                                )
                          ) +
                        '</small>' +
                      '</span>' +

                      '<b aria-hidden="true">›</b>' +
                    '</button>'
                )
                .join(
                  ""
                )
            : (
                '<div class="store-hub-todos__empty">' +
                  '<strong>今日暂无待办</strong>' +
                  '<span>所有门店当前运行正常。</span>' +
                '</div>'
              )
        ) +
      '</div>' +
    '</section>'
  );
}


function renderManagementTools() {
  const tools = [
    [
      "renovation",
      "装修布局",
      "调整门店空间与风格",
      "renovation"
    ],
    [
      "equipment",
      "门店设施",
      "设备配置与维护",
      "equipment-management"
    ],
    [
      "cash",
      "租约管理",
      "查看租金与租期",
      "lease"
    ],
    [
      "store",
      "开店准备",
      "证照、备货与营业配置",
      "opening-setup"
    ]
  ];

  return (
    '<section class="store-hub-tools">' +
      '<header><strong>门店管理功能</strong></header>' +
      '<div>' +
        tools
          .map(
            item =>
              '<button type="button" data-page-target="' +
                escapeHtml(
                  item[3]
                ) +
              '">' +
                '<span>' +
                  renderUiIcon(
                    item[0],
                    "store-hub-tools__icon"
                  ) +
                '</span>' +
                '<strong>' +
                  escapeHtml(
                    item[1]
                  ) +
                '</strong>' +
                '<small>' +
                  escapeHtml(
                    item[2]
                  ) +
                '</small>' +
                '<b aria-hidden="true">›</b>' +
              '</button>'
          )
          .join(
            ""
          ) +
      '</div>' +
    '</section>'
  );
}


class OperatingCommandCenterView {
  renderMarkup(
    page
  ) {
    const portfolio =
      page.storePortfolio ??
      {
        cards:
          [],

        totals:
          {},

        filterCounts:
          {},

        capacity:
          0,

        canCreateBranch:
          false
      };

    return (
      '<main class="rg-screen store-hub-screen">' +

        (
          page.topBar
            ? renderGameTopBar(
                page.topBar,
                {
                  subtitle:
                    "集团视角",

                  showSpeedControls:
                    true
                }
              )
            : ""
        ) +

        '<section class="store-hub-hero">' +
          '<div>' +
            '<h1>门店管理</h1>' +
            '<p>多店经营 · 扩大规模 · 打造人气餐饮品牌</p>' +
          '</div>' +
          '<span aria-hidden="true">用美食<br>连接更多美好的生活♡</span>' +
        '</section>' +

        '<div class="store-hub-content">' +
          renderOverview(
            portfolio
          ) +
          renderStoreList(
            portfolio
          ) +
          renderTodos(
            portfolio.todos
          ) +
          renderManagementTools() +
        '</div>' +

        renderBottomNavigation(
          page.navigation ??
          []
        ) +

      '</main>'
    );
  }
}


export const operatingCommandCenterView =
  new OperatingCommandCenterView();


export {
  OperatingCommandCenterView
};
