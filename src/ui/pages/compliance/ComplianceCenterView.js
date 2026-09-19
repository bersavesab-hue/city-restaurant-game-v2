import {
  complianceCenterPageSystem
} from "./ComplianceCenterPageSystem.js";

import {
  renderGameTopBar,
  renderNoticeTicker,
  renderPageTitle,
  renderBottomNavigation
} from "../../components/GameChromeView.js";

import {
  gameChromeSystem
} from "../../components/GameChromeSystem.js";

function money(value) {
  return (
    "¥" +
    Math.round(
      Number(value ?? 0)
    ).toLocaleString("zh-CN")
  );
}

function permitStatusText(
  permit
) {
  if (permit.issued) {
    return permit.renewalDue
      ? "即将到期"
      : "有效";
  }

  if (permit.applicationPending) {
    return "审核中";
  }

  if (permit.record?.status === "expired") {
    return "已过期";
  }

  if (!permit.required) {
    return "当前不需要";
  }

  return permit.ready
    ? "可申请"
    : "条件不足";
}

class ComplianceCenterView {
  constructor({
    pageSystem =
      complianceCenterPageSystem,

    onNavigate =
      null
  } = {}) {
    this.pageSystem =
      pageSystem;

    this.onNavigate =
      onNavigate;

    this.root = null;
    this.restaurantId = null;
  }

  mount(
    root,
    {
      restaurantId,
      onNavigate =
        this.onNavigate
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
    const status =
      page.status;

    return `
      <main class="rg-screen compliance-center-page">

        ${renderGameTopBar(
          page.topBar,
          {
            subtitle:
              "证照 · 抽查 · 整改"
          }
        )}

        ${renderNoticeTicker(
          page.noticeTicker
        )}

        ${renderPageTitle({
          title:
            "合规中心",

          subtitle:
            `合规分${status.complianceScore} · 有效许可${status.issuedCount}/${status.requiredCount} · 待续期${status.renewalDueCount}`,

          backTarget:
            "more-home"
        })}

        <section class="compliance-center">

        <section>
          <h2>证照状态</h2>

          ${page.permits.map(
            permit => `
              <article>
                <strong>
                  ${permit.name}
                </strong>

                <span>
                  ${permitStatusText(
                    permit
                  )}
                </span>

                <small>
                  申请费
                  ${money(
                    permit.applicationFee
                  )}
                  ·
                  办理
                  ${permit.processingDays}天
                  ·
                  有效
                  ${permit.validityDays}天
                </small>

                <p>
                  ${permit.reason}
                </p>

                ${
                  permit.issued
                    ? `
                      <small>
                        到期日：
                        第${permit.record?.expiresDay ?? "-"}天
                        ·
                        下次抽查：
                        第${permit.record?.nextInspectionDay ?? "-"}天
                      </small>
                    `
                    : ""
                }

                <div>
                  ${
                    permit.required &&
                    permit.ready &&
                    !permit.issued &&
                    !permit.applicationPending
                      ? `
                        <button
                          type="button"
                          data-compliance-apply="${permit.permitKind}"
                        >
                          提交申请
                        </button>
                      `
                      : ""
                  }

                  ${
                    permit.renewalDue
                      ? `
                        <button
                          type="button"
                          data-compliance-renew="${permit.permitKind}"
                        >
                          续期
                          ${money(
                            permit.renewalFee
                          )}
                        </button>
                      `
                      : ""
                  }

                  ${
                    permit.issued
                      ? `
                        <button
                          type="button"
                          data-compliance-inspect="${permit.permitKind}"
                        >
                          自查
                        </button>
                      `
                      : ""
                  }
                </div>
              </article>
            `
          ).join("")}
        </section>

        <section>
          <h2>整改与处罚</h2>

          ${
            page.violations.length
              ? page.violations.map(
                  violation => `
                    <article>
                      <strong>
                        ${violation.severity}
                        ·
                        ${violation.permitKind}
                      </strong>

                      <span>
                        ${violation.reason}
                      </span>

                      <small>
                        罚款
                        ${money(
                          violation.fine
                        )}
                        ·
                        整改期限
                        第${violation.correctionDueDay}天
                      </small>

                      <button
                        type="button"
                        data-compliance-resolve="${violation.id}"
                      >
                        提交整改复查
                      </button>
                    </article>
                  `
                ).join("")
              : "<p>当前没有未完成整改。</p>"
          }
        </section>

        <section>
          <h2>最近抽查</h2>

          ${
            page.inspections.length
              ? page.inspections.map(
                  item => `
                    <article>
                      <strong>
                        第${item.day}天
                        ·
                        ${item.permitKind}
                      </strong>

                      <span>
                        ${item.passed
                          ? "通过"
                          : "未通过"
                        }
                      </span>

                      <small>
                        ${item.reason}
                      </small>
                    </article>
                  `
                ).join("")
              : "<p>暂无抽查记录。</p>"
          }
        </section>
        </section>

        ${renderBottomNavigation(
          gameChromeSystem
            .getNavigation({
              restaurantId:
                page.restaurantId,

              activePageId:
                "more"
            })
        )}

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
        "[data-compliance-apply]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.pageSystem
                .submitPermit(
                  this.restaurantId,
                  button.dataset
                    .complianceApply
                );

              this.render();
            }
          );
        }
      );

    this.root
      .querySelectorAll(
        "[data-compliance-renew]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.pageSystem
                .renewPermit(
                  this.restaurantId,
                  button.dataset
                    .complianceRenew
                );

              this.render();
            }
          );
        }
      );

    this.root
      .querySelectorAll(
        "[data-compliance-inspect]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.pageSystem
                .inspectPermit(
                  this.restaurantId,
                  button.dataset
                    .complianceInspect
                );

              this.render();
            }
          );
        }
      );

    this.root
      .querySelectorAll(
        "[data-compliance-resolve]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.pageSystem
                .resolveViolation(
                  this.restaurantId,
                  button.dataset
                    .complianceResolve
                );

              this.render();
            }
          );
        }
      );
  }

  destroy() {
    this.root = null;
    this.restaurantId = null;
  }
}

export const complianceCenterView =
  new ComplianceCenterView();

export {
  ComplianceCenterView
};
