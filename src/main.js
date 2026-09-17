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
import { employeeWorkSystem } from "./systems/EmployeeWorkSystem.js";
import { storeProgressSystem } from "./systems/StoreProgressSystem.js";

import { ingredientCatalogSystem } from "./systems/IngredientCatalogSystem.js";
import { inventorySystem } from "./systems/InventorySystem.js";
import { supplierSystem } from "./systems/SupplierSystem.js";
import { procurementSystem } from "./systems/ProcurementSystem.js";
import { autoProcurementSystem } from "./systems/AutoProcurementSystem.js";

import { dishCatalogSystem } from "./systems/DishCatalogSystem.js";
import { recipeSystem } from "./systems/RecipeSystem.js";
import { cookingSystem } from "./systems/CookingSystem.js";
import { dishResearchSystem } from "./systems/DishResearchSystem.js";
import { dishGrowthSystem } from "./systems/DishGrowthSystem.js";

import { menuSystem } from "./systems/MenuSystem.js";
import { customerSystem } from "./systems/CustomerSystem.js";
import { customerSegmentSystem } from "./systems/CustomerSegmentSystem.js";
import { customerChoiceSystem } from "./systems/CustomerChoiceSystem.js";
import { customerExperienceSystem } from "./systems/CustomerExperienceSystem.js";
import { reviewInsightSystem } from "./systems/ReviewInsightSystem.js";
import { CUSTOMER_SEGMENTS } from "./data/customerSegments.js";
import { orderSystem } from "./systems/OrderSystem.js";

import { operatingScheduleSystem } from "./systems/OperatingScheduleSystem.js";
import { trafficSystem } from "./systems/TrafficSystem.js";
import { trafficDemandSystem } from "./systems/TrafficDemandSystem.js";
import { marketCompetitionSystem } from "./systems/MarketCompetitionSystem.js";
import { marketInsightSystem } from "./systems/MarketInsightSystem.js";
import { marketRankingSystem } from "./systems/MarketRankingSystem.js";
import { marketActionSystem } from "./systems/MarketActionSystem.js";
import { districtEventSystem } from "./systems/DistrictEventSystem.js";
import { businessCalendarSystem } from "./systems/BusinessCalendarSystem.js";
import { restaurantPositioningSystem } from "./systems/RestaurantPositioningSystem.js";
import { competitorDynamicsSystem } from "./systems/CompetitorDynamicsSystem.js";
import { seatingSystem } from "./systems/SeatingSystem.js";
import { renovationSystem } from "./systems/RenovationSystem.js";
import { layoutFlowSystem } from "./systems/LayoutFlowSystem.js";
import { renovationPlanningSystem } from "./systems/RenovationPlanningSystem.js";
import { renovationEditorSystem } from "./systems/RenovationEditorSystem.js";
import { renovationMobilePageSystem } from "./ui/renovation/RenovationMobilePageSystem.js";
import { restaurantHomePageSystem } from "./ui/pages/restaurant/RestaurantHomePageSystem.js";
import { cityPropertyPageSystem } from "./ui/pages/city/CityPropertyPageSystem.js";
import { pageRegistry } from "./ui/registry/PageRegistry.js";
import "./ui/registry/defaultPages.js";
import { dailySettlementSystem } from "./systems/DailySettlementSystem.js";
import { operatingAnalyticsSystem } from "./systems/OperatingAnalyticsSystem.js";
import { operatingReportSystem } from "./systems/OperatingReportSystem.js";
import { historyArchiveSystem } from "./systems/HistoryArchiveSystem.js";
import { operatingCycleSystem } from "./systems/OperatingCycleSystem.js";
import { districtSystem } from "./systems/DistrictSystem.js";
import { propertySystem } from "./systems/PropertySystem.js";
import { propertyFloorplanSystem } from "./systems/PropertyFloorplanSystem.js";
import { leaseSystem } from "./systems/LeaseSystem.js";

function bootstrap() {
  customerSegmentSystem.load(
    CUSTOMER_SEGMENTS,
    { overwrite: true }
  );

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
      employeeWorkSystem,
      storeProgressSystem,

      ingredientCatalogSystem,
      inventorySystem,
      supplierSystem,
      procurementSystem,
      autoProcurementSystem,

      dishCatalogSystem,
      recipeSystem,
      cookingSystem,
      dishResearchSystem,
      dishGrowthSystem,

      menuSystem,
      customerSystem,
      customerSegmentSystem,
      customerChoiceSystem,
      customerExperienceSystem,
      reviewInsightSystem,
      orderSystem,

      operatingScheduleSystem,
      trafficSystem,
      trafficDemandSystem,
      marketCompetitionSystem,
      marketInsightSystem,
      marketRankingSystem,
      marketActionSystem,
      districtEventSystem,
      businessCalendarSystem,
      restaurantPositioningSystem,
      competitorDynamicsSystem,
      seatingSystem,
      renovationSystem,
      layoutFlowSystem,
      renovationPlanningSystem,
      renovationEditorSystem,
      renovationMobilePageSystem,
      dailySettlementSystem,
      operatingAnalyticsSystem,
      operatingReportSystem,
      historyArchiveSystem,
      operatingCycleSystem,

      districtSystem,
      propertySystem,
      propertyFloorplanSystem,
      leaseSystem
    },

    ui: {
      pageRegistry,
      restaurantHomePageSystem,
      cityPropertyPageSystem
    }
  };
}

export const app = bootstrap();
export { bootstrap };
