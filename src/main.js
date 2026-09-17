import { eventBus } from "./core/EventBus.js";
import { gameState } from "./core/GameState.js";
import { timeSystem } from "./core/TimeSystem.js";
import { saveSystem } from "./core/SaveSystem.js";
import { dataRegistry } from "./core/DataRegistry.js";
import { entitySystem } from "./core/EntitySystem.js";
import { simulationSystem } from "./core/SimulationSystem.js";
import { schedulerSystem } from "./core/SchedulerSystem.js";

import { restaurantSystem } from "./systems/RestaurantSystem.js";
import { financeSystem } from "./systems/FinanceSystem.js";
import { employeeSystem } from "./systems/EmployeeSystem.js";
import { storeProgressSystem } from "./systems/StoreProgressSystem.js";

import { ingredientCatalogSystem } from "./systems/IngredientCatalogSystem.js";
import { inventorySystem } from "./systems/InventorySystem.js";
import { supplierSystem } from "./systems/SupplierSystem.js";
import { procurementSystem } from "./systems/ProcurementSystem.js";

import { dishCatalogSystem } from "./systems/DishCatalogSystem.js";
import { recipeSystem } from "./systems/RecipeSystem.js";
import { cookingSystem } from "./systems/CookingSystem.js";

import { menuSystem } from "./systems/MenuSystem.js";
import { customerSystem } from "./systems/CustomerSystem.js";
import { orderSystem } from "./systems/OrderSystem.js";

import { operatingScheduleSystem } from "./systems/OperatingScheduleSystem.js";
import { trafficSystem } from "./systems/TrafficSystem.js";
import { dailySettlementSystem } from "./systems/DailySettlementSystem.js";
import { operatingCycleSystem } from "./systems/OperatingCycleSystem.js";

function bootstrap() {
  operatingCycleSystem.register();

  return {
    core: {
      eventBus,
      gameState,
      timeSystem,
      saveSystem,
      dataRegistry,
      entitySystem,
      simulationSystem,
      schedulerSystem
    },

    systems: {
      restaurantSystem,
      financeSystem,
      employeeSystem,
      storeProgressSystem,

      ingredientCatalogSystem,
      inventorySystem,
      supplierSystem,
      procurementSystem,

      dishCatalogSystem,
      recipeSystem,
      cookingSystem,

      menuSystem,
      customerSystem,
      orderSystem,

      operatingScheduleSystem,
      trafficSystem,
      dailySettlementSystem,
      operatingCycleSystem
    }
  };
}

export const app = bootstrap();
export { bootstrap };
