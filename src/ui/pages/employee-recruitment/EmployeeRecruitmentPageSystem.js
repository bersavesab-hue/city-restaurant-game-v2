import {
  employeeManagementPageSystem
} from "../employees/EmployeeManagementPageSystem.js";

import {
  employeeStaffingSystem
} from "../../../systems/EmployeeStaffingSystem.js";


class EmployeeRecruitmentPageSystem {
  getPage(
    restaurantId
  ) {
    return {
      ...employeeManagementPageSystem
        .getRecruitmentPage(
          restaurantId
        ),

      pageId:
        "employee_recruitment"
    };
  }


  refreshTalentPool(
    restaurantId,
    {
      count = 10
    } = {}
  ) {
    return employeeStaffingSystem
      .refreshTalentPool(
        restaurantId,
        {
          count,
          replace: true
        }
      );
  }


  hireCandidate(
    restaurantId,
    candidateId
  ) {
    return employeeStaffingSystem
      .hireCandidate({
        restaurantId,
        candidateId
      });
  }
}


export const employeeRecruitmentPageSystem =
  new EmployeeRecruitmentPageSystem();


export {
  EmployeeRecruitmentPageSystem
};
