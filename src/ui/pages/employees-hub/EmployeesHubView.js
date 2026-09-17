class EmployeesHubView {
  renderMarkup(page) {
    return `
      <main class="employees-hub">
        <header>
          <span>门店团队</span>
          <h1>员工</h1>
          <p>管理人员、排班和员工成长</p>
        </header>

        <section>
          ${
            page.entries.map(
              entry => `
                <article>
                  <button
                    type="button"
                    data-page-target="${entry.target}"
                  >
                    <strong>${entry.title}</strong>
                    <span>${entry.description}</span>
                    <b>进入 →</b>
                  </button>

                  ${
                    entry.secondary.map(
                      item => `
                        <button
                          type="button"
                          data-page-target="${item.target}"
                        >
                          ${item.title}
                        </button>
                      `
                    ).join("")
                  }
                </article>
              `
            ).join("")
          }
        </section>
      </main>
    `;
  }
}

export const employeesHubView =
  new EmployeesHubView();

export {
  EmployeesHubView
};
