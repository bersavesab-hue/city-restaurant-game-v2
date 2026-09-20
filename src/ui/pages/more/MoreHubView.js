import {
  moreHubPageSystem
} from "./MoreHubPageSystem.js";

import {
  gameChromeSystem
} from "../../components/GameChromeSystem.js";

import {
  renderGameTopBar,
  renderBottomNavigation
} from "../../components/GameChromeView.js";


function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}


function renderEntry(entry) {
  const progress =
    Number.isFinite(
      Number(entry.progress)
    )
      ? Math.max(
          0,
          Math.min(
            100,
            Number(entry.progress)
          )
        )
      : null;

  return (
    '<button type="button" class="more-home-card more-home-card--' +
      escapeHtml(entry.art) +
      (entry.state === "locked" ? " is-locked" : "") +
    '" data-page-target="' +
      escapeHtml(entry.target) +
    '" data-entry-state="' +
      escapeHtml(entry.state) +
    '" ' +
      (entry.state === "locked" ? "disabled" : "") +
    '>' +

      '<span class="more-home-card__art" aria-hidden="true">' +
        '<span>' +
          escapeHtml(entry.icon ?? "◆") +
        '</span>' +
      '</span>' +

      '<span class="more-home-card__copy">' +
        '<strong>' +
          escapeHtml(entry.title) +
        '</strong>' +
        '<small>' +
          escapeHtml(entry.description) +
        '</small>' +

        (
          progress !== null
            ? (
                '<span class="more-home-progress">' +
                  '<i><b style="width:' +
                    progress +
                  '%"></b></i>' +
                  '<em>' +
                    escapeHtml(
                      entry.progressLabel ??
                      Math.round(progress) + "%"
                    ) +
                  '</em>' +
                '</span>'
              )
            : ""
        ) +

        (
          entry.statusText
            ? (
                '<span class="more-home-card__status">' +
                  escapeHtml(entry.statusText) +
                '</span>'
              )
            : ""
        ) +
      '</span>' +

      (
        entry.badge
          ? (
              '<b class="more-home-card__badge more-home-card__badge--' +
                escapeHtml(entry.badgeTone ?? "danger") +
              '">' +
                escapeHtml(entry.badge) +
              '</b>'
            )
          : ""
      ) +

      (
        entry.state === "locked"
          ? (
              '<span class="more-home-card__lock">' +
                '▣ ' +
                escapeHtml(entry.lockText ?? "暂未解锁") +
              '</span>'
            )
          : (
              '<span class="more-home-card__arrow" aria-hidden="true">›</span>'
            )
      ) +

    '</button>'
  );
}


function renderSection(group) {
  return (
    '<section class="more-home-section more-home-section--' +
      escapeHtml(group.id) +
    '">' +

      '<header>' +
        '<div>' +
          '<span class="more-home-section__mark" aria-hidden="true"></span>' +
          '<span class="more-home-section__icon" aria-hidden="true">' +
            escapeHtml(group.icon) +
          '</span>' +
          '<strong>' +
            escapeHtml(group.title) +
          '</strong>' +
        '</div>' +
        '<small>' +
          escapeHtml(group.subtitle) +
          ' ›' +
        '</small>' +
      '</header>' +

      '<div class="more-home-section__grid more-home-section__grid--' +
        group.entries.length +
      '">' +
        group.entries
          .map(renderEntry)
          .join("") +
      '</div>' +

    '</section>'
  );
}


class MoreHubView {
  constructor({
    pageSystem = moreHubPageSystem
  } = {}) {
    this.pageSystem = pageSystem;
    this.root = null;
    this.restaurantId = null;
    this.onNavigate = null;
  }


  mount(
    root,
    {
      restaurantId,
      onNavigate = null
    } = {}
  ) {
    this.root = root;
    this.restaurantId = restaurantId;
    this.onNavigate = onNavigate;
    return this.render();
  }


  renderMarkup(page) {
    return (
      '<main class="rg-screen more-home-screen">' +

        renderGameTopBar(
          page.topBar,
          {
            subtitle: "集团视角",
            showSpeedControls: true
          }
        ) +

        '<section class="more-home-hero">' +
          '<div>' +
            '<h1>更多</h1>' +
            '<p>用美食连接更多可能<br>让小馆走得更远</p>' +
          '</div>' +

          '<div class="more-home-hero__sign more-home-hero__sign--left">' +
            '用一餐美食<br>创造更美好的生活 ♡' +
          '</div>' +

          '<div class="more-home-hero__sign more-home-hero__sign--right">' +
            '好味道<br>会去更远的地方 ♡' +
          '</div>' +
        '</section>' +

        '<div class="more-home-content">' +
          (page.groups ?? [])
            .map(renderSection)
            .join("") +

          '<section class="more-home-banner">' +
            '<strong>和更多人一起<br>把美食带去更多地方 ♡</strong>' +
            '<span>美食让生活<br>更有温度 ♡</span>' +
          '</section>' +
        '</div>' +

        renderBottomNavigation(
          gameChromeSystem.getNavigation({
            restaurantId: page.restaurantId,
            activePageId: "more"
          })
        ) +

      '</main>'
    );
  }


  render() {
    const page =
      this.pageSystem.getPage(
        this.restaurantId
      );

    this.root.innerHTML =
      this.renderMarkup(
        page
      );

    return page;
  }


  bind() {}


  destroy() {
    this.root = null;
  }
}


export const moreHubView =
  new MoreHubView();


export {
  MoreHubView
};
