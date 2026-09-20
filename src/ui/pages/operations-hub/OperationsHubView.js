import {
  renderGameTopBar,
  renderBottomNavigation
} from "../../components/GameChromeView.js";

import {
  renderUiIcon
} from "../../components/UiIconView.js";


function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}


function money(value) {
  return "¥" +
    Math.round(
      Number(value) || 0
    ).toLocaleString("zh-CN");
}


function signedPercent(value) {
  const number =
    Number(value) || 0;

  return (
    (number > 0 ? "+" : "") +
    number.toFixed(1) +
    "%"
  );
}


function renderKpis(page) {
  const kpis =
    page.kpis ?? {};

  const items = [
    {
      id: "revenue",
      icon: "●",
      title: "今日营业额",
      value: money(kpis.revenue),
      change: signedPercent(kpis.revenueChange),
      tone: kpis.revenueChange >= 0 ? "up" : "down"
    },
    {
      id: "profit",
      icon: "▥",
      title: "今日利润",
      value: money(kpis.profit),
      change: signedPercent(kpis.profitChange),
      tone: kpis.profitChange >= 0 ? "up" : "down"
    },
    {
      id: "orders",
      icon: "▣",
      title: "今日订单",
      value: String(kpis.orders ?? 0),
      change: signedPercent(kpis.orderChange),
      tone: kpis.orderChange >= 0 ? "up" : "down"
    },
    {
      id: "satisfaction",
      icon: "☺",
      title: "顾客满意度",
      value: (Number(kpis.satisfaction) || 0).toFixed(1) + "分",
      change: signedPercent(kpis.satisfactionChange),
      tone: kpis.satisfactionChange >= 0 ? "up" : "down"
    }
  ];

  return (
    '<section class="operations-home-kpis">' +
      items.map(item =>
        '<article class="operations-home-kpi operations-home-kpi--' +
        item.id +
        '">' +
          '<span class="operations-home-kpi__icon" aria-hidden="true">' +
            item.icon +
          '</span>' +
          '<div>' +
            '<small>' + escapeHtml(item.title) + '</small>' +
            '<strong>' + escapeHtml(item.value) + '</strong>' +
            '<b data-trend="' + item.tone + '">' +
              (item.tone === "up" ? "▲ " : item.tone === "down" ? "▼ " : "") +
              escapeHtml(item.change) +
              ' <i>较昨日</i>' +
            '</b>' +
          '</div>' +
        '</article>'
      ).join("") +
    '</section>'
  );
}


function renderTodos(todos) {
  const list =
    Array.isArray(todos)
      ? todos
      : [];

  const iconByTarget = {
    supply: "▰",
    channels: "◉",
    "market-strategy": "◉",
    dishes: "♟",
    "menu-optimization": "♟",
    analytics: "▥",
    finance: "●"
  };

  return (
    '<section class="operations-home-todos">' +
      '<header>' +
        '<div><span aria-hidden="true">▣</span><strong>今日待办</strong><b>(' +
          list.length +
        ')</b></div>' +
        '<button type="button" data-page-target="analytics">查看全部 ›</button>' +
      '</header>' +
      (
        list.length
          ? (
              '<div class="operations-home-todos__grid">' +
                list.slice(0,3).map(item =>
                  '<button type="button" class="operations-home-todo" ' +
                    (item.target
                      ? 'data-page-target="' + escapeHtml(item.target) + '"'
                      : '') +
                  '>' +
                    '<span class="operations-home-todo__icon" aria-hidden="true">' +
                      (iconByTarget[item.target] ?? "!") +
                    '</span>' +
                    '<span>' +
                      '<strong>' + escapeHtml(item.title) + '</strong>' +
                      '<small>' + escapeHtml(item.description ?? "") + '</small>' +
                    '</span>' +
                    '<b aria-hidden="true">›</b>' +
                  '</button>'
                ).join("") +
              '</div>'
            )
          : (
              '<div class="operations-home-todos__empty">' +
                '<strong>今日暂无待办</strong>' +
                '<span>当前经营状态正常。</span>' +
              '</div>'
            )
      ) +
    '</section>'
  );
}


