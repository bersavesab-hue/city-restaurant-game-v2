const EMPLOYEE_ENTRIES = Object.freeze([
  {
    id: "overview",
    title: "员工总览",
    description: "查看员工、岗位、工资、状态和人员配置",
    target: "employee_roster",
    secondary: []
  },
  {
    id: "schedule",
    title: "招聘与排班",
    description: "补充缺口岗位，调整排班、出勤和高峰人手",
    target: "workforce-capacity",
    secondary: [
      {
        title: "员工管理",
        target: "employee_roster"
      }
    ]
  },
  {
    id: "growth",
    title: "培训晋升",
    description: "提升员工技能，培养核心员工和管理人员",
    target: "employee_training",
    secondary: [
      {
        title: "员工晋升",
        target: "employee_promotion"
      }
    ]
  }
]);

class EmployeesHubPageSystem {
  getPage() {
    return {
      pageId: "employees-home",
      title: "员工",
      entries: EMPLOYEE_ENTRIES.map(
        entry => ({
          ...entry,
          secondary: entry.secondary.map(
            item => ({ ...item })
          )
        })
      )
    };
  }
}

export const employeesHubPageSystem =
  new EmployeesHubPageSystem();

export {
  EmployeesHubPageSystem,
  EMPLOYEE_ENTRIES
};
