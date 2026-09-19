import {
  leaseManagementPageSystem
} from "./LeaseManagementPageSystem.js";

import {
  gameChromeSystem
} from "../../components/GameChromeSystem.js";

import {
  buildFormalPageChrome
} from "../../components/FormalPageChromeModel.js";

import {
  renderGameTopBar,
  renderNoticeTicker,
  renderPageTitle,
  renderBottomNavigation
} from "../../components/GameChromeView.js";


function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}


function money(value) {
  return "¥" +
    Math.round(
      Number(value) || 0
    ).toLocaleString("zh-CN");
}


class LeaseManagementView {
  constructor({
    pageSystem =
      leaseManagementPageSystem
  } = {}) {
    this.pageSystem = pageSystem;
    this.root = null;
    this.restaurantId = null;
    this.onNavigate = null;
    this.message = "";
  }


  mount(
    root,
    {
      restaurantId,
      onNavigate = null
    } = {}
  ) {
    this.root = root;
    this.restaurantId =
      restaurantId;
    this.onNavigate =
      onNavigate;

    return this.render();
  }


  renderActiveLease(page) {
    const renewal =
      page.renewalQuote
        ? [
            '<section class="lease-page__panel">',
            "<h2>续租12个月</h2>",
            "<p>当前月租 " +
              money(
                page.renewalQuote
                  .currentMonthlyRent
              ) +
              " → 新月租 " +
              money(
                page.renewalQuote
                  .monthlyRent
              ) +
              "</p>",
            "<p>租金调整 " +
              Math.round(
                page.renewalQuote
                  .increaseRate *
                100
              ) +
              "%</p>",
            '<button type="button" data-lease-action="renew">确认续租</button>',
            "</section>"
          ].join("")
        : "";

    return [
      '<section class="lease-page__summary">',
      "<article><span>当前铺位</span><strong>" +
        esc(page.property.name) +
        "</strong></article>",
      "<article><span>月租</span><strong>" +
        money(page.lease.monthlyRent) +
        "</strong></article>",
      "<article><span>剩余租期</span><strong>" +
        page.daysRemaining +
        "天</strong></article>",
      "<article><span>租赁欠款</span><strong>" +
        money(page.totalArrears) +
        "</strong></article>",
      "</section>",

      '<section class="lease-page__panel">',
      "<h2>当前合同</h2>",
      "<p>押金 " +
        money(page.lease.deposit) +
        "</p>",
      "<p>下次租金：" +
        (
          page.nextRentInDays ===
            null
            ? "无"
            : page.nextRentInDays +
              "天后"
        ) +
        "</p>",
      "<p>下次物业费：" +
        (
          page.nextPropertyFeeInDays ===
            null
            ? "无"
            : page.nextPropertyFeeInDays +
              "天后"
        ) +
        "</p>",
      "<p>续租次数 " +
        (page.lease.renewalCount ?? 0) +
        "</p>",
      "</section>",

      renewal,

      '<section class="lease-page__panel lease-page__panel--danger">',
      "<h2>结束租约</h2>",
      "<p>提前结束后门店会失去当前经营地址；押金会先抵扣租赁欠款，再退回剩余部分。</p>",
      '<button type="button" data-lease-action="terminate">结束当前租约</button>',
      "</section>"
    ].join("");
  }


  renderNoLease() {
    return [
      '<section class="lease-page__panel">',
      "<h2>当前没有有效租约</h2>",
      "<p>需要先选择可经营铺位并签约，才能装修和营业。</p>",
      '<button type="button" data-page-target="properties">前往城市房源</button>',
      "</section>"
    ].join("");
  }


  renderMarkup(page) {
    const chrome =
      buildFormalPageChrome(
        page.restaurantId ??
        this.restaurantId
      );

    return [
      '<main class="rg-screen lease-page">',
      renderGameTopBar(
        chrome.topBar,
        {
          subtitle:
            "租金 · 押金 · 续租"
        }
      ),
      renderNoticeTicker(
        chrome.noticeTicker
      ),
      renderPageTitle({
        title:
          "租约管理",
        subtitle:
          esc(page.restaurant.name) +
          " · 可用资金 " +
          money(page.balance),
        backTarget:
          "more-home"
      }),

      this.message
        ? '<p class="lease-page__message">' +
          esc(this.message) +
          "</p>"
        : "",

      page.hasLease
        ? this.renderActiveLease(
            page
          )
        : this.renderNoLease(),

      renderBottomNavigation(
        gameChromeSystem
          .getNavigation({
            restaurantId:
              page.restaurantId,
            activePageId:
              "restaurant"
          })
      ),

      "</main>"
    ].join("");
  }


  render() {
    const page =
      this.pageSystem
        .getPage(
          this.restaurantId
        );

    this.root.innerHTML =
      this.renderMarkup(
        page
      );

    this.bind();

    return page;
  }


  bind() {
    this.root
      .querySelector(
        '[data-lease-action="renew"]'
      )
      ?.addEventListener(
        "click",
        () => {
          try {
            this.pageSystem
              .renew(
                this.restaurantId,
                12
              );

            this.message =
              "续租已完成。";

            this.render();
          } catch (error) {
            this.message =
              error.message;

            this.render();
          }
        }
      );


    this.root
      .querySelector(
        '[data-lease-action="terminate"]'
      )
      ?.addEventListener(
        "click",
        () => {
          const confirmed =
            typeof globalThis
              .confirm ===
              "function"
              ? globalThis.confirm(
                  "结束租约后门店将失去当前经营地址，是否继续？"
                )
              : true;

          if (!confirmed) {
            return;
          }

          try {
            this.pageSystem
              .terminate(
                this.restaurantId
              );

            this.message =
              "当前租约已结束。";

            this.render();
          } catch (error) {
            this.message =
              error.message;

            this.render();
          }
        }
      );


    this.root
      .querySelectorAll(
        "[data-page-target]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.onNavigate?.(
                button.dataset
                  .pageTarget,
                this.restaurantId
              );
            }
          );
        }
      );
  }


  destroy() {
    this.root = null;
    this.onNavigate = null;
  }
}


export const leaseManagementView =
  new LeaseManagementView();


export {
  LeaseManagementView
};
