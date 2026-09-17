import {
  propertyDetailDashboardSystem
} from "./PropertyDetailDashboardSystem.js";


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
  if (
    value ===
      null ||
    value ===
      undefined
  ) {
    return "--";
  }

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


function renderSlot(
  id,
  label
) {
  return `
    <div
      class="property-media-slot"
      data-image-slot="${escapeHtml(
        id
      )}"
    >
      <div>
        <span>▣</span>

        <strong>
          ${escapeHtml(
            label
          )}
        </strong>

        <small>
          图片槽位
        </small>
      </div>
    </div>
  `;
}


function pointsString(
  floor
) {
  const polygon =
    floor?.polygon ??
    [];

  if (
    polygon.length <
    3
  ) {
    return "";
  }

  return polygon
    .map(
      point =>
        `${Number(point.x) || 0},${Number(point.y) || 0}`
    )
    .join(" ");
}


function markerCircle(
  item,
  className
) {
  if (
    !Number.isFinite(
      item?.x
    ) ||
    !Number.isFinite(
      item?.y
    )
  ) {
    return "";
  }

  return `
    <circle
      class="${className}"
      cx="${item.x}"
      cy="${item.y}"
      r="0.38"
    ></circle>
  `;
}


class PropertyDetailView {
  constructor({
    root,
    restaurantId = null,
    propertyId,
    pageSystem =
      propertyDetailDashboardSystem,

    onNavigate = null
  }) {
    if (!root) {
      throw new Error(
        "PropertyDetailView requires a root element"
      );
    }

    if (!propertyId) {
      throw new Error(
        "PropertyDetailView requires propertyId"
      );
    }

    this.root =
      root;

    this.restaurantId =
      restaurantId;

    this.propertyId =
      propertyId;

    this.pageSystem =
      pageSystem;

    this.onNavigate =
      onNavigate;

    this.months =
      12;

    this.offerId =
      null;

    this.mediaTab =
      "exterior";

    this.floorId =
      null;

    this.message =
      "";

    this.page =
      null;

    this.boundClick =
      event =>
        this.handleClick(
          event
        );
  }


  mount() {
    this.root
      .addEventListener(
        "click",
        this.boundClick
      );

    this.refresh();

    return this;
  }


  destroy() {
    this.root
      .removeEventListener(
        "click",
        this.boundClick
      );

    this.root.innerHTML =
      "";
  }


  refresh() {
    this.page =
      this.pageSystem
        .getPage(
          this.propertyId,
          this.restaurantId,
          this.months,
          this.offerId
        );

    if (
      !this.floorId
    ) {
      this.floorId =
        this.page.layout
          ?.floors?.[0]
          ?.id ??
        null;
    }

    this.render();

    return this.page;
  }


  getActiveFloor() {
    return (
      this.page.layout
        ?.floors
        ?.find(
          floor =>
            floor.id ===
            this.floorId
        ) ??
      this.page.layout
        ?.floors?.[0] ??
      null
    );
  }


  renderTopbar(
    page
  ) {
    const top =
      page.topBar;

    return `
      <header class="property-detail-hud">

        <div>
          <strong>
            ${escapeHtml(
              top.restaurantName
            )}
          </strong>

          <span>
            房源考察中心
          </span>
        </div>

        <section>
          <span>
            第${top.day}天
          </span>

          <strong>
            ${String(
              top.hour
            ).padStart(
              2,
              "0"
            )}:${String(
              top.minute
            ).padStart(
              2,
              "0"
            )}
          </strong>
        </section>

        <section>
          <span>
            当前资金
          </span>

          <strong>
            ${money(
              top.balance
            )}
          </strong>
        </section>

        <section>
          <span>
            门店等级
          </span>

          <strong>
            Lv.${top.level}
          </strong>

          <small>
            声望${top.reputation}
          </small>
        </section>

      </header>
    `;
  }


  renderTitle(
    page
  ) {
    return `
      <section class="property-detail-title">

        <button
          type="button"
          data-action="back"
        >
          ‹ 返回房源
        </button>

        <div>
          <span>
            ${escapeHtml(
              page.property
                .districtName
            )}
          </span>

          <strong>
            ${escapeHtml(
              page.property
                .name
            )}
          </strong>
        </div>

        <b>
          ${
            page.property
              .qualityScore !==
              null &&
            page.property
              .qualityScore !==
              undefined
              ? `★ ${page.property.qualityScore}`
              : "房源考察"
          }
        </b>

      </section>
    `;
  }


