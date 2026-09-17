const EMPLOYEE_ENTRIES =
  Object.freeze([
    {
      id:
        "overview",

      title:
        "员工总览",

      description:
        "查看员工岗位、工资、状态、疲劳和当前团队情况",

      target:
        "employee_roster",

      secondary: []
    },

    {
      id:
        "staffing",

      title:
        "招聘与排班",

      description:
        "补充缺口岗位，调整班次，解决高峰期人手不足",

      target:
        "employee_roster",

      secondary: [
        {
          title:
            "排班与产能",

          target:
            "workforce-capacity"
        }
      ]
    },

    {
      id:
        "development",

      title:
        "培训晋升",

      description:
        "提升员工技能、培养骨干并安排晋升",

      target:
        "employee_training",

      secondary: [
        {
          title:
            "员工晋升",

          target:
            "employee_promotion"
        }
      ]
    }
  ]);


class EmployeeHubPageSystem {
  getPage() {
    return {
      pageId:
        "employee-home",

      title:
        "员工",

      entries:
        EMPLOYEE_ENTRIES
          .map(
            entry => ({
              ...entry,

              secondary:
                entry.secondary
                  .map(
                    item => ({
                      ...item
                    })
                  )
            })
          )
    };
  }
}


export const employeeHubPageSystem =
  new EmployeeHubPageSystem();

export {
  EmployeeHubPageSystem,
  EMPLOYEE_ENTRIES
};
