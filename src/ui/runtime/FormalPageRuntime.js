import {
  eventBus
} from "../../core/EventBus.js";

import {
  supplyManagementPageSystem
} from "../pages/supply/SupplyManagementPageSystem.js";

import {
  supplyManagementView
} from "../pages/supply/SupplyManagementView.js";


import {
  financeCenterPageSystem
} from "../pages/finance/FinanceCenterPageSystem.js";

import {
  financeCenterView
} from "../pages/finance/FinanceCenterView.js";


import {
  employeeRecruitmentPageSystem
} from "../pages/employee-recruitment/EmployeeRecruitmentPageSystem.js";

import {
  employeeRecruitmentView
} from "../pages/employee-recruitment/EmployeeRecruitmentView.js";


import {
  employeeDetailPageSystem
} from "../pages/employee-detail/EmployeeDetailPageSystem.js";

import {
  employeeDetailView
} from "../pages/employee-detail/EmployeeDetailView.js";


import {
  employeeTrainingPageSystem
} from "../pages/employee-training/EmployeeTrainingPageSystem.js";

import {
  employeeTrainingView
} from "../pages/employee-training/EmployeeTrainingView.js";


import {
  employeePromotionPageSystem
} from "../pages/employee-promotion/EmployeePromotionPageSystem.js";

import {
  employeePromotionView
} from "../pages/employee-promotion/EmployeePromotionView.js";


import {
  workforceCapacityPageSystem
} from "../pages/workforce-capacity/WorkforceCapacityPageSystem.js";

import {
  workforceCapacityView
} from "../pages/workforce-capacity/WorkforceCapacityView.js";


import {
  operatingCommandCenterPageSystem
} from "../pages/command-center/OperatingCommandCenterPageSystem.js";

import {
  operatingCommandCenterView
} from "../pages/command-center/OperatingCommandCenterView.js";


import {
  capacityManagementPageSystem
} from "../pages/capacity/CapacityManagementPageSystem.js";

import {
  capacityManagementView
} from "../pages/capacity/CapacityManagementView.js";


import {
  reputationPageSystem
} from "../pages/reputation/ReputationPageSystem.js";

import {
  reputationView
} from "../pages/reputation/ReputationView.js";


import {
  channelManagementPageSystem
} from "../pages/channels/ChannelManagementPageSystem.js";

import {
  channelManagementView
} from "../pages/channels/ChannelManagementView.js";


import {
  menuOptimizationPageSystem
} from "../pages/menu-optimization/MenuOptimizationPageSystem.js";

import {
  menuOptimizationView
} from "../pages/menu-optimization/MenuOptimizationView.js";


import {
  menuEngineeringPageSystem
} from "../pages/menu-engineering/MenuEngineeringPageSystem.js";

import {
  menuEngineeringView
} from "../pages/menu-engineering/MenuEngineeringView.js";


import {
  equipmentManagementPageSystem
} from "../pages/equipment/EquipmentManagementPageSystem.js";

import {
  equipmentManagementView
} from "../pages/equipment/EquipmentManagementView.js";


import {
  equipmentMaintenancePageSystem
} from "../pages/equipment-maintenance/EquipmentMaintenancePageSystem.js";

import {
  equipmentMaintenanceView
} from "../pages/equipment-maintenance/EquipmentMaintenanceView.js";


import {
  customerManagementPageSystem
} from "../pages/customers/CustomerManagementPageSystem.js";

import {
  customerManagementView
} from "../pages/customers/CustomerManagementView.js";


import {
  memberMarketingPageSystem
} from "../pages/marketing/MemberMarketingPageSystem.js";

import {
  memberMarketingView
} from "../pages/marketing/MemberMarketingView.js";


import {
  complianceCenterPageSystem
} from "../pages/compliance/ComplianceCenterPageSystem.js";

import {
  complianceCenterView
} from "../pages/compliance/ComplianceCenterView.js";


import {
  operationsHubPageSystem
} from "../pages/operations-hub/OperationsHubPageSystem.js";

import {
  operationsHubView
} from "../pages/operations-hub/OperationsHubView.js";


import {
  rankingCenterPageSystem
} from "../pages/ranking/RankingCenterPageSystem.js";

import {
  rankingCenterView
} from "../pages/ranking/RankingCenterView.js";


import {
  awardsPageSystem
} from "../pages/awards/AwardsPageSystem.js";

import {
  awardsView
} from "../pages/awards/AwardsView.js";


import {
  honorHallPageSystem
} from "../pages/honors/HonorHallPageSystem.js";

import {
  honorHallView
} from "../pages/honors/HonorHallView.js";


import {
  awardCeremonyPageSystem
} from "../pages/award-ceremony/AwardCeremonyPageSystem.js";

import {
  awardCeremonyView
} from "../pages/award-ceremony/AwardCeremonyView.js";


import {
  moreHubPageSystem
} from "../pages/more/MoreHubPageSystem.js";

import {
  moreHubView
} from "../pages/more/MoreHubView.js";


import {
  marketStrategyPageSystem
} from "../pages/market-strategy/MarketStrategyPageSystem.js";