function renderModule(entry) {
  const badge =
    entry.badge
      ? (
          '<b class="operations-module__badge operations-module__badge--' +
          escapeHtml(entry.badgeTone ?? "neutral") +
          '">' +
            escapeHtml(entry.badge) +
          '</b>'
        )
      : "";

  return (
    '<button type="button" ' +
      'class="operations-module operations-module--' +
        escapeHtml(entry.id) +
        (entry.state === "locked" ? ' is-locked' : '') +
      '" ' +
      'data-page-target="' +
        escapeHtml(entry.target) +
      '" ' +
      (entry.state === "locked" ? 'disabled' : '') +
    '>' +

      '<span class="operations-module__visual">' +
        '<span class="operations-module__title">' +
          '<strong>' + escapeHtml(entry.title) + '</strong>' +
          '<small>' + escapeHtml(entry.subtitle) + '</small>' +
        '</span>' +
      '</span>' +

      '<span class="operations-module__status">' +
        '<span class="operations-module__status-icon">' +
          renderUiIcon(
            entry.icon,
            "operations-module__status-svg"
          ) +
        '</span>' +
        '<strong>' + escapeHtml(entry.statusText ?? "") + '</strong>' +
        badge +
        '<span class="operations-module__arrow" aria-hidden="true">›</span>' +
      '</span>' +

    '</button>'
  );
}


function renderBottomCards(page) {
  const ranking =
    page.ranking ?? {};

  const research =
    page.research ?? {};

  return (
    '<section class="operations-home-bottom">' +

      '<button type="button" class="operations-home-mini operations-home-mini--ranking" data-page-target="ranking-center">' +
        '<span class="operations-home-mini__icon" aria-hidden="true">♛</span>' +
        '<span>' +
          '<strong>排行榜与荣誉</strong>' +
          '<small>' +
            escapeHtml(
              ranking.text ??
              "查看集团排名与获得的荣誉"
            ) +
          '</small>' +
        '</span>' +
        (ranking.badge
          ? '<b>' + escapeHtml(ranking.badge) + '</b>'
          : '') +
        '<i aria-hidden="true">›</i>' +
      '</button>' +

      '<button type="button" class="operations-home-mini operations-home-mini--research" data-page-target="dishes">' +
        '<span class="operations-home-mini__icon" aria-hidden="true">⌒</span>' +
        '<span>' +
          '<strong>研发菜品</strong>' +
          '<small>开发新菜品，丰富菜单选择</small>' +
        '</span>' +
        '<b>' +
          escapeHtml(
            research.badge ??
            ("已研发 " + (research.total ?? 0))
          ) +
        '</b>' +
        '<i aria-hidden="true">›</i>' +
      '</button>' +

    '</section>'
  );
}


class OperationsHubView {
  renderMarkup(page) {
    return (
      '<main class="rg-screen operations-home-screen">' +

        (
          page.topBar
            ? renderGameTopBar(
                page.topBar,
                {
                  subtitle: "集团视角",
                  showSpeedControls: true
                }
              )
            : ""
        ) +

        '<section class="operations-home-hero" aria-label="经营中心">' +
          '<div>' +
            '<h1>经营中心</h1>' +
            '<p>用好每一份资源，让美食创造更多价值</p>' +
          '</div>' +
          '<span aria-hidden="true">用心做美食<br>让更多人爱上好味道</span>' +
        '</section>' +

        '<div class="operations-home-content">' +
          renderKpis(page) +
          renderTodos(page.todos) +
          '<section class="operations-home-modules">' +
            (page.entries ?? [])
              .filter(item => item.kind === "module")
              .map(renderModule)
              .join("") +
          '</section>' +
          renderBottomCards(page) +
        '</div>' +

        renderBottomNavigation(
          page.navigation ?? []
        ) +

      '</main>'
    );
  }
}


export const operationsHubView =
  new OperationsHubView();


export {
  OperationsHubView
};
