import {
  settingsPageSystem
} from "./SettingsPageSystem.js";

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


class SettingsView {
  constructor({
    pageSystem =
      settingsPageSystem
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


  renderMarkup(page) {
    const speedButtons =
      [1, 2, 4]
        .map(
          speed => [
            '<button type="button" data-settings-speed="',
            speed,
            '"',
            (
              !page.runtime.paused &&
              page.runtime.speed === speed
            )
              ? ' class="is-active"'
              : "",
            ">",
            speed,
            "×</button>"
          ].join("")
        )
        .join("");

    return [
      '<main class="rg-screen settings-page">',

      '<header class="settings-page__header">',
      "<h1>设置</h1>",
      "<p>",
      esc(page.restaurant.name),
      " · 第",
      page.time.day,
      "日 ",
      String(page.time.hour).padStart(2, "0"),
      ":",
      String(page.time.minute).padStart(2, "0"),
      "</p>",
      "</header>",

      this.message
        ? '<p class="settings-page__message">' +
          esc(this.message) +
          "</p>"
        : "",

      '<section class="settings-page__panel">',
      "<h2>运行速度</h2>",
      "<p>",
      page.runtime.paused
        ? "当前已暂停"
        : "当前 " +
          page.runtime.speed +
          "× 运行",
      "</p>",
      '<div class="settings-page__buttons">',
      '<button type="button" data-settings-action="pause">',
      page.runtime.paused
        ? "继续运行"
        : "暂停",
      "</button>",
      speedButtons,
      "</div>",
      "</section>",

      '<section class="settings-page__panel">',
      "<h2>存档</h2>",
      "<p>",
      page.save.exists
        ? "自动存档槽已有存档"
        : "自动存档槽暂无存档",
      "</p>",
      '<div class="settings-page__buttons">',
      '<button type="button" data-settings-action="save">立即保存</button>',
      '<button type="button" data-settings-action="load"',
      page.save.exists
        ? ""
        : " disabled",
      ">读取自动存档</button>",
      "</div>",
      "</section>",

      '<section class="settings-page__panel">',
      "<h2>说明</h2>",
      "<p>这里仅提供已经真正接入运行时的控制项；未实现的音效、画质等选项不会用假开关占位。</p>",
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
        '[data-settings-action="pause"]'
      )
      ?.addEventListener(
        "click",
        () => {
          this.pageSystem
            .togglePause();

          this.render();
        }
      );


    this.root
      .querySelectorAll(
        "[data-settings-speed]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.pageSystem
                .setSpeed(
                  Number(
                    button.dataset
                      .settingsSpeed
                  )
                );

              this.render();
            }
          );
        }
      );


    this.root
      .querySelector(
        '[data-settings-action="save"]'
      )
      ?.addEventListener(
        "click",
        () => {
          try {
            this.pageSystem
              .saveNow();

            this.message =
              "存档已保存。";

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
        '[data-settings-action="load"]'
      )
      ?.addEventListener(
        "click",
        () => {
          try {
            this.pageSystem
              .loadNow();

            this.message =
              "存档已读取。";

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


export const settingsView =
  new SettingsView();


export {
  SettingsView
};