  renderMedia(
    page
  ) {
    const active =
      page.media.tabs
        .find(
          item =>
            item.id ===
            this.mediaTab
        ) ??
      page.media.tabs[0];

    return `
      <section class="property-media-panel">

        <nav class="property-media-tabs">

          ${
            page.media.tabs
              .map(
                tab => `
                  <button
                    type="button"
                    class="${
                      tab.id ===
                      this.mediaTab
                        ? "is-active"
                        : ""
                    }"
                    data-action="media"
                    data-media-id="${tab.id}"
                  >
                    ${escapeHtml(
                      tab.label
                    )}
                  </button>
                `
              )
              .join("")
          }

        </nav>


        ${
          this.mediaTab ===
          "floorplan"
            ? this.renderFloorplan(
                page
              )
            : renderSlot(
                active.slot,
                active.label
              )
        }

      </section>
    `;
  }


  renderFloorplan(
    page
  ) {
    const floor =
      this.getActiveFloor();

    if (!floor) {
      return `
        <div class="property-floor-empty">
          当前房源没有户型数据
        </div>
      `;
    }

    const width =
      Math.max(
        1,
        floor.width ??
        10
      );

    const height =
      Math.max(
        1,
        floor.height ??
        10
      );

    return `
      <section class="property-floor-area">

        <nav class="property-floor-tabs">

          ${
            page.floorTabs
              .map(
                item => `
                  <button
                    type="button"
                    class="${
                      item.id ===
                      floor.id
                        ? "is-active"
                        : ""
                    }"
                    data-action="floor"
                    data-floor-id="${escapeHtml(
                      item.id
                    )}"
                  >
                    <strong>
                      ${escapeHtml(
                        item.label
                      )}
                    </strong>

                    <span>
                      ${item.usableArea}㎡
                    </span>
                  </button>
                `
              )
              .join("")
          }

        </nav>


        <div class="property-floor-svg-wrap">

          <svg
            class="property-floor-svg"
            viewBox="0 0 ${width} ${height}"
            preserveAspectRatio="xMidYMid meet"
          >

            <polygon
              class="property-floor-shell"
              points="${pointsString(
                floor
              )}"
            ></polygon>

            ${
              (
                floor.windows ??
                []
              ).map(
                item =>
                  markerCircle(
                    item,
                    "property-floor-window"
                  )
              ).join("")
            }

            ${
              (
                floor.entrances ??
                []
              ).map(
                item =>
                  markerCircle(
                    item,
                    "property-floor-entrance"
                  )
              ).join("")
            }

            ${
              (
                floor.columns ??
                []
              ).map(
                item =>
                  markerCircle(
                    item,
                    "property-floor-column"
                  )
              ).join("")
            }

            ${
              (
                floor.utilityPoints ??
                []
              ).map(
                item =>
                  markerCircle(
                    item,
                    "property-floor-utility"
                  )
              ).join("")
            }

          </svg>


          <div
            class="property-floor-overlay-slot"
            data-image-slot="property-floorplan-overlay-${escapeHtml(
              floor.id
            )}"
          >
            户型装饰覆盖层槽位
          </div>

        </div>


        <div class="property-floor-legend">

          <span class="is-entry">
            ● 入口
          </span>

          <span class="is-window">
            ● 窗户
          </span>

          <span class="is-column">
            ● 柱体
          </span>

          <span class="is-utility">
            ● 水电燃气点位
          </span>

        </div>

      </section>
    `;
  }


  renderBasicInfo(
    page
  ) {
    const p =
      page.property;

    return `
      <section class="property-info-grid">

        <article>
          <span>
            建筑面积
          </span>
          <strong>
            ${p.area}㎡
          </strong>
        </article>

        <article>
          <span>
            可用面积
          </span>
          <strong>
            ${p.usableArea}㎡
          </strong>
        </article>

        <article>
          <span>
            楼层
          </span>
          <strong>
            ${p.floorCount}层
          </strong>
        </article>

        <article>
          <span>
            门面
          </span>
          <strong>
            ${
              p.frontageMeters ??
              "--"
            }m
          </strong>
        </article>

        <article>
          <span>
            层高
          </span>
          <strong>
            ${
              p.ceilingHeight ??
              "--"
            }m
          </strong>
        </article>

        <article>
          <span>
            停车位
          </span>
          <strong>
            ${
              p.parkingSpaces ??
              0
            }个
          </strong>
        </article>

      </section>
    `;
  }


  renderStructures(
    page
  ) {
    const s =
      page.structures;

    return `
      <section class="property-panel">

        <header>
          <strong>
            房屋结构
          </strong>

          <span>
            来自真实房源户型数据
          </span>
        </header>


        <div class="property-structure-grid">

          <article>
            <strong>
              ${s.entrances}
            </strong>
            <span>
              出入口
            </span>
          </article>

          <article>
            <strong>
              ${s.windows}
            </strong>
            <span>
              窗户
            </span>
          </article>

          <article>
            <strong>
              ${s.columns}
            </strong>
            <span>
              柱体
            </span>
          </article>

          <article>
            <strong>
              ${s.fixedStructures}
            </strong>
            <span>
              固定结构
            </span>
          </article>

          <article>
            <strong>
              ${s.utilityPoints}
            </strong>
            <span>
              基础点位
            </span>
          </article>

          <article>
            <strong>
              ${s.stairs}
            </strong>
            <span>
              楼梯
            </span>
          </article>

          <article>
            <strong>
              ${s.elevators}
            </strong>
            <span>
              电梯
            </span>
          </article>

        </div>

      </section>
    `;
  }


  renderFacilities(
    page
  ) {
    return `
      <section class="property-panel">

        <header>
          <strong>
            餐饮经营条件
          </strong>

          <span>
            没有底层记录的数据不会伪造
          </span>
        </header>


        <div class="property-facility-grid">

          ${
            page.facilities
              .map(
                item => `
                  <article
                    class="
                      property-facility
                      is-${item.state}
                    "
                  >
                    <span>
                      ${escapeHtml(
                        item.label
                      )}
                    </span>

                    <strong>
                      ${escapeHtml(
                        item.value
                      )}
                    </strong>
                  </article>
                `
              )
              .join("")
          }

        </div>

      </section>
    `;
  }


  renderAssessment(
    page
  ) {
    const a =
      page.assessment;

    return `
      <section class="property-panel">

        <header>
          <strong>
            经营适配评估
          </strong>

          <span>
            不直接预测虚假的营业收入
          </span>
        </header>


        <div class="property-assessment">

          <div class="property-assessment-score">

            <strong>
              ${a.score}
            </strong>

            <span>
              ${a.level}
            </span>

          </div>


          <div class="property-assessment-bars">

            <article>
              <span>
                客流
              </span>

              <div>
                <i
                  style="
                    width:${a.traffic}%;
                  "
                ></i>
              </div>

              <strong>
                ${a.traffic}
              </strong>
            </article>

            <article>
              <span>
                消费力
              </span>

              <div>
                <i
                  style="
                    width:${a.spending}%;
                  "
                ></i>
              </div>

              <strong>
                ${a.spending}
              </strong>
            </article>

            <article>
              <span>
                竞争
              </span>

              <div>
                <i
                  style="
                    width:${a.competition}%;
                  "
                ></i>
              </div>

              <strong>
                ${a.competition}
              </strong>
            </article>

          </div>


          <div class="property-rent-efficiency">

            <span>
              单位面积月租
            </span>

            <strong>
              ${
                a.rentPerSqm ===
                null
                  ? "--"
                  : `${money(
                      a.rentPerSqm
                    )}/㎡`
              }
            </strong>

          </div>

        </div>

      </section>
    `;
  }


  renderRisks(
    page
  ) {
    return `
      <section class="property-panel">

        <header>
          <strong>
            风险提示
          </strong>

          <span>
            随房源和市场状态动态变化
          </span>
        </header>


        <div class="property-risk-list">

          ${
            page.risks
              .map(
                risk => `
                  <article
                    class="
                      property-risk
                      property-risk--${risk.level}
                    "
                  >

                    <span>
                      ${
                        risk.level ===
                        "danger"
                          ? "!"
                          : risk.level ===
                            "warning"
                            ? "△"
                            : "✓"
                      }
                    </span>

                    <div>
                      <strong>
                        ${escapeHtml(
                          risk.title
                        )}
                      </strong>

                      <small>
                        ${escapeHtml(
                          risk.description
                        )}
                      </small>
                    </div>

                  </article>
                `
              )
              .join("")
          }

        </div>

      </section>
    `;
  }


  renderLease(
    page
  ) {
    const terms =
      page.leaseTerms;

    const quote =
      page.quote;

    const offer =
      page.activeOffer;

    return `
      <aside class="property-lease-card">

        <header>
          <div>
            <span>
              房东
            </span>

            <strong>
              ${escapeHtml(
                page.landlord
                  ?.name ??
                "业主"
              )}
            </strong>
          </div>

          ${
            terms.negotiable
              ? `
                <b>
                  可议价
                </b>
              `
              : ""
          }

        </header>


        <section class="property-lease-price">

          <span>
            月租
          </span>

          <strong>
            ${money(
              quote.monthlyRent
            )}
          </strong>

          <small>
            挂牌
            ${money(
              quote.askMonthlyRent
            )}
          </small>

        </section>


        <section class="property-lease-details">

          <article>
            <span>
              租期范围
            </span>

            <strong>
              ${terms.minMonths}–${terms.maxMonths}个月
            </strong>
          </article>

          <article>
            <span>
              押金
            </span>

            <strong>
              ${money(
                quote.deposit
              )}
            </strong>
          </article>

          <article>
            <span>
              物业费/月
            </span>

            <strong>
              ${money(
                quote.propertyFeeMonthly
              )}
            </strong>
          </article>

          <article>
            <span>
              转让费
            </span>

            <strong>
              ${money(
                quote.transferFee
              )}
            </strong>
          </article>

          <article>
            <span>
              当前免租
            </span>

            <strong>
              ${quote.rentFreeDays}天
            </strong>
          </article>

          <article>
            <span>
              最大免租空间
            </span>

            <strong>
              ${terms.rentFreeMaxDays ?? 0}天
            </strong>
          </article>

        </section>


        <label class="property-lease-months">

          <span>
            租约月数
          </span>

          <input
            type="number"
            min="${terms.minMonths}"
            max="${terms.maxMonths}"
            step="1"
            value="${quote.months}"
            data-lease-months
          />

          <button
            type="button"
            data-action="apply-months"
          >
            重新报价
          </button>

        </label>


        ${
          terms.negotiable &&
          !offer
            ? `
              <section class="property-negotiate-box">

                <header>
                  自主议价
                </header>

                <label>
                  <span>
                    期望月租
                  </span>

                  <input
                    type="number"
                    min="1"
                    value="${Math.round(
                      quote.askMonthlyRent *
                      0.97
                    )}"
                    data-request-rent
                  />
                </label>

                <label>
                  <span>
                    免租天数
                  </span>

                  <input
                    type="number"
                    min="0"
                    max="${terms.rentFreeMaxDays ?? 0}"
                    value="0"
                    data-request-free-days
                  />
                </label>

                <button
                  type="button"
                  data-action="negotiate"
                >
                  与房东议价
                </button>

              </section>
            `
            : ""
        }


        ${
          offer
            ? `
              <section
                class="
                  property-offer
                  property-offer--${offer.status}
                "
              >

                <span>
                  ${
                    offer.status ===
                    "countered"
                      ? "房东还价"
                      : "议价已接受"
                  }
                </span>

                <strong>
                  ${money(
                    offer.monthlyRent
                  )}/月
                </strong>

                <small>
                  免租
                  ${offer.rentFreeDays ?? 0}
                  天
                </small>

                ${
                  offer.status ===
                  "countered"
                    ? `
                      <button
                        type="button"
                        data-action="accept-counter"
                      >
                        接受房东还价
                      </button>
                    `
                    : ""
                }

              </section>
            `
            : ""
        }


        <section class="property-sign-cost">

          <span>
            签约首付
          </span>

          <strong>
            ${money(
              quote.upfront
            )}
          </strong>

          <small>
            ${
              quote.affordable ===
              false
                ? "当前资金不足"
                : quote.affordable ===
                  true
                  ? "当前资金可承担"
                  : "未绑定门店资金账户"
            }
          </small>

        </section>


        <button
          type="button"
          class="property-sign-button"
          data-action="sign"
          ${
            !this.restaurantId ||
            !page.leaseState
              .canSign ||
            offer?.status ===
              "countered"
              ? "disabled"
              : ""
          }
        >
          ${
            page.leaseState
              .hasActiveLease
              ? "门店已有租约"
              : "确认签约并进入装修"
          }
        </button>

      </aside>
    `;
  }


  renderMarkup(
    page
  ) {
    return `
      <main class="property-detail-game">

        ${this.renderTopbar(
          page
        )}

        ${this.renderTitle(
          page
        )}


        ${
          this.message
            ? `
              <div class="property-detail-message">
                ${escapeHtml(
                  this.message
                )}
              </div>
            `
            : ""
        }


        ${this.renderMedia(
          page
        )}

        ${this.renderBasicInfo(
          page
        )}


        <section class="property-detail-content">

          <div class="property-detail-content__main">

            ${this.renderStructures(
              page
            )}

            ${this.renderFacilities(
              page
            )}

            ${this.renderAssessment(
              page
            )}

            ${this.renderRisks(
              page
            )}

          </div>


          ${this.renderLease(
            page
          )}

        </section>

      </main>
    `;
  }


  render() {
    if (!this.page) {
      return;
    }

    this.root.innerHTML =
      this.renderMarkup(
        this.page
      );
  }


  handleClick(
    event
  ) {
    const target =
      event.target.closest?.(
        "[data-action]"
      );

    if (
      !target ||
      !this.root.contains(
        target
      )
    ) {
      return;
    }


    const action =
      target.dataset.action;


    if (
      action ===
      "back"
    ) {
      this.onNavigate?.(
        "properties",
        this.restaurantId
      );

      return;
    }


    if (
      action ===
      "media"
    ) {
      this.mediaTab =
        target.dataset.mediaId;

      this.render();

      return;
    }


    if (
      action ===
      "floor"
    ) {
      this.floorId =
        target.dataset.floorId;

      this.render();

      return;
    }


    if (
      action ===
      "apply-months"
    ) {
      const input =
        this.root.querySelector(
          "[data-lease-months]"
        );

      const months =
        Number(
          input?.value
        );

      if (
        Number.isInteger(
          months
        )
      ) {
        this.months =
          months;

        this.offerId =
          null;

        try {
          this.message =
            "租赁报价已重新计算";

          this.refresh();
        } catch (
          error
        ) {
          this.message =
            error.message;

          this.render();
        }
      }

      return;
    }


    if (
      action ===
      "negotiate"
    ) {
      const rent =
        Number(
          this.root
            .querySelector(
              "[data-request-rent]"
            )
            ?.value
        );

      const freeDays =
        Number(
          this.root
            .querySelector(
              "[data-request-free-days]"
            )
            ?.value
        );


      try {
        const result =
          this.pageSystem
            .negotiate({
              restaurantId:
                this.restaurantId,

              propertyId:
                this.propertyId,

              months:
                this.months,

              requestedRent:
                Math.round(
                  rent
                ),

              requestedRentFreeDays:
                Math.round(
                  freeDays
                )
            });

        if (
          result.offer
            .status ===
          "accepted"
        ) {
          this.offerId =
            result.offer.id;

          this.message =
            "房东接受了你的报价";
        } else {
          this.message =
            "房东没有直接接受，并给出了还价";
        }

        this.refresh();
      } catch (
        error
      ) {
        this.message =
          error.message;

        this.render();
      }

      return;
    }


    if (
      action ===
      "accept-counter"
    ) {
      try {
        const offer =
          this.pageSystem
            .acceptCounter(
              this.page
                .activeOffer
                .id
            );

        this.offerId =
          offer.id;

        this.message =
          "已接受房东还价";

        this.refresh();
      } catch (
        error
      ) {
        this.message =
          error.message;

        this.render();
      }

      return;
    }


    if (
      action ===
      "sign"
    ) {
      try {
        const activeOffer =
          this.page
            .activeOffer;

        const offerId =
          activeOffer
            ?.status ===
            "accepted"
            ? activeOffer.id
            : this.offerId;

        const result =
          this.pageSystem
            .signLease({
              restaurantId:
                this.restaurantId,

              propertyId:
                this.propertyId,

              months:
                this.months,

              offerId
            });

        this.message =
          "签约成功";

        this.onNavigate?.(
          result.nextPage,
          this.restaurantId,
          result
        );
      } catch (
        error
      ) {
        this.message =
          error.message;

        this.render();
      }
    }
  }
}


export const propertyDetailView = {
  mount(options) {
    return new PropertyDetailView(
      options
    ).mount();
  }
};


export {
  PropertyDetailView
};