import {
  marketStrategyView
} from "../pages/market-strategy/MarketStrategyView.js";


import {
  storeProgressPageSystem
} from "../pages/progress/StoreProgressPageSystem.js";

import {
  storeProgressView
} from "../pages/progress/StoreProgressView.js";


import {
  chainManagementPageSystem
} from "../pages/chain/ChainManagementPageSystem.js";

import {
  chainManagementView
} from "../pages/chain/ChainManagementView.js";


import {
  leaseManagementPageSystem
} from "../pages/lease/LeaseManagementPageSystem.js";

import {
  leaseManagementView
} from "../pages/lease/LeaseManagementView.js";


import {
  settingsPageSystem
} from "../pages/settings/SettingsPageSystem.js";

import {
  settingsView
} from "../pages/settings/SettingsView.js";


import {
  brandInvestmentPageSystem
} from "../pages/brand-investments/BrandInvestmentPageSystem.js";

import {
  brandInvestmentView
} from "../pages/brand-investments/BrandInvestmentView.js";


const FORMAL_PAGE_DEFINITIONS =
  Object.freeze({
    supply: {
      pageSystem:
        supplyManagementPageSystem,

      view:
        supplyManagementView,

      mode:
        "mount"
    },


    finance: {
      pageSystem:
        financeCenterPageSystem,

      view:
        financeCenterView
    },


    employee_recruitment: {
      pageSystem:
        employeeRecruitmentPageSystem,

      view:
        employeeRecruitmentView,

      mode:
        "mount"
    },


    employee_detail: {
      pageSystem:
        employeeDetailPageSystem,

      view:
        employeeDetailView
    },


    employee_training: {
      pageSystem:
        employeeTrainingPageSystem,

      view:
        employeeTrainingView,

      mode:
        "mount"
    },


    employee_promotion: {
      pageSystem:
        employeePromotionPageSystem,

      view:
        employeePromotionView
    },


    "workforce-capacity": {
      pageSystem:
        workforceCapacityPageSystem,

      view:
        workforceCapacityView
    },


    "operating-command-center": {
      pageSystem:
        operatingCommandCenterPageSystem,

      view:
        operatingCommandCenterView,

      bindDataTarget:
        true,

      refreshEvents: [
        "traffic:hourCompleted",
        "settlement:completed",
        "award:feedback"
      ]
    },


    capacity: {
      pageSystem:
        capacityManagementPageSystem,

      view:
        capacityManagementView
    },


    reputation: {
      pageSystem:
        reputationPageSystem,

      view:
        reputationView
    },


    channels: {
      pageSystem:
        channelManagementPageSystem,

      view:
        channelManagementView,

      mode:
        "mount",

      refreshEvents: [
        "order:completed",
        "salesChannel:unlocked",
        "salesChannel:changed",
        "salesChannel:configured"
      ]
    },


    "menu-optimization": {
      pageSystem:
        menuOptimizationPageSystem,

      view:
        menuOptimizationView
    },


    "menu-engineering": {
      pageSystem:
        menuEngineeringPageSystem,

      view:
        menuEngineeringView
    },


    "equipment-management": {
      pageSystem:
        equipmentManagementPageSystem,

      view:
        equipmentManagementView
    },


    "equipment-maintenance": {
      pageSystem:
        equipmentMaintenancePageSystem,

      view:
        equipmentMaintenanceView
    },


    customers: {
      pageSystem:
        customerManagementPageSystem,

      view:
        customerManagementView
    },


    "member-marketing": {
      pageSystem:
        memberMarketingPageSystem,

      view:
        memberMarketingView,

      refreshEvents: [
        "order:completed",
        "member:enrolled",
        "member:levelChanged",
        "member:pointsExpired",
        "member:pointsRedeemed"
      ]
    },


    "compliance-center": {
      pageSystem:
        complianceCenterPageSystem,

      view:
        complianceCenterView,

      mode:
        "mount",

      refreshEvents: [
        "compliance:applicationSubmitted",
        "compliance:permitIssued",
        "compliance:permitRenewed",
        "compliance:permitExpired",
        "compliance:inspectionCompleted",
        "compliance:violationCreated",
        "compliance:violationResolved"
      ]
    },


    "operations-home": {
      pageSystem:
        operationsHubPageSystem,

      view:
        operationsHubView
    },


    "ranking-center": {
      pageSystem:
        rankingCenterPageSystem,

      view:
        rankingCenterView,

      mode:
        "mount"
    },


    "awards-center": {
      pageSystem:
        awardsPageSystem,

      view:
        awardsView,

      mode:
        "mount"
    },


    "honor-hall": {
      pageSystem:
        honorHallPageSystem,

      view:
        honorHallView,

      mode:
        "mount"
    },


    "award-ceremony": {
      pageSystem:
        awardCeremonyPageSystem,

      view:
        awardCeremonyView,

      mode:
        "mount"
    },


    "more-home": {
      pageSystem:
        moreHubPageSystem,

      view:
        moreHubView,

      mode:
        "mount"
    },


    "market-strategy": {
      pageSystem:
        marketStrategyPageSystem,

      view:
        marketStrategyView,

      mode:
        "mount"
    },


    "store-progress": {
      pageSystem:
        storeProgressPageSystem,

      view:
        storeProgressView,

      refreshEvents: [
        "store:experienceGained",
        "store:levelUp"
      ]
    },


    chain: {
      pageSystem:
        chainManagementPageSystem,

      view:
        chainManagementView,

      mode:
        "mount",

      refreshEvents: [
        "chain:created",
        "chain:branchCreated",
        "chain:brandRenamed",
        "chain:centralKitchenOpened",
        "chain:kitchenStockReceived",
        "chain:kitchenStockDispatched",
        "chain:regionUnlocked"
      ]
    },


    lease: {
      pageSystem:
        leaseManagementPageSystem,

      view:
        leaseManagementView,

      mode:
        "mount",

      refreshEvents: [
        "lease:signed",
        "lease:renewed",
        "lease:rentArrears",
        "lease:propertyFeeArrears",
        "lease:terminated"
      ]
    },


    settings: {
      pageSystem:
        settingsPageSystem,

      view:
        settingsView,

      mode:
        "mount"
    },


    "brand-investments": {
      pageSystem:
        brandInvestmentPageSystem,

      view:
        brandInvestmentView,

      mode:
        "mount",

      refreshEvents: [
        "brandInvestment:purchased"
      ]
    }
  });


