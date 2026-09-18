import {
  storeProgressPageSystem
} from "./StoreProgressPageSystem.js";


function percent(
  value
) {
  return Math.round(
    Math.max(
      0,
      Math.min(
        1,
        Number(value) ||
        0
      )
    ) *
    100
  );
}


class StoreProgressView {
  constructor({
    pageSystem =
      storeProgressPageSystem
  } = {}) {
    this.pageSystem =
      pageSystem;

    this.root =
      null;

    this.restaurantId =
      null;

    this.onNavigate =
      null;
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


  renderMarkup(
    page
  ) {
    return `
      <main class="store-progress">

        <header class="store-progress__header">

          <div>
            <span>
              门店成长
            </span>

            <h1>
              Lv.${page.restaurant.level}
              ${page.progress.title ?? ""}
              ·
              ${page.restaurant.name}
            </h1>
          </div>

          <strong>
            ${page.restaurant.experience}
            经验
          </strong>

        </header>


        <section class="store-progress__next">

          <h2>
            ${page.progress.maxLevel
              ? "已达到当前最高等级"
              : `距离 Lv.${page.progress.nextLevel}`
            }
          </h2>

          ${page.progress.maxLevel
            ? `
              <p>
                当前成长线已全部完成。
              </p>
            `
            : `
              <progress
                max="100"
                value="${percent(
                  page.progress.progress
                )}"
              ></progress>

              <p>
                还需
                ${page.progress.remainingExperience}
                经验
              </p>

              <div>
                ${page.next
                  ?.unlockItems
                  .map(
                    item => `
                      <span>
                        Lv.${page.next.level}
                        解锁：
                        ${item.name}
                      </span>
                    `
                  )
                  .join("") ??
                  ""
                }

                ${page.nextReward
                  ?.limitIncrease
                  ? `
                    <span>
                      升级容量：
                      员工+${page.nextReward.limitIncrease.employees}
                      · 菜品+${page.nextReward.limitIncrease.menuItems}
                      · 餐桌+${page.nextReward.limitIncrease.tables}
                      · 厨房工位+${page.nextReward.limitIncrease.kitchenStations}
                    </span>
                  `
                  : ""
                }
              </div>
            `
          }

        </section>


        <section class="store-progress__limits">

          <h2>
            当前经营上限
          </h2>

          <div>
            <article>
              <span>员工</span>
              <strong>
                ${page.currentLimits.employees}
              </strong>
            </article>

            <article>
              <span>菜单菜品</span>
              <strong>
                ${page.currentLimits.menuItems}
              </strong>
            </article>

            <article>
              <span>餐桌</span>
              <strong>
                ${page.currentLimits.tables}
              </strong>
            </article>

            <article>
              <span>厨房工位</span>
              <strong>
                ${page.currentLimits.kitchenStations}
              </strong>
            </article>
          </div>

        </section>


        <section class="store-progress__experience">
          <h2>
            经验来源
          </h2>

          <p>
            每完成1单获得
            ${page.experiencePolicy.orderExperience}
            经验；
            每
            ${page.experiencePolicy.revenueUnit}
            营业额获得
            ${page.experiencePolicy.revenueExperience}
            经验。
          </p>
        </section>


        <section class="store-progress__unlocks">

          <h2>
            已解锁功能
          </h2>

          <div>
            ${page.unlockedFeatures
              .map(
                item => `
                  <span>
                    ${item.name}
                  </span>
                `
              )
              .join("")}
          </div>

        </section>


        <section class="store-progress__roadmap">

          <h2>
            成长路线
          </h2>

          ${page.levels
            .map(
              level => `
                <article
                  data-level-state="${level.state}"
                >

                  <header>
                    <strong>
                      Lv.${level.level}
                      ·
                      ${level.title ?? ""}
                    </strong>

                    <span>
                      ${level.requiredExperience}
                      经验
                    </span>
                  </header>

                  <div>
                    <small>
                      员工
                      ${level.limits.employees}
                    </small>

                    <small>
                      菜品
                      ${level.limits.menuItems}
                    </small>

                    <small>
                      餐桌
                      ${level.limits.tables}
                    </small>

                    <small>
                      厨房工位
                      ${level.limits.kitchenStations}
                    </small>
                  </div>

                  <footer>
                    ${level.unlockItems
                      .map(
                        item => `
                          <span>
                            ${item.unlocked
                              ? "已解锁"
                              : "待解锁"
                            }
                            ·
                            ${item.name}
                          </span>
                        `
                      )
                      .join("")}
                  </footer>

                </article>
              `
            )
            .join("")}

        </section>


        <section class="store-progress__milestones">
          <h2>
            升级记录
          </h2>

          ${page.milestones.length
            ? page.milestones
                .map(
                  item => `
                    <article>
                      <strong>
                        Lv.${item.level}
                        ·
                        ${item.title}
                      </strong>

                      <span>
                        第${item.reachedDay}天达成
                      </span>
                    </article>
                  `
                )
                .join("")
            : "<p>尚无升级记录。</p>"
          }
        </section>


        <nav>
          <button
            type="button"
            data-page-target="more-home"
          >
            返回更多
          </button>
        </nav>

      </main>
    `;
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
    this.root =
      null;
  }
}


export const storeProgressView =
  new StoreProgressView();


export {
  StoreProgressView
};
