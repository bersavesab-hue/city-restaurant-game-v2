import "./systems/WordOfMouthSystem.js";
import "./systems/CustomerLoyaltyIntegrationSystem.js";
import { eventBus } from "./core/EventBus.js";
import { gameState } from "./core/GameState.js";
import { timeSystem } from "./core/TimeSystem.js";
import { saveSystem } from "./core/SaveSystem.js";
import { dataRegistry } from "./core/DataRegistry.js";
import { entitySystem } from "./core/EntitySystem.js";
import { simulationSystem } from "./core/SimulationSystem.js";
import { schedulerSystem } from "./core/SchedulerSystem.js";

import { gameFoundationSystem } from "./systems/GameFoundationSystem.js";
import { economicBaselineSystem } from "./systems/EconomicBaselineSystem.js";
import { cityEconomySystem } from "./systems/CityEconomySystem.js";
import { venueTypeSystem } from "./systems/VenueTypeSystem.js";
import { propertyVenueSystem } from "./systems/PropertyVenueSystem.js";
import { priceHistorySystem } from "./systems/PriceHistorySystem.js";
import { trafficDemandIntegrationSystem } from "./systems/TrafficDemandIntegrationSystem.js";
import { supplierPriceIntegrationSystem } from "./systems/SupplierPriceIntegrationSystem.js";
import { mapViewportSystem } from "./systems/MapViewportSystem.js";

import { restaurantSystem } from "./systems/RestaurantSystem.js";
import { openingFlowSystem } from "./systems/OpeningFlowSystem.js";
import { openingInventorySystem } from "./systems/OpeningInventorySystem.js";
import { openingPermitSystem } from "./systems/OpeningPermitSystem.js";
import { financeSystem } from "./systems/FinanceSystem.js";
import { employeeSystem } from "./systems/EmployeeSystem.js";
import { employeeGenerationSystem } from "./systems/EmployeeGenerationSystem.js";
import { employeeWorkSystem } from "./systems/EmployeeWorkSystem.js";
import { employeeStaffingSystem } from "./systems/EmployeeStaffingSystem.js";
import { employeeCareerSystem } from "./systems/EmployeeCareerSystem.js";
import { employeeDynamicsSystem } from "./systems/EmployeeDynamicsSystem.js";
import { staffingRecommendationSystem } from "./systems/StaffingRecommendationSystem.js";
import { storeProgressSystem } from "./systems/StoreProgressSystem.js";
import { chainSystem } from "./systems/ChainSystem.js";
import { lateGameInvestmentSystem } from "./systems/LateGameInvestmentSystem.js";

import { ingredientCatalogSystem } from "./systems/IngredientCatalogSystem.js";
import { dishRecipeBootstrapSystem } from "./systems/DishRecipeBootstrapSystem.js";
import { inventorySystem } from "./systems/InventorySystem.js";
import { supplierSystem } from "./systems/SupplierSystem.js";
import { supplierBootstrapSystem } from "./systems/SupplierBootstrapSystem.js";
import { supplierTradingSystem } from "./systems/SupplierTradingSystem.js";
import { procurementSystem } from "./systems/ProcurementSystem.js";
import { autoProcurementSystem } from "./systems/AutoProcurementSystem.js";

import { dishCatalogSystem } from "./systems/DishCatalogSystem.js";
import { recipeSystem } from "./systems/RecipeSystem.js";
import { cookingSystem } from "./systems/CookingSystem.js";
import { dishResearchSystem } from "./systems/DishResearchSystem.js";
import { dishResearchPreviewSystem } from "./systems/DishResearchPreviewSystem.js";
import { dishGrowthSystem } from "./systems/DishGrowthSystem.js";
import { dishLifecycleSystem } from "./systems/DishLifecycleSystem.js";
import { restaurantDishSystem } from "./systems/RestaurantDishSystem.js";

import { menuSystem } from "./systems/MenuSystem.js";
import { customerSystem } from "./systems/CustomerSystem.js";
import { customerIdentitySystem } from "./systems/CustomerIdentitySystem.js";
import { customerSegmentSystem } from "./systems/CustomerSegmentSystem.js";
import { customerChoiceSystem } from "./systems/CustomerChoiceSystem.js";
import { customerExperienceSystem } from "./systems/CustomerExperienceSystem.js";
import { reviewInsightSystem } from "./systems/ReviewInsightSystem.js";
import { orderSystem } from "./systems/OrderSystem.js";
import { salesChannelSystem } from "./systems/SalesChannelSystem.js";

