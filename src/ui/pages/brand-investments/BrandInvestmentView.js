import {
  brandInvestmentPageSystem
} from "./BrandInvestmentPageSystem.js";

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
    ).toLocaleString(
      "zh-CN"
    );
}


class BrandInvestmentView {
  constructor({
    pageSystem =
      brandInvestmentPageSystem
  } = {}) {
    this.pageSystem =
      pageSystem;

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


  renderProject(
    project
  ) {
    let status = "可建设";

    if (project.owned) {
      status = "已完成";
    } else if (!project.unlocked) {
      status =
        "Lv." +
        project.requiredLevel +
        " 解锁";
    } else if (!project.affordable) {
      status = "资金不足";
    }

    return [
      '<article class="brand-investment__project">',
      "<header>",
      "<strong>",
      esc(project.name),
      "</strong>",
      "<span>Lv.",
      project.requiredLevel,
      "</span>",
      "</header>",
      "<p>",
      esc(project.description),
      "</p>",
      "<small>投入 ",
      money(project.cost),
      "</small>",
      '<button type="button" data-investment-id="',
      esc(project.id),
      '"',
      (
        project.owned ||
        !project.unlocked ||
        !project.affordable
      )
        ? " disabled"
        : "",
      ">",
      status,
      "</button>",
      "</article>"
    ].join("");
  }


  renderMarkup(page) {
    const chrome =
      buildFormalPageChrome(
        page.restaurantId ??
        this.restaurantId
      );

    return [
      '<main class="rg-screen brand-investment-page">',

      renderGameTopBar(
        chrome.topBar,
        {
          subtitle:
            "品牌 · CRM · 冷链 · 总部"
        }
      ),

      renderNoticeTicker(
        chrome.noticeTicker
      ),

      renderPageTitle({
        title:
          "长期品牌基建",
        subtitle:
          esc(page.brandName ?? page.restaurant.name) +
          " · 总部 Lv." +
          page.level,
        backTarget:
          "more-home"
      }),

      '<section class="brand-investment">',

      this.message
        ? '<p class="brand-investment__message">' +
          esc(this.message) +
          "</p>"
        : "",

      '<section class="brand-investment__summary">',
      "<article><span>可用资金</span><strong>",
      money(page.balance),
      "</strong></article>",
      "<article><span>累计长期投入</span><strong>",
      money(page.totalInvested),
      "</strong></article>",
      "</section>",

      '<section class="brand-investment__projects">',
      page.projects
        .map(
          project =>
            this.renderProject(
              project
            )
        )
        .join(""),
      "</section>",

      '<section class="brand-investment__panel">',
      "<h2>当前长期效果</h2>",
      "<p>熟客识别加成 ",
      Math.round(
        (
          page.modifiers
            .customerRecognitionRateBonus ??
          0
        ) *
        100
      ),
      "%</p>",
      "<p>熟客容量 +",
      page.modifiers
        .recognizedCustomerCapacityBonus ??
        0,
      "/客群</p>",
      "<p>中央厨房保鲜 ×",
      Number(
        page.modifiers
          .centralKitchenShelfLifeMultiplier ??
        1
      ).toFixed(2),
      "</p>",
      "<p>新区进入成本 ×",
      Number(
        page.modifiers
          .regionUnlockCostMultiplier ??
        1
      ).toFixed(2),
      "</p>",
      "</section>",

      "</section>",

      renderBottomNavigation(
        gameChromeSystem
          .getNavigation({
            restaurantId:
              page.restaurantId,
            activePageId:
              "more"
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
      .querySelectorAll(
        "[data-investment-id]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              try {
                this.pageSystem
                  .purchase(
                    this.restaurantId,
                    button.dataset
                      .investmentId
                  );

                this.message =
                  "长期品牌基建已完成。";

                this.render();
              } catch (error) {
                this.message =
                  error.message;

                this.render();
              }
            }
          );
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


export const brandInvestmentView =
  new BrandInvestmentView();


export {
  BrandInvestmentView
};
