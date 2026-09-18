import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";
import { eventBus } from "../core/EventBus.js";

import { restaurantSystem } from "./RestaurantSystem.js";
import {
  financeSystem,
  FINANCE_CATEGORY
} from "./FinanceSystem.js";

import { menuSystem } from "./MenuSystem.js";
import { recipeSystem } from "./RecipeSystem.js";
import { inventorySystem } from "./InventorySystem.js";
import { cookingSystem } from "./CookingSystem.js";
import { customerSystem } from "./CustomerSystem.js";
import { employeeWorkSystem } from "./EmployeeWorkSystem.js";
import { marketActionSystem } from "./MarketActionSystem.js";
import { customerLoyaltySystem } from "./CustomerLoyaltySystem.js";
import { memberBenefitSystem } from "./MemberBenefitSystem.js";
import { salesChannelSystem } from "./SalesChannelSystem.js";
import { dishLifecycleSystem } from "./DishLifecycleSystem.js";

class OrderSystem {
  place({
    restaurantId,
    customerId = null,
    customerSegmentId = null,
    items,
    chefId = null,
    couponId = null,
    redeemPoints = 0,
    channelId = "dine_in"
  }) {
    if (!restaurantSystem.isOpen(restaurantId)) {
      throw new Error("Restaurant must be open");
    }

    financeSystem.getAccount(restaurantId);

    const chef =
      employeeWorkSystem.requireChef(
        restaurantId,
        chefId
      );

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Order requires items");
    }

    const priceMultiplier =
      marketActionSystem
        .getModifiers(
          restaurantId
        )
        .priceMultiplier;

    const lines = [];
    const requirements = new Map();
    let totalRevenue = 0;

    for (const item of items) {
      if (
        !item ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        throw new Error("Invalid order item");
      }

      const menuItem = menuSystem.get(item.menuItemId);

      if (
        menuItem.restaurantId !== restaurantId ||
        !menuItem.active
      ) {
        throw new Error("Invalid menu item");
      }

      const recipe = recipeSystem.get(menuItem.recipeId);

      if (!recipe) {
        throw new Error("Recipe does not exist");
      }

      const ingredientEfficiency =
        Number.isFinite(
          recipe.ingredientEfficiency
        )
          ? Math.max(
              0.85,
              Math.min(
                1,
                recipe.ingredientEfficiency
              )
            )
          : 1;

      for (const ingredient of recipe.ingredients) {
        const amount =
          ingredient.quantity *
          item.quantity *
          ingredientEfficiency;

        requirements.set(
          ingredient.ingredientId,
          (requirements.get(ingredient.ingredientId) ?? 0) + amount
        );
      }

      const effectiveUnitPrice =
        Math.max(
          1,
          Math.round(
            menuItem.price *
            priceMultiplier
          )
        );

      const revenue =
        effectiveUnitPrice *
        item.quantity;

      totalRevenue += revenue;

      lines.push({
        menuItem,
        recipe,
        quantity: item.quantity,
        revenue
      });
    }

    for (const [ingredientId, quantity] of requirements) {
      const available =
        inventorySystem.getAvailableQuantity(
          restaurantId,
          ingredientId
        );

      if (available < quantity) {
        throw new Error(
          `Insufficient inventory for "${ingredientId}"`
        );
      }
    }

    let customer = null;
    let memberCheckout = null;
    let paidAmount = totalRevenue;

    if (customerId !== null) {
      customer =
        customerSystem.get(customerId);

      const member =
        customerLoyaltySystem.findMember(
          restaurantId,
          customerId
        );

      if (member) {
        memberCheckout =
          memberBenefitSystem.previewCheckout({
            restaurantId,
            customerId,
            subtotal: totalRevenue,
            couponId,
            redeemPoints
          });

        paidAmount =
          memberCheckout.finalAmount;
      } else if (
        couponId !== null ||
        redeemPoints > 0
      ) {
        throw new Error(
          "Member benefits require membership"
        );
      }

      if (paidAmount > customer.budget) {
        throw new Error(
          "Customer budget insufficient"
        );
      }
    }

    salesChannelSystem
      .ensureRestaurantChannels(
        restaurantId
      );

    salesChannelSystem
      .assertCapacity(
        restaurantId,
        channelId,
        1
      );

    const channelSettlement =
      salesChannelSystem
        .calculateSettlement({
          restaurantId,
          channelId,
          grossRevenue:
            paidAmount,
          orderCount: 1
        });

    const completedItems = [];
    let ingredientCost = 0;
    let qualityTotal = 0;
    let portionTotal = 0;

