import {
  employeeManagementPageSystem
} from "./EmployeeManagementPageSystem.js";

import {
  renderGameTopBar,
  renderBottomNavigation
} from "../../components/GameChromeView.js";

import {
  gameChromeSystem
} from "../../components/GameChromeSystem.js";


function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}


function renderAvatar(employee) {
  return (
    '<div class="staff-home-avatar staff-home-avatar--' +
      escapeHtml(employee.roleId) +
    '" role="img" aria-label="' +
      escapeHtml(employee.name) +
    '头像" data-image-slot="employee-avatar-' +
      escapeHtml(employee.avatarId) +
    '" data-avatar-id="' +
      escapeHtml(employee.avatarId) +
    '" data-image-fit="cover" data-image-position="center top">' +
      '<span aria-hidden="true">' +
        escapeHtml(employee.name.slice(0,1)) +
      '</span>' +
    '</div>'
  );
}


function roleGroup(employee) {
  if (
    [
      "chef",
      "kitchen_assistant"
    ].includes(employee.roleId)
  ) {
    return "chef";
  }

  if (
    [
      "server",
      "cleaner",
      "delivery"
    ].includes(employee.roleId)
  ) {
    return "server";
  }

  if (employee.roleId === "cashier") {
    return "cashier";
  }

  if (employee.roleId === "manager") {
    return "manager";
  }

  return "other";
}


class EmployeeManagementView {
  constructor({
    root = null,
    restaurantId = null,
    pageSystem = employeeManagementPageSystem,
    onNavigate = null
  } = {}) {
    this.root = root;
    this.restaurantId = restaurantId;
    this.pageSystem = pageSystem;
    this.onNavigate = onNavigate;
    this.page = null;
    this.tab = "all";
    this.query = "";
  }


  mount(
    root = this.root,
    {
      restaurantId = this.restaurantId
    } = {}
  ) {
    this.root = root;
    this.restaurantId = restaurantId;
    this.render();
    return this;
  }


