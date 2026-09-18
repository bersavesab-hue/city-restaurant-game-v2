import {
  COMPETITOR_TEMPLATE_SCHEMA_VERSION
} from "./competitorRules.js";

const R = (min, max) =>
  Object.freeze({ min, max });

const S = (
  stable = 1,
  discount = 1,
  premium = 1,
  quality = 1,
  service = 1,
  promotion = 1
) => Object.freeze({
  stable,
  discount,
  premium,
  quality,
  service,
  promotion
});

function T({
  id, name, category, weight = 1,
  strength, price, dish, service, reputation,
  venues, segments, districts, strategies,
  marketing, expansion, discount, resilience, innovation
}) {
  return Object.freeze({
    schemaVersion: COMPETITOR_TEMPLATE_SCHEMA_VERSION,
    id,
    name,
    category,
    baseWeight: weight,
    strengthRange: R(strength[0], strength[1]),
    priceIndexRange: R(price[0], price[1]),
    dishStrengthRange: R(dish[0], dish[1]),
    serviceRange: R(service[0], service[1]),
    reputationRange: R(reputation[0], reputation[1]),
    venueTypeFocus: Object.freeze([...venues]),
    segmentWeights: Object.freeze({ ...segments }),
    districtWeights: Object.freeze({ ...districts }),
    strategyWeights: strategies,
    marketingTendency: marketing,
    expansionTendency: expansion,
    discountAggression: discount,
    resilience,
    innovationTendency: innovation
  });
}