    for (const line of lines) {
      const cooking = cookingSystem.cook({
        restaurantId,
        recipeId: line.recipe.id,
        portions: line.quantity,
        chefSkill:
          chef.effectiveSkill
      });

      employeeWorkSystem.recordWork(
        chef.employee.id,
        Math.max(
          5,
          line.recipe.cookingMinutes *
          line.quantity
        )
      );

      ingredientCost += cooking.ingredientCost;
      qualityTotal +=
        cooking.qualityScore * line.quantity;
      portionTotal += line.quantity;

      completedItems.push({
        menuItemId: line.menuItem.id,
        dishId: line.menuItem.dishId,
        quantity: line.quantity,
        unitPrice:
          Math.max(
            1,
            Math.round(
              line.menuItem.price *
              priceMultiplier
            )
          ),
        revenue: line.revenue,
        cookingRecordId: cooking.id,
        qualityScore: cooking.qualityScore
      });

      menuSystem.recordSale(
        line.menuItem.id,
        line.quantity,
        line.revenue
      );

      dishLifecycleSystem.recordService({
        restaurantId,
        dishId:
          line.menuItem.dishId,
        quantity:
          line.quantity,
        revenue:
          line.revenue,
        ingredientCost:
          cooking.ingredientCost,
        outputQualityScore:
          cooking.qualityScore
      });
    }

    const averageQuality = Math.round(
      qualityTotal / portionTotal
    );

    const payment =
      paidAmount > 0
        ? financeSystem.income(
            restaurantId,
            paidAmount,
            FINANCE_CATEGORY.SALES,
            "餐厅营业收入"
          )
        : null;

    let channelCommissionPayment = null;
    let channelPackagingPayment = null;

    if (
      channelSettlement.commission >
      0
    ) {
      channelCommissionPayment =
        financeSystem.expense(
          restaurantId,
          channelSettlement.commission,
          FINANCE_CATEGORY.OTHER,
          `渠道佣金：${channelId}`
        );
    }

    if (
      channelSettlement.packagingCost >
      0
    ) {
      channelPackagingPayment =
        financeSystem.expense(
          restaurantId,
          channelSettlement.packagingCost,
          FINANCE_CATEGORY.OTHER,
          `渠道包装费：${channelId}`
        );
    }

    const time = gameState.getSection("time");

    let order = entitySystem.create(
      "customer_order",
      {
        restaurantId,
        customerId,
        customerSegmentId,

        channelId,

        chefEmployeeId:
          chef.employee.id,

        chefSkill:
          chef.effectiveSkill,

        status: "completed",
        items: completedItems,
        grossRevenue:
          totalRevenue,

        totalRevenue:
          paidAmount,

        paidAmount,

        memberDiscount:
          memberCheckout?.levelDiscount ?? 0,

        couponDiscount:
          memberCheckout?.couponDiscount ?? 0,

        pointDiscount:
          memberCheckout?.pointDiscount ?? 0,

        totalDiscount:
          memberCheckout?.totalDiscount ?? 0,

        couponId:
          memberCheckout?.couponId ?? null,

        pointsUsed:
          memberCheckout?.pointsUsed ?? 0,

        memberLevelId:
          memberCheckout?.memberLevelId ?? null,

        benefitRecordId: null,

        paidAmount:
          paidAmount,

        channelGrossRevenue:
          channelSettlement.grossRevenue,

        channelCommission:
          channelSettlement.commission,

        channelPackagingCost:
          channelSettlement.packagingCost,

        channelFees:
          channelSettlement.fees,

        channelNetRevenue:
          channelSettlement.netRevenue,

        channelCommissionTransactionId:
          channelCommissionPayment
            ?.transaction?.id ??
          null,

        channelPackagingTransactionId:
          channelPackagingPayment
            ?.transaction?.id ??
          null,

        ingredientCost,

        grossProfit:
          channelSettlement.netRevenue -
          ingredientCost,

        averageQuality,

        transactionId:
          payment?.transaction?.id ?? null,
        createdAt: time.totalMinutes,
        day: time.day
      }
    );

    salesChannelSystem
      .recordSettlement(
        channelSettlement
      );

    if (memberCheckout) {
      const committed =
        memberBenefitSystem.commitCheckout({
          restaurantId,
          customerId,
          subtotal: totalRevenue,
          couponId,
          redeemPoints,
          orderId: order.id
        });

      order =
        entitySystem.update(
          "customer_order",
          order.id,
          {
            memberDiscount:
              committed.levelDiscount,

            couponDiscount:
              committed.couponDiscount,

            pointDiscount:
              committed.pointDiscount,

            totalDiscount:
              committed.totalDiscount,

            paidAmount:
              committed.finalAmount,

            totalRevenue:
              committed.finalAmount,

            pointsUsed:
              committed.pointsUsed,

            couponId:
              committed.couponId,

            benefitRecordId:
              committed.recordId
          }
        );

      if (committed.couponId) {
        const usedCoupon =
          entitySystem.get(
            "member_coupon",
            committed.couponId
          );

        if (usedCoupon?.campaignId) {
          memberBenefitSystem
            .recordCampaignConversion({
              campaignId:
                usedCoupon.campaignId,

              customerId,

              orderId:
                order.id,

              revenue:
                committed.finalAmount
            });
        }
      }
    }

    if (customer) {
      customerSystem.recordVisit({
        customerId,
        restaurantId,
        orderId: order.id,
        spend: paidAmount,
        satisfaction: averageQuality
      });
    }

