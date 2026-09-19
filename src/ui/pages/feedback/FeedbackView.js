import {
  feedbackPageSystem
} from "./FeedbackPageSystem.js";

import {
  gameChromeSystem
} from "../../components/GameChromeSystem.js";

import {
  renderBottomNavigation
} from "../../components/GameChromeView.js";


function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}


class FeedbackView {
  constructor({
    pageSystem =
      feedbackPageSystem
  } = {}) {
    this.pageSystem =
      pageSystem;

    this.root =
      null;

    this.restaurantId =
      null;

    this.onNavigate =
      null;

    this.message =
      "";

    this.exportText =
      "";
  }


  mount(
    root,
    {
      restaurantId,
      onNavigate = null
    } = {}
  ) {
    this.root =
      root;

    this.restaurantId =
      restaurantId;

    this.onNavigate =
      onNavigate;

    return this.render();
  }


  renderMarkup(page) {
    return [
      '<main class="rg-screen feedback-page">',

      '<header class="feedback-page__header">',
      "<h1>测试反馈</h1>",
      "<p>",
      esc(page.releaseLabel),
      "</p>",
      "</header>",

      this.message
        ? '<p class="feedback-page__message">' +
          esc(this.message) +
          "</p>"
        : "",

      '<section class="feedback-page__summary">',
      "<article><span>已记录</span><strong>",
      page.summary.count,
      "</strong></article>",
      "<article><span>平均评分</span><strong>",
      page.summary.averageRating ??
        "-",
      "</strong></article>",
      "<article><span>构建通道</span><strong>",
      esc(page.release.channel),
      "</strong></article>",
      "</section>",

      '<section class="feedback-page__panel">',
      "<h2>提交反馈</h2>",
      '<label>类型<select data-feedback-category>',
      page.categories
        .map(
          item =>
            '<option value="' +
            esc(item.id) +
            '">' +
            esc(item.name) +
            "</option>"
        )
        .join(""),
      "</select></label>",

      '<label>评分<select data-feedback-rating>',
      [5,4,3,2,1]
        .map(
          value =>
            '<option value="' +
            value +
            '">' +
            value +
            " / 5</option>"
        )
        .join(""),
      "</select></label>",

      '<label>反馈内容<textarea data-feedback-message maxlength="1000" placeholder="请描述遇到的问题、操作步骤或建议"></textarea></label>',

      '<button type="button" data-feedback-action="submit">保存反馈</button>',
      "<p>反馈会保存在本机，并附带版本、游戏时间、门店等级和实体数量等诊断信息；不会自动上传网络。</p>",
      "</section>",

      '<section class="feedback-page__panel">',
      "<h2>反馈报告</h2>",
      '<div class="feedback-page__actions">',
      '<button type="button" data-feedback-action="export">生成报告</button>',
      '<button type="button" data-feedback-action="copy">复制报告</button>',
      '<button type="button" data-feedback-action="clear">清空本机反馈</button>',
      "</div>",
      this.exportText
        ? '<textarea class="feedback-page__export" readonly>' +
          esc(this.exportText) +
          "</textarea>"
        : "",
      "</section>",

      '<section class="feedback-page__panel">',
      "<h2>最近反馈</h2>",
      page.recent.length
        ? page.recent
            .map(
              item => [
                '<article class="feedback-page__item">',
                "<strong>",
                esc(
                  page.categories
                    .find(
                      category =>
                        category.id ===
                        item.category
                    )?.name ??
                  item.category
                ),
                " · ",
                item.rating,
                "/5</strong>",
                "<p>",
                esc(item.message),
                "</p>",
                "<small>",
                esc(item.createdAt),
                "</small>",
                "</article>"
              ].join("")
            )
            .join("")
        : "<p>当前还没有本机反馈记录。</p>",
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
      .querySelector(
        '[data-feedback-action="submit"]'
      )
      ?.addEventListener(
        "click",
        () => {
          try {
            const category =
              this.root
                .querySelector(
                  "[data-feedback-category]"
                )
                ?.value;

            const rating =
              Number(
                this.root
                  .querySelector(
                    "[data-feedback-rating]"
                  )
                  ?.value
              );

            const message =
              this.root
                .querySelector(
                  "[data-feedback-message]"
                )
                ?.value ??
              "";

            this.pageSystem
              .submit(
                this.restaurantId,
                {
                  category,
                  rating,
                  message
                }
              );

            this.message =
              "反馈已保存在本机。";

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
        '[data-feedback-action="export"]'
      )
      ?.addEventListener(
        "click",
        () => {
          this.exportText =
            this.pageSystem
              .exportReport();

          this.message =
            "反馈报告已生成。";

          this.render();
        }
      );


    this.root
      .querySelector(
        '[data-feedback-action="copy"]'
      )
      ?.addEventListener(
        "click",
        async () => {
          this.exportText =
            this.pageSystem
              .exportReport();

          try {
            if (
              globalThis.navigator
                ?.clipboard
                ?.writeText
            ) {
              await globalThis
                .navigator
                .clipboard
                .writeText(
                  this.exportText
                );

              this.message =
                "反馈报告已复制。";
            } else {
              this.message =
                "当前环境不支持自动复制，报告已显示在下方。";
            }
          } catch {
            this.message =
              "自动复制失败，报告已显示在下方。";
          }

          this.render();
        }
      );


    this.root
      .querySelector(
        '[data-feedback-action="clear"]'
      )
      ?.addEventListener(
        "click",
        () => {
          const confirmed =
            typeof globalThis
              .confirm ===
              "function"
              ? globalThis
                  .confirm(
                    "确定清空本机全部反馈记录？"
                  )
              : true;

          if (!confirmed) {
            return;
          }

          this.pageSystem
            .clear();

          this.exportText =
            "";

          this.message =
            "本机反馈已清空。";

          this.render();
        }
      );
  }


  destroy() {
    this.root =
      null;

    this.onNavigate =
      null;
  }
}


export const feedbackView =
  new FeedbackView();


export {
  FeedbackView
};
