import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  openingFlowSystem
} from "./OpeningFlowSystem.js";


const ONBOARDING_STEPS =
  Object.freeze([
    Object.freeze({
      id: "location",
      title: "完成选址",
      description: "先为门店签下正式经营铺位。",
      pageId: "properties"
    }),

    Object.freeze({
      id: "renovation",
      title: "完成基础装修",
      description: "布置餐位、后厨和服务区域，并完成施工。",
      pageId: "renovation"
    }),

    Object.freeze({
      id: "staff",
      title: "配置员工",
      description: "至少配置1名可工作的厨师和1名服务员。",
      pageId: "employee_recruitment"
    }),

    Object.freeze({
      id: "menu",
      title: "准备营业菜单",
      description: "至少上架一道正式菜品。",
      pageId: "dishes"
    }),

    Object.freeze({
      id: "inventory",
      title: "准备首批库存",
      description: "采购营业所需食材，避免开门后无货可卖。",
      pageId: "supply"
    }),

    Object.freeze({
      id: "opening",
      title: "开始营业",
      description: "完成证照、厨师与服务员、菜单、首批库存和营业时间后正式开业。",
      pageId: "opening-setup"
    }),

    Object.freeze({
      id: "first_order",
      title: "完成第一单",
      description: "让门店完成第一笔真实顾客订单。",
      pageId: "restaurant"
    })
  ]);


class OnboardingSystem {
  getOrderCount(
    restaurantId
  ) {
    return entitySystem
      .filter(
        "customer_order",
        item =>
          item.restaurantId ===
            restaurantId &&
          item.status ===
            "completed"
      )
      .length;
  }


  getState(
    restaurantId
  ) {
    const openingStatus =
      openingFlowSystem
        .getStatus(
          restaurantId
        );

    const restaurant =
      openingStatus
        .restaurant;

    const stepById =
      new Map(
        openingStatus
          .steps
          .map(
            step => [
              step.id,
              step
            ]
          )
      );

    const completedOrders =
      this.getOrderCount(
        restaurantId
      );

    const observed = {
      location:
        Boolean(
          stepById.get(
            "lease"
          )?.complete
        ),

      renovation:
        Boolean(
          stepById.get(
            "renovation"
          )?.complete
        ),

      staff:
        Boolean(
          stepById.get(
            "staff"
          )?.complete
        ),

      menu:
        Boolean(
          stepById.get(
            "menu"
          )?.complete
        ),

      inventory:
        Boolean(
          stepById.get(
            "stock"
          )?.complete
        ),

      opening:
        Boolean(
          openingStatus
            .hasOpened
        ),

      first_order:
        completedOrders >
          0 ||
        (
          restaurant
            .totalServedGuests ??
          0
        ) >
          0
    };

    const previousMilestones =
      restaurant
        .onboardingMilestones ??
      {};


    const completion =
      Object.fromEntries(
        ONBOARDING_STEPS
          .map(
            step => [
              step.id,
              Boolean(
                previousMilestones[
                  step.id
                ] ||
                observed[
                  step.id
                ]
              )
            ]
          )
      );


    const milestoneChanged =
      ONBOARDING_STEPS
        .some(
          step =>
            completion[
              step.id
            ] &&
            !previousMilestones[
              step.id
            ]
        );


    if (
      milestoneChanged
    ) {
      entitySystem.update(
        "restaurant",
        restaurantId,
        {
          onboardingMilestones: {
            ...previousMilestones,
            ...completion
          }
        }
      );
    }

    const steps =
      ONBOARDING_STEPS
        .map(
          (
            step,
            index
          ) => ({
            ...step,
            order:
              index + 1,
            completed:
              Boolean(
                completion[
                  step.id
                ]
              )
          })
        );

    const nextStep =
      steps.find(
        item =>
          !item.completed
      ) ??
      null;

    const completedCount =
      steps.filter(
        item =>
          item.completed
      ).length;

    const actionableNextStep =
      nextStep?.id ===
        "opening" &&
      !openingStatus
        .canOpen
        ? {
            ...nextStep,
            title:
              "完成开业准备",
            description:
              openingStatus
                .nextAction
                ?.description ??
              "完成剩余开业条件。",
            pageId:
              openingFlowSystem
                .getRecommendedPage(
                  restaurantId
                )
          }
        : nextStep;

    return {
      restaurantId,
      completed:
        completedCount ===
        steps.length,
      completedCount,
      totalSteps:
        steps.length,
      progress:
        Math.round(
          completedCount /
          steps.length *
          100
        ),
      steps,
      nextStep:
        actionableNextStep
    };
  }
}


export const onboardingSystem =
  new OnboardingSystem();


export {
  OnboardingSystem,
  ONBOARDING_STEPS
};