    eventBus.emit("order:completed", {
      order: structuredClone(order)
    });

    return order;
  }

  placeBulk({
    restaurantId,
    menuItemId,
    portions,
    orderCount,
    chefId = null,
    channelId = "dine_in"
  }) {
    financeSystem.getAccount(
      restaurantId
    );

    if (
      !Number.isInteger(portions) ||
      portions <= 0 ||
      !Number.isInteger(orderCount) ||
      orderCount <= 0
    ) {
      throw new Error(
        "Invalid bulk order"
      );
    }

    const chef =
      employeeWorkSystem.requireChef(
        restaurantId,
        chefId
      );

    const menuItem =
      menuSystem.get(menuItemId);

    if (
      menuItem.restaurantId !==
        restaurantId ||
      !menuItem.active
    ) {
      throw new Error(
        "Invalid menu item"
      );
    }

    const recipe =
      recipeSystem.get(
        menuItem.recipeId
      );

    const cooking =
      cookingSystem.cook({
        restaurantId,
        recipeId: recipe.id,
        portions,
        chefSkill:
          chef.effectiveSkill
      });

    const priceMultiplier =
      marketActionSystem
        .getModifiers(
          restaurantId
        )
        .priceMultiplier;

    const effectiveUnitPrice =
      Math.max(
        1,
        Math.round(
          menuItem.price *
          priceMultiplier
        )
      );

    const totalRevenue =
      effectiveUnitPrice *
      portions;

    menuSystem.recordSale(
      menuItem.id,
      portions,
      totalRevenue
    );

    dishLifecycleSystem.recordService({
      restaurantId,
      dishId:
        menuItem.dishId,
      quantity:
        portions,
      revenue:
        totalRevenue,
      ingredientCost:
        cooking.ingredientCost,
      outputQualityScore:
        cooking.qualityScore
    });

    salesChannelSystem
      .ensureRestaurantChannels(
        restaurantId
      );

    const channelSettlement =
      salesChannelSystem
        .calculateSettlement({
          restaurantId,
          channelId,
          grossRevenue:
            totalRevenue,
          orderCount
        });

    const payment =
      financeSystem.income(
        restaurantId,
        totalRevenue,
        FINANCE_CATEGORY.SALES,
        "长期模拟营业收入"
      );

    let channelCommissionPayment = null;
    let channelPackagingPayment = null;

    if (
      channelSettlement.commission >
      0
    ) {
      channelCommissionPayment =
        financeSystem.expense(
          restaurantId,
          channelSettlement.commission,
          FINANCE_CATEGORY.OTHER,
          `渠道佣金：${channelId}`
        );
    }

    if (
      channelSettlement.packagingCost >
      0
    ) {
      channelPackagingPayment =
        financeSystem.expense(
          restaurantId,
          channelSettlement.packagingCost,
          FINANCE_CATEGORY.OTHER,
          `渠道包装费：${channelId}`
        );
    }

    const time =
      gameState.getSection("time");

    const order =
      entitySystem.create(
        "customer_order",
        {
          restaurantId,
          customerId: null,

          aggregate: true,
          orderCount,
          status: "completed",

          channelId,

          channelGrossRevenue:
            channelSettlement.grossRevenue,

          channelCommission:
            channelSettlement.commission,

          channelPackagingCost:
            channelSettlement.packagingCost,

          channelFees:
            channelSettlement.fees,

          channelNetRevenue:
            channelSettlement.netRevenue,

          channelCommissionTransactionId:
            channelCommissionPayment
              ?.transaction?.id ??
            null,

          channelPackagingTransactionId:
            channelPackagingPayment
              ?.transaction?.id ??
            null,

          paidAmount:
            totalRevenue,

          chefEmployeeId:
            chef.employee.id,

          chefSkill:
            chef.effectiveSkill,

          items: [
            {
              menuItemId:
                menuItem.id,
              dishId:
                menuItem.dishId,
              quantity:
                portions,
              unitPrice:
                effectiveUnitPrice,
              revenue:
                totalRevenue,
              cookingRecordId:
                cooking.id,
              qualityScore:
                cooking.qualityScore
            }
          ],

          totalRevenue,

          ingredientCost:
            cooking.ingredientCost,

          grossProfit:
            channelSettlement.netRevenue -
            cooking.ingredientCost,

          averageQuality:
            cooking.qualityScore,

          transactionId:
            payment.transaction.id,

          createdAt:
            time.totalMinutes,

          day:
            time.day
        }
      );

    salesChannelSystem
      .recordSettlement(
        channelSettlement
      );

    eventBus.emit(
      "order:completed",
      {
        order:
          structuredClone(order)
      }
    );

    return order;
  }

  get(id) {
    const order = entitySystem.get("customer_order", id);

    if (!order) {
      throw new Error(`Order "${id}" does not exist`);
    }

    return order;
  }

  listByRestaurant(restaurantId) {
    return entitySystem
      .list("customer_order")
      .filter(
        (order) => order.restaurantId === restaurantId
      );
  }
}

export const orderSystem = new OrderSystem();
export { OrderSystem };
