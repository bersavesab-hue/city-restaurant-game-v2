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

class OrderSystem {
  place({
    restaurantId,
    customerId = null,
    items,
    chefId = null
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

    if (customerId !== null) {
      customer = customerSystem.get(customerId);

      if (totalRevenue > customer.budget) {
        throw new Error("Customer budget insufficient");
      }
    }

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
    }

    const averageQuality = Math.round(
      qualityTotal / portionTotal
    );

    const payment = financeSystem.income(
      restaurantId,
      totalRevenue,
      FINANCE_CATEGORY.SALES,
      "餐厅营业收入"
    );

    const time = gameState.getSection("time");

    const order = entitySystem.create(
      "customer_order",
      {
        restaurantId,
        customerId,

        chefEmployeeId:
          chef.employee.id,

        chefSkill:
          chef.effectiveSkill,

        status: "completed",
        items: completedItems,
        totalRevenue,
        ingredientCost,
        grossProfit:
          totalRevenue - ingredientCost,
        averageQuality,
        transactionId: payment.transaction.id,
        createdAt: time.totalMinutes,
        day: time.day
      }
    );

    if (customer) {
      customerSystem.recordVisit({
        customerId,
        restaurantId,
        orderId: order.id,
        spend: totalRevenue,
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
    chefId = null
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

    const payment =
      financeSystem.income(
        restaurantId,
        totalRevenue,
        FINANCE_CATEGORY.SALES,
        "长期模拟营业收入"
      );

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
            totalRevenue -
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
