class EmployeeHubView {
  renderMarkup(page) {
    return `
      <main class="employee-hub">

        <header class="employee-hub__header">
          <span>
            团队管理
          </span>

          <h1>
            员工
          </h1>

          <p>
            招对人、排好班、培养核心员工
          </p>
        </header>


        <section class="employee-hub__grid">

          ${
            page.entries
              .map(
                entry => `
                  <article
                    class="employee-hub__card"
                  >

                    <button
                      type="button"
                      class="employee-hub__primary"
                      data-page-target="${entry.target}"
                    >
                      <strong>
                        ${entry.title}
                      </strong>

                      <span>
                        ${entry.description}
                      </span>

                      <b>
                        进入 →
                      </b>
                    </button>

                    ${
                      entry.secondary.length
                        ? `
                          <div
                            class="employee-hub__secondary"
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


export const employeeHubView =
  new EmployeeHubView();

export {
  EmployeeHubView
};