  getEmployees() {
    const employees =
      this.page?.employees ?? [];

    const query =
      this.query
        .trim()
        .toLowerCase();

    return employees.filter(
      employee => {
        const matchesTab =
          this.tab === "all" ||
          roleGroup(employee) === this.tab;

        if (!matchesTab) {
          return false;
        }

        if (!query) {
          return true;
        }

        const haystack =
          [
            employee.name,
            employee.roleName,
            employee.rank?.name,
            employee.primarySkill?.label
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return haystack.includes(query);
      }
    );
  }


  renderMetrics() {
    const icons = ["♟","●","▤","☺"];

    return (
      '<section class="staff-home-metrics">' +
      (this.page.metrics ?? [])
        .map((metric,index) =>
          '<article class="staff-home-metric staff-home-metric--' +
          escapeHtml(metric.tone) +
          '">' +
            '<span class="staff-home-metric__icon" aria-hidden="true">' +
              icons[index % icons.length] +
            '</span>' +
            '<div>' +
              '<small>' +
                escapeHtml(metric.label) +
              '</small>' +
              '<strong>' +
                escapeHtml(metric.value) +
              '</strong>' +
              '<b>' +
                (
                  metric.label === "当前缺口"
                    ? "需尽快补充"
                    : metric.label === "人力成本"
                      ? "本月预计"
                      : metric.label === "平均满意度"
                        ? "实时更新"
                        : "当前在岗"
                ) +
              '</b>' +
            '</div>' +
          '</article>'
        )
        .join("") +
      '</section>'
    );
  }


  renderActions() {
    const actions = [
      {
        title: "招聘员工",
        subtitle: "发布职位\n寻找人才",
        target: "employee_recruitment",
        icon: "♟",
        tone: "orange"
      },
      {
        title: "排班与产能",
        subtitle: "合理安排班次",
        target: "workforce-capacity",
        icon: "▦",
        tone: "blue"
      },
      {
        title: "培训提升",
        subtitle: "提升技能效率",
        target: "employee_training",
        icon: "◆",
        tone: "purple"
      },
      {
        title: "晋升考核",
        subtitle: "激励员工成长",
        target: "employee_promotion",
        icon: "♛",
        tone: "gold"
      }
    ];

    return (
      '<section class="staff-home-actions">' +
      actions.map(item =>
        '<button type="button" class="staff-home-action staff-home-action--' +
        item.tone +
        '" data-page-target="' +
        escapeHtml(item.target) +
        '">' +
          '<span class="staff-home-action__icon" aria-hidden="true">' +
            item.icon +
          '</span>' +
          '<span>' +
            '<strong>' +
              escapeHtml(item.title) +
            '</strong>' +
            '<small>' +
              escapeHtml(item.subtitle).replaceAll("\n","<br>") +
            '</small>' +
          '</span>' +
          '<b aria-hidden="true">›</b>' +
        '</button>'
      ).join("") +
      '</section>'
    );
  }


  renderAlert() {
    const alert =
      this.page.primaryAlert;

    if (!alert) {
      return "";
    }

    return (
      '<section class="staff-home-alert">' +
        '<span class="staff-home-alert__icon" aria-hidden="true">●</span>' +
        '<div>' +
          '<strong>' +
            escapeHtml(alert.title) +
          '</strong>' +
          '<small>' +
            escapeHtml(alert.message) +
          '</small>' +
        '</div>' +
        '<button type="button" data-page-target="' +
          escapeHtml(alert.target ?? "employee_recruitment") +
        '">' +
          '立即处理 <b aria-hidden="true">›</b>' +
        '</button>' +
      '</section>'
    );
  }


  renderTabs() {
    return (
      '<nav class="staff-home-tabs" aria-label="员工分类">' +
      (this.page.roleTabs ?? [])
        .map(item =>
          '<button type="button" class="' +
          (this.tab === item.id ? "is-active" : "") +
          '" data-employee-tab="' +
          escapeHtml(item.id) +
          '">' +
            escapeHtml(item.label) +
            ' (' +
            item.count +
            ')' +
          '</button>'
        )
        .join("") +
      '</nav>'
    );
  }


  renderEmployeeRow(employee) {
    const statusClass =
      employee.status?.tone ??
      "neutral";

    return (
      '<article class="staff-home-row">' +

        '<button type="button" class="staff-home-row__main" data-page-target="employee_detail" data-employee-id="' +
        escapeHtml(employee.id) +
        '">' +

          renderAvatar(employee) +

          '<span class="staff-home-row__identity">' +
            '<strong>' +
              escapeHtml(employee.name) +
            '</strong>' +
            '<span>' +
              '<b class="staff-home-role staff-home-role--' +
                escapeHtml(roleGroup(employee)) +
              '">' +
                escapeHtml(employee.roleName) +
              '</b>' +
              '<small>Lv.' +
                employee.level +
              '</small>' +
            '</span>' +
          '</span>' +

          '<span class="staff-home-row__status staff-home-row__status--' +
            escapeHtml(statusClass) +
          '">' +
            '<b>' +
              escapeHtml(employee.status?.label ?? "未知") +
            '</b>' +
            '<small>' +
              escapeHtml(employee.shift?.label ?? "未排班") +
            '</small>' +
          '</span>' +

          '<span class="staff-home-row__skill">' +
            '<i aria-hidden="true">◆</i>' +
            '<span>' +
              '<strong>' +
                escapeHtml(employee.primarySkill?.label ?? "岗位技能") +
              '</strong>' +
              '<small>Lv.' +
                Math.max(
                  1,
                  Math.round(
                    Number(employee.primarySkill?.value ?? 0) / 20
                  )
                ) +
              '</small>' +
            '</span>' +
          '</span>' +

          '<span class="staff-home-row__satisfaction">' +
            '<i aria-hidden="true">☺</i>' +
            '<strong>' +
              employee.satisfactionScore +
              '%' +
            '</strong>' +
          '</span>' +

          '<span class="staff-home-row__arrow" aria-hidden="true">›</span>' +

        '</button>' +

      '</article>'
    );
  }


  renderEmployeeList() {
    const employees =
      this.getEmployees();

    return (
      '<section class="staff-home-list">' +

        '<header class="staff-home-list__header">' +
          '<div>' +
            '<span aria-hidden="true">♟</span>' +
            '<strong>员工列表 (' +
              (this.page.employees?.length ?? 0) +
            ')</strong>' +
          '</div>' +

          '<div class="staff-home-search">' +
            '<span aria-hidden="true">⌕</span>' +
            '<input type="search" value="' +
              escapeHtml(this.query) +
            '" placeholder="搜索员工姓名或职位" data-employee-search>' +
          '</div>' +

          '<button type="button" class="staff-home-filter-button" aria-label="筛选">' +
            '▽ 筛选' +
          '</button>' +
        '</header>' +

        this.renderTabs() +

        '<div class="staff-home-list__rows">' +
          (
            employees.length
              ? employees
                  .map(employee => this.renderEmployeeRow(employee))
                  .join("")
              : (
                  '<div class="staff-home-empty">' +
                    '<strong>没有符合条件的员工</strong>' +
                    '<span>调整分类或搜索条件后再试。</span>' +
                  '</div>'
                )
          ) +
        '</div>' +

      '</section>'
    );
  }


  renderMarkup(page) {
    this.page = page;

    return (
      '<main class="rg-screen staff-home-screen">' +

        renderGameTopBar(
          page.topBar,
          {
            subtitle: "集团视角",
            showSpeedControls: true
          }
        ) +

        '<section class="staff-home-hero" aria-label="员工管理">' +
          '<div><h1>员工管理</h1><p>好团队 · 好服务 · 好味道</p></div>' +
          '<span aria-hidden="true">用心的人<br>做有温度的美食 ♡</span>' +
        '</section>' +

        '<div class="staff-home-content">' +
          this.renderMetrics() +
          this.renderActions() +
          this.renderAlert() +
          this.renderEmployeeList() +
        '</div>' +

        renderBottomNavigation(
          gameChromeSystem.getNavigation({
            restaurantId: this.restaurantId,
            activePageId: "employees"
          })
        ) +

      '</main>'
    );
  }


  render() {
    this.page =
      this.pageSystem.getPage(
        this.restaurantId
      );

    this.root.innerHTML =
      this.renderMarkup(
        this.page
      );

    this.bind();

    return this.page;
  }


  bind() {
    this.root
      .querySelectorAll(
        "[data-employee-tab]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              this.tab =
                button.dataset.employeeTab;

              this.root.innerHTML =
                this.renderMarkup(
                  this.page
                );

              this.bind();
            }
          );
        }
      );

    const search =
      this.root.querySelector(
        "[data-employee-search]"
      );

    if (search) {
      search.addEventListener(
        "input",
        event => {
          this.query =
            event.target.value ?? "";

          const list =
            this.root.querySelector(
              ".staff-home-list__rows"
            );

          if (list) {
            const employees =
              this.getEmployees();

            list.innerHTML =
              employees.length
                ? employees
                    .map(employee => this.renderEmployeeRow(employee))
                    .join("")
                : (
                    '<div class="staff-home-empty">' +
                      '<strong>没有符合条件的员工</strong>' +
                      '<span>调整分类或搜索条件后再试。</span>' +
                    '</div>'
                  );
          }
        }
      );
    }
  }
}


export const employeeManagementView =
  new EmployeeManagementView();


export {
  EmployeeManagementView
};
