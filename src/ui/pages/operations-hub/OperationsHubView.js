class OperationsHubView {
  renderMarkup(page) {
    return `
      <main class="operations-hub">

        <header class="operations-hub__header">
          <span>
            门店经营
          </span>

          <h1>
            经营
          </h1>

          <p>
            只保留日常真正需要处理的核心入口
          </p>
        </header>


        <section class="operations-hub__grid">

          ${
            page.entries
              .map(
                entry => `
                  <article
                    class="operations-hub__card"
                  >

                    <button
                      type="button"
                      class="operations-hub__primary"
                      data-page-target="${entry.target}"
                      ${entry.state ===
                        "locked"
                          ? "disabled"
                          : ""
                      }
                    >
                      <strong>
                        ${entry.title}
                      </strong>

                      <span>
                        ${entry.description}
                      </span>

                      <b>
                        ${entry.state ===
                          "locked"
                            ? `Lv.${entry.unlockLevel} 解锁`
                            : "进入 →"
                        }
                      </b>
                    </button>

                    ${
                      entry.secondary.length
                        ? `
                          <div
                            class="operations-hub__secondary"
                          >
                            ${
                              entry.secondary
                                .map(
                                  item => `
                                    <button
                                      type="button"
                                      data-page-target="${item.target}"
                                    >
                                      ${item.title}
                                    </button>
                                  `
                                )
                                .join("")
                            }
                          </div>
                        `
                        : ""
                    }

                  </article>
                `
              )
              .join("")
          }

        </section>

      </main>
    `;
  }
}


export const operationsHubView =
  new OperationsHubView();

export {
  OperationsHubView
};