export const COMPETITOR_TEMPLATES_V1 = Object.freeze([
  T({id:"breakfast_express",name:"早餐高周转店",category:"breakfast",weight:1.15,strength:[1,3],price:[0.68,0.96],dish:[42,68],service:[45,70],reputation:[35,66],venues:["breakfast_store","street_shop"],segments:{breakfast_commuter:2.2,office_worker:1.4,senior:1.1},districts:{transport_hub:2,residential:1.5,medical_cluster:1.35,wholesale_market:1.4,office_park:1.3},strategies:S(1.4,1.8,0.2,0.8,1,1.3),marketing:42,expansion:58,discount:72,resilience:62,innovation:36}),
  T({id:"street_budget_noodles",name:"街头平价主食店",category:"budget_quick",weight:1.25,strength:[1,3],price:[0.7,0.98],dish:[46,72],service:[42,68],reputation:[38,70],venues:["street_shop","fast_service_store"],segments:{blue_collar:1.8,student:1.5,solo_diner:1.4,local_regular:1.4},districts:{old_town:1.6,industrial_park:1.7,wholesale_market:1.7,residential:1.35},strategies:S(1.5,2,0.2,1,0.8,1),marketing:36,expansion:48,discount:80,resilience:68,innovation:28}),
  T({id:"neighborhood_home_cooking",name:"社区家常菜馆",category:"community",weight:1.35,strength:[1,4],price:[0.82,1.08],dish:[52,78],service:[52,76],reputation:[48,78],venues:["community_store","street_shop"],segments:{resident:2,family_with_children:1.6,senior:1.3,local_regular:1.8},districts:{residential:2.1,suburban_community:2,old_town:1.3,medical_cluster:1.25},strategies:S(2,0.8,0.3,1.5,1.4,0.8),marketing:38,expansion:42,discount:48,resilience:78,innovation:34}),
  T({id:"office_quick_meal",name:"写字楼效率餐",category:"office_quick",weight:1.1,strength:[2,4],price:[0.92,1.18],dish:[55,78],service:[58,82],reputation:[48,76],venues:["office_restaurant","fast_service_store"],segments:{office_worker:2.4,young_professional:1.8,takeaway_commuter:1.4},districts:{cbd:1.8,office_park:2.3,tech_park:2,commercial_core:1.25},strategies:S(1.2,1,0.5,1,1.8,1.4),marketing:58,expansion:66,discount:52,resilience:60,innovation:64}),
  T({id:"campus_value_bowl",name:"校园性价比餐",category:"campus_value",weight:1.15,strength:[1,3],price:[0.65,0.9],dish:[44,68],service:[42,66],reputation:[36,68],venues:["campus_store","fast_service_store"],segments:{student:3,budget_family:0.8,social_group:1.1},districts:{university:3,tech_park:0.8},strategies:S(1,2.4,0.1,0.8,0.6,1.8),marketing:68,expansion:62,discount:88,resilience:54,innovation:58}),
  T({id:"delivery_kitchen",name:"外卖专营厨房",category:"delivery_first",weight:0.9,strength:[2,4],price:[0.78,1.08],dish:[52,78],service:[50,78],reputation:[38,72],venues:["cloud_kitchen","deli_takeaway_store"],segments:{delivery_heavy:2.8,office_worker:1.5,student:1.3,young_professional:1.5},districts:{university:1.6,office_park:2.1,tech_park:2.2,cbd:1.7,residential:1.35},strategies:S(0.8,1.5,0.3,1.3,1,2.2),marketing:84,expansion:72,discount:70,resilience:52,innovation:82}),
  T({id:"mall_fast_casual",name:"商场休闲快餐",category:"mall_fast_casual",weight:1,strength:[2,4],price:[0.98,1.28],dish:[56,80],service:[58,82],reputation:[50,80],venues:["mall_store","fast_service_store"],segments:{mall_shopper:2.3,young_couple:1.6,young_professional:1.4,social_group:1.2},districts:{commercial_core:2.4,cbd:1.7,sports_entertainment:1.5,convention_center:1.35},strategies:S(1,0.8,1,1.2,1.4,2),marketing:82,expansion:75,discount:46,resilience:62,innovation:74}),
  T({id:"family_chain",name:"家庭聚餐连锁",category:"family_dining",weight:1,strength:[2,5],price:[0.92,1.3],dish:[58,84],service:[58,84],reputation:[55,86],venues:["suburban_family_restaurant","community_store"],segments:{family_with_children:2.4,resident:1.7,parent_child:1.8,budget_family:1.2},districts:{suburban_community:2.3,residential:1.9,premium_residential:1.3,sports_entertainment:1.1},strategies:S(1.8,0.6,0.7,1.2,1.6,1.1),marketing:64,expansion:82,discount:38,resilience:80,innovation:48}),
  T({id:"local_specialty_house",name:"地方特色菜馆",category:"local_specialty",weight:1.05,strength:[2,4],price:[0.9,1.28],dish:[62,86],service:[50,76],reputation:[52,84],venues:["street_shop","old_brand_shop"],segments:{foodie:2.2,tourist:1.7,local_regular:1.5,social_group:1.2},districts:{old_town:2.1,tourist_scenic:1.8,cultural_creative:1.55,commercial_core:1.2},strategies:S(1.2,0.4,0.8,2.2,0.8,1),marketing:52,expansion:46,discount:24,resilience:72,innovation:56}),
  T({id:"old_brand_traditional",name:"老字号传统馆",category:"traditional_brand",weight:0.62,strength:[3,5],price:[1,1.38],dish:[70,92],service:[58,82],reputation:[72,96],venues:["old_brand_shop","courtyard_restaurant"],segments:{local_regular:2.2,senior:1.5,tourist:1.6,foodie:1.8},districts:{old_town:3,tourist_scenic:1.5,cultural_creative:1.3},strategies:S(2.2,0.1,1,2,1,0.6),marketing:38,expansion:28,discount:12,resilience:92,innovation:28}),
  T({id:"premium_banquet",name:"高端宴请餐厅",category:"premium_dining",weight:0.55,strength:[3,5],price:[1.28,1.7],dish:[72,94],service:[74,96],reputation:[62,92],venues:["clubhouse_restaurant","villa_private_kitchen"],segments:{high_income:2.5,business_guest:2.4,premium_foodie:2,social_group:1.1},districts:{premium_residential:2.6,cbd:1.8,convention_center:1.8,commercial_core:1.5},strategies:S(1,0.05,2.3,1.8,2.1,0.8),marketing:58,expansion:42,discount:8,resilience:76,innovation:62}),
  T({id:"private_kitchen",name:"预约制私房菜",category:"private_kitchen",weight:0.52,strength:[3,5],price:[1.15,1.62],dish:[74,96],service:[68,92],reputation:[58,90],venues:["villa_private_kitchen","courtyard_restaurant"],segments:{premium_foodie:2.6,high_income:2.1,young_couple:1.2,foodie:1.7},districts:{premium_residential:2.5,suburban_resort:1.8,cultural_creative:1.6,old_town:1.2},strategies:S(1.1,0.05,1.8,2.6,1.4,0.7),marketing:46,expansion:20,discount:5,resilience:70,innovation:76}),
  T({id:"hotpot_social",name:"社交火锅店",category:"hotpot_social",weight:1.08,strength:[2,5],price:[0.92,1.32],dish:[58,84],service:[52,80],reputation:[48,82],venues:["street_shop","mall_store"],segments:{social_group:2.5,young_professional:1.5,student:1.25,young_couple:1.3},districts:{nightlife:2.3,commercial_core:2,university:1.5,sports_entertainment:1.5},strategies:S(0.8,1.1,0.5,1.1,1,2.5),marketing:88,expansion:80,discount:55,resilience:60,innovation:68}),
  T({id:"barbecue_late_night",name:"夜宵烧烤店",category:"late_night",weight:1.12,strength:[1,4],price:[0.82,1.18],dish:[52,80],service:[42,68],reputation:[42,76],venues:["nightlife_store","street_shop"],segments:{nightlife:2.8,social_group:1.7,student:1.2,late_shift_worker:1.4},districts:{nightlife:3,university:1.5,industrial_park:1.2,sports_entertainment:1.3},strategies:S(0.8,1.2,0.2,1.1,0.5,2.4),marketing:78,expansion:52,discount:58,resilience:58,innovation:44}),
  T({id:"snack_stall",name:"特色小吃档口",category:"snack",weight:1.2,strength:[1,3],price:[0.62,0.92],dish:[42,70],service:[38,62],reputation:[30,64],venues:["stall","mall_store"],segments:{student:1.8,tourist:1.6,mall_shopper:1.5,takeaway_commuter:1.2},districts:{university:2,tourist_scenic:1.8,wholesale_market:1.6,transport_hub:1.7,commercial_core:1.3},strategies:S(0.8,2,0.05,1,0.5,1.7),marketing:64,expansion:50,discount:82,resilience:48,innovation:62}),
  T({id:"dessert_beverage",name:"甜品饮品店",category:"dessert_beverage",weight:1.05,strength:[1,4],price:[0.82,1.24],dish:[48,78],service:[55,82],reputation:[42,80],venues:["dessert_beverage_store","mall_store"],segments:{young_couple:2.1,student:1.8,mall_shopper:1.8,young_professional:1.3},districts:{university:2,commercial_core:2,cultural_creative:1.8,nightlife:1.35,waterfront_leisure:1.3},strategies:S(0.8,0.8,0.8,1.2,1.3,2.4),marketing:92,expansion:84,discount:46,resilience:44,innovation:88}),
  T({id:"healthy_light_meal",name:"健康轻食店",category:"healthy_light",weight:0.85,strength:[2,4],price:[0.98,1.32],dish:[58,82],service:[58,84],reputation:[46,80],venues:["tech_park_light_meal","office_restaurant"],segments:{health_conscious:2.8,young_professional:1.8,high_income:1.2,office_worker:1.3},districts:{tech_park:2.6,office_park:2,cbd:1.65,premium_residential:1.35},strategies:S(1,0.3,1.2,1.8,1.5,1.6),marketing:78,expansion:68,discount:24,resilience:52,innovation:84}),
  T({id:"business_dining",name:"商务正餐厅",category:"business_dining",weight:0.72,strength:[3,5],price:[1.15,1.55],dish:[68,90],service:[72,94],reputation:[60,90],venues:["office_restaurant","clubhouse_restaurant"],segments:{business_guest:2.8,high_income:1.8,office_worker:1.1,premium_foodie:1.2},districts:{cbd:2.8,convention_center:2,commercial_core:1.5,office_park:1.5},strategies:S(1.4,0.1,2,1.6,2.2,0.8),marketing:60,expansion:54,discount:10,resilience:76,innovation:56}),
  T({id:"tourist_specialty",name:"景区特色餐厅",category:"tourist_specialty",weight:0.86,strength:[2,4],price:[1.02,1.45],dish:[58,84],service:[48,76],reputation:[45,80],venues:["scenic_store","courtyard_restaurant"],segments:{tourist:3,foodie:1.7,weekend_leisure:1.3},districts:{tourist_scenic:3,old_town:1.4,waterfront_leisure:1.5,suburban_resort:1.3},strategies:S(1,0.3,1.5,1.6,0.8,1.4),marketing:76,expansion:44,discount:18,resilience:48,innovation:58}),
  T({id:"scenic_farmhouse",name:"郊野农家餐饮",category:"farmhouse",weight:0.62,strength:[2,4],price:[0.9,1.28],dish:[62,86],service:[46,74],reputation:[50,82],venues:["farmhouse","mountain_resort"],segments:{weekend_leisure:2.5,family_with_children:1.5,tourist:1.6,foodie:1.4},districts:{suburban_resort:3,tourist_scenic:1.5,suburban_community:1.15},strategies:S(1.6,0.3,0.7,1.8,0.8,0.8),marketing:44,expansion:32,discount:22,resilience:74,innovation:40}),
  T({id:"waterfront_seafood",name:"滨水海鲜餐厅",category:"waterfront_seafood",weight:0.55,strength:[3,5],price:[1.1,1.58],dish:[68,92],service:[58,84],reputation:[56,88],venues:["waterfront_restaurant","courtyard_restaurant"],segments:{premium_foodie:2.1,tourist:1.8,weekend_leisure:1.6,high_income:1.5},districts:{waterfront_leisure:3,tourist_scenic:1.5,premium_residential:1.2},strategies:S(1.1,0.1,1.8,2.1,1.2,1),marketing:62,expansion:38,discount:8,resilience:64,innovation:58}),
  T({id:"transport_fast_service",name:"枢纽快餐店",category:"transport_fast",weight:1,strength:[2,4],price:[0.86,1.18],dish:[50,74],service:[60,86],reputation:[46,76],venues:["hub_store","fast_service_store"],segments:{takeaway_commuter:2.8,tourist:1.4,office_worker:1.3,solo_diner:1.3},districts:{transport_hub:3.2,cbd:0.8},strategies:S(1.2,1.2,0.4,0.7,2,1.2),marketing:58,expansion:70,discount:54,resilience:66,innovation:54}),
  T({id:"industrial_canteen",name:"园区工作餐",category:"industrial_meal",weight:0.9,strength:[1,3],price:[0.65,0.88],dish:[42,66],service:[44,68],reputation:[40,68],venues:["industrial_canteen","fast_service_store"],segments:{blue_collar:3,late_shift_worker:1.7,office_worker:1.1},districts:{industrial_park:3.2,wholesale_market:1.4},strategies:S(1.6,1.8,0.05,0.8,1.1,0.7),marketing:28,expansion:42,discount:84,resilience:82,innovation:22}),
  T({id:"medical_support_meal",name:"医疗配套餐饮",category:"medical_support",weight:0.82,strength:[1,3],price:[0.78,1.02],dish:[46,70],service:[52,78],reputation:[44,72],venues:["medical_support_store","community_store"],segments:{senior:2,health_conscious:1.8,resident:1.3,solo_diner:1.2},districts:{medical_cluster:3,residential:1.1},strategies:S(1.8,1,0.1,1.1,1.6,0.7),marketing:34,expansion:30,discount:48,resilience:86,innovation:32}),
  T({id:"wholesale_fast_food",name:"批发市场快餐",category:"wholesale_fast",weight:1,strength:[1,3],price:[0.62,0.88],dish:[42,66],service:[38,62],reputation:[34,64],venues:["wholesale_fast_food","stall"],segments:{blue_collar:2.4,gig_worker:1.7,takeaway_commuter:1.4},districts:{wholesale_market:3.2,industrial_park:1.3},strategies:S(1.1,2.5,0.05,0.7,0.6,0.8),marketing:24,expansion:46,discount:92,resilience:70,innovation:20}),
  T({id:"creative_theme_restaurant",name:"文创主题餐厅",category:"creative_theme",weight:0.7,strength:[2,5],price:[1.02,1.42],dish:[56,86],service:[54,82],reputation:[44,84],venues:["creative_theme_store","rooftop_restaurant"],segments:{young_couple:2,foodie:1.8,freelancer:1.5,social_group:1.5},districts:{cultural_creative:3,commercial_core:1.2,waterfront_leisure:1.1},strategies:S(0.6,0.2,1.1,1.8,1,2.5),marketing:94,expansion:52,discount:16,resilience:40,innovation:96}),
  T({id:"convention_dining",name:"会展配套餐厅",category:"convention_dining",weight:0.65,strength:[2,5],price:[1.05,1.48],dish:[60,86],service:[66,90],reputation:[52,84],venues:["convention_restaurant","mall_store"],segments:{business_guest:2.4,tourist:1.4,social_group:1.4,high_income:1.2},districts:{convention_center:3.2,cbd:1.3,commercial_core:1.2},strategies:S(1,0.2,1.4,1.2,2,1.5),marketing:72,expansion:48,discount:18,resilience:58,innovation:58}),
  T({id:"sports_food",name:"赛事休闲餐饮",category:"sports_food",weight:0.78,strength:[1,4],price:[0.88,1.2],dish:[48,76],service:[50,76],reputation:[40,74],venues:["sports_venue_food","fast_service_store"],segments:{social_group:2,young_professional:1.4,family_with_children:1.2,mall_shopper:1.2},districts:{sports_entertainment:3.1,commercial_core:1.1},strategies:S(0.8,1.1,0.4,0.8,1,2.3),marketing:86,expansion:62,discount:56,resilience:48,innovation:62}),
  T({id:"suburban_family_restaurant",name:"郊区家庭大店",category:"suburban_family",weight:0.72,strength:[2,5],price:[0.88,1.26],dish:[58,84],service:[54,82],reputation:[52,84],venues:["suburban_family_restaurant","farmhouse"],segments:{family_with_children:2.2,resident:1.5,weekend_leisure:1.6,parent_child:1.5},districts:{suburban_community:2.8,suburban_resort:1.8,premium_residential:1.1},strategies:S(1.6,0.4,0.5,1.3,1.3,1),marketing:50,expansion:58,discount:32,resilience:82,innovation:40}),
  T({id:"chef_driven_flagship",name:"主厨旗舰餐厅",category:"chef_flagship",weight:0.32,strength:[4,5],price:[1.32,1.78],dish:[82,98],service:[72,94],reputation:[68,95],venues:["rooftop_restaurant","clubhouse_restaurant","villa_private_kitchen"],segments:{premium_foodie:3,high_income:2.2,foodie:1.8,business_guest:1.5},districts:{commercial_core:2,cbd:1.8,premium_residential:2.1,waterfront_leisure:1.7,cultural_creative:1.4},strategies:S(0.8,0.02,2.1,3,1.6,0.8),marketing:68,expansion:24,discount:2,resilience:66,innovation:94})
]);

export const COMPETITOR_TEMPLATE_DATASET_META =
  Object.freeze({
    schemaVersion: COMPETITOR_TEMPLATE_SCHEMA_VERSION,
    datasetVersion: "1.0.0",
    total: COMPETITOR_TEMPLATES_V1.length
  });