const FORMAL_RUNTIME_PAGE_IDS =
  Object.freeze(
    Object.keys(
      FORMAL_PAGE_DEFINITIONS
    )
  );


class FormalPageRuntime {
  has(
    pageId
  ) {
    return Boolean(
      FORMAL_PAGE_DEFINITIONS[
        pageId
      ]
    );
  }


  getPageIds() {
    return [
      ...FORMAL_RUNTIME_PAGE_IDS
    ];
  }


  mount({
    pageId,
    root,
    restaurantId,
    params = {},
    onNavigate = null
  }) {
    const definition =
      FORMAL_PAGE_DEFINITIONS[
        pageId
      ];


    if (!definition) {
      throw new Error(
        `Formal page "${pageId}" is not registered`
      );
    }


    if (!root) {
      throw new Error(
        "FormalPageRuntime root is required"
      );
    }


    const cleanups = [];

    let renderPage =
      null;


    if (
      definition.mode ===
        "mount" &&
      typeof definition.view
        ?.mount ===
        "function"
    ) {
      definition.view.mount(
        root,
        {
          restaurantId,
          ...params,
          onNavigate
        }
      );
    } else {
      renderPage =
        () => {
          const page =
            definition.pageSystem
              .getPage(
                restaurantId,
                params
              );


          root.innerHTML =
            definition.view
              .renderMarkup(
                page
              );


          return page;
        };


      renderPage();


      if (
        typeof onNavigate ===
        "function"
      ) {
        const handler =
          event => {
            const selector =
              definition.bindDataTarget
                ? (
                    "[data-page-target],"
                    + "[data-target]"
                  )
                : "[data-page-target]";


            const element =
              event.target
                ?.closest?.(
                  selector
                );


            if (
              !element ||
              !root.contains(
                element
              )
            ) {
              return;
            }


            const target =
              element.dataset
                .pageTarget ??
              element.dataset
                .target;


            if (!target) {
              return;
            }


            const navigationParams = {};


            if (
              element.dataset
                .pagePeriod
            ) {
              navigationParams.period =
                element.dataset
                  .pagePeriod;
            }


            if (
              element.dataset
                .employeeId
            ) {
              navigationParams.employeeId =
                element.dataset
                  .employeeId;
            }


            onNavigate(
              target,
              restaurantId,
              navigationParams
            );
          };


        root.addEventListener(
          "click",
          handler
        );


        cleanups.push(
          () => {
            root.removeEventListener(
              "click",
              handler
            );
          }
        );
      }


      for (
        const eventName
        of definition
          .refreshEvents ??
        []
      ) {
        const unsubscribe =
          eventBus.on(
            eventName,
            payload => {
              const changedRestaurantId =
                payload
                  ?.restaurantId ??
                payload
                  ?.settlement
                  ?.restaurantId ??
                payload
                  ?.order
                  ?.restaurantId ??
                null;


              if (
                changedRestaurantId !==
                  null &&
                changedRestaurantId !==
                  restaurantId
              ) {
                return;
              }


              renderPage();
            }
          );


        cleanups.push(
          unsubscribe
        );
      }
    }


    return {
      pageId,

      refresh() {
        return renderPage
          ? renderPage()
          : null;
      },

      destroy() {
        for (
          const cleanup
          of cleanups.splice(
            0
          )
        ) {
          cleanup?.();
        }


        if (
          definition.mode ===
            "mount" &&
          typeof definition.view
            ?.destroy ===
            "function"
        ) {
          definition.view
            .destroy();
        }
      }
    };
  }
}


export const formalPageRuntime =
  new FormalPageRuntime();


export {
  FormalPageRuntime,
  FORMAL_PAGE_DEFINITIONS,
  FORMAL_RUNTIME_PAGE_IDS
};