import { operatingScheduleSystem } from "./systems/OperatingScheduleSystem.js";
import { trafficSystem } from "./systems/TrafficSystem.js";
import { trafficDemandSystem } from "./systems/TrafficDemandSystem.js";
import { marketCompetitionSystem } from "./systems/MarketCompetitionSystem.js";
import { marketInsightSystem } from "./systems/MarketInsightSystem.js";
import { marketRankingSystem } from "./systems/MarketRankingSystem.js";
import { rankingCenterSystem } from "./systems/RankingCenterSystem.js";
import { competitionMetricsSystem } from "./systems/CompetitionMetricsSystem.js";
import { awardEvaluationSystem } from "./systems/AwardEvaluationSystem.js";
import { awardSystem } from "./systems/AwardSystem.js";
import { awardFeedbackSystem } from "./systems/AwardFeedbackSystem.js";
import { honorArchiveSystem } from "./systems/HonorArchiveSystem.js";
import { marketActionSystem } from "./systems/MarketActionSystem.js";
import { districtEventSystem } from "./systems/DistrictEventSystem.js";
import { businessCalendarSystem } from "./systems/BusinessCalendarSystem.js";
import { restaurantPositioningSystem } from "./systems/RestaurantPositioningSystem.js";
import { competitorDynamicsSystem } from "./systems/CompetitorDynamicsSystem.js";
import { seatingSystem } from "./systems/SeatingSystem.js";
import { renovationSystem } from "./systems/RenovationSystem.js";
import { renovationConstructionSystem } from "./systems/RenovationConstructionSystem.js";
import { equipmentMaintenanceSystem } from "./systems/EquipmentMaintenanceSystem.js";
import { layoutFlowSystem } from "./systems/LayoutFlowSystem.js";
import { renovationPlanningSystem } from "./systems/RenovationPlanningSystem.js";
import { renovationEditorSystem } from "./systems/RenovationEditorSystem.js";
import { renovationMobilePageSystem } from "./ui/renovation/RenovationMobilePageSystem.js";
import { restaurantHomePageSystem } from "./ui/pages/restaurant/RestaurantHomePageSystem.js";
import { openingSetupPageSystem } from "./ui/pages/opening/OpeningSetupPageSystem.js";
import { cityPropertyPageSystem } from "./ui/pages/city/CityPropertyPageSystem.js";
import { dishCenterPageSystem } from "./ui/pages/dishes/DishCenterPageSystem.js";
import { businessAnalyticsPageSystem } from "./ui/pages/analytics/BusinessAnalyticsPageSystem.js";
import { supplyManagementPageSystem } from "./ui/pages/supply/SupplyManagementPageSystem.js";
import { dishManagementSystem } from "./systems/DishManagementSystem.js";
import { employeeManagementPageSystem } from "./ui/pages/employees/EmployeeManagementPageSystem.js";
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
import { propertyMarketSystem } from "./systems/PropertyMarketSystem.js";
import { propertyLeaseMarketSystem } from "./systems/PropertyLeaseMarketSystem.js";
import { leaseSystem } from "./systems/LeaseSystem.js";

function bootstrap() {
  gameFoundationSystem.initialize({
    seedProperties: false,
    overwriteReferenceData: true
  });

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
      gameFoundationSystem,
      economicBaselineSystem,
      cityEconomySystem,
      venueTypeSystem,
      propertyVenueSystem,
      priceHistorySystem,
      trafficDemandIntegrationSystem,
      supplierPriceIntegrationSystem,
      mapViewportSystem,

      restaurantSystem,
      openingFlowSystem,
      openingPermitSystem,
      openingInventorySystem,
      financeSystem,
      employeeSystem,
      employeeGenerationSystem,
      employeeWorkSystem,
      employeeStaffingSystem,
      employeeCareerSystem,
      employeeDynamicsSystem,
      staffingRecommendationSystem,
      storeProgressSystem,
      chainSystem,
      lateGameInvestmentSystem,

      ingredientCatalogSystem,
      dishRecipeBootstrapSystem,
      inventorySystem,
      supplierSystem,
      supplierBootstrapSystem,
      supplierTradingSystem,
      procurementSystem,
      autoProcurementSystem,

      dishCatalogSystem,
      recipeSystem,
      cookingSystem,
      dishResearchSystem,
      dishResearchPreviewSystem,
      dishGrowthSystem,
      dishLifecycleSystem,
      restaurantDishSystem,
      dishManagementSystem,

      menuSystem,
      customerSystem,
      customerIdentitySystem,
      customerSegmentSystem,
      customerChoiceSystem,
      customerExperienceSystem,
      reviewInsightSystem,
      orderSystem,
      salesChannelSystem,

      operatingScheduleSystem,
      trafficSystem,
      trafficDemandSystem,
      marketCompetitionSystem,
      marketInsightSystem,
      marketRankingSystem,
      rankingCenterSystem,
      competitionMetricsSystem,
      awardEvaluationSystem,
      awardSystem,
      awardFeedbackSystem,
      honorArchiveSystem,
      marketActionSystem,
      districtEventSystem,
      businessCalendarSystem,
      restaurantPositioningSystem,
      competitorDynamicsSystem,
      seatingSystem,
      renovationSystem,
      renovationConstructionSystem,
      equipmentMaintenanceSystem,
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
      propertyMarketSystem,
      propertyLeaseMarketSystem,
      leaseSystem
    },

    ui: {
      pageRegistry,
      restaurantHomePageSystem,
      openingSetupPageSystem,
      cityPropertyPageSystem,
      employeeManagementPageSystem,
      supplyManagementPageSystem,
      businessAnalyticsPageSystem
    }
  };
}

export const app = bootstrap();
export { bootstrap };
