import { propertySystem } from "./PropertySystem.js";
import { districtSystem } from "./DistrictSystem.js";
import { propertyVenueSystem } from "./PropertyVenueSystem.js";

const PROPERTY_SEEDS = [
  ["old_town", "老城骑楼小馆", 92, 84, 6200, "street_shop", 2, 4.8],
  ["old_town", "老城庭院餐厅", 186, 166, 9800, "courtyard_restaurant", 6, 7.5],
  ["cbd", "金融街商务餐厅", 168, 150, 15800, "office_restaurant", 3, 8.2],
  ["cbd", "中央广场商场铺", 228, 205, 21800, "mall_store", 280, 9.2],
  ["university", "学府路快餐铺", 78, 72, 4600, "campus_store", 1, 4.2],
  ["university", "大学城夜宵铺", 126, 115, 6200, "street_shop", 2, 6.4],
  ["premium_residential", "湖畔别墅私厨", 260, 198, 14800, "villa_private_kitchen", 8, 9.5],
  ["premium_residential", "高端社区庭院店", 210, 188, 12600, "courtyard_restaurant", 10, 8.7],
  ["residential", "社区入口家常菜", 118, 108, 5200, "community_store", 8, 6.2],
  ["residential", "邻里中心餐饮铺", 162, 148, 6800, "community_store", 18, 7.4],
  ["transport_hub", "客运枢纽快餐店", 96, 88, 9800, "hub_store", 2, 7.2],
  ["transport_hub", "站前综合餐厅", 188, 168, 14600, "fast_service_store", 4, 9.1],
  ["industrial_park", "产业园员工餐厅", 230, 210, 5200, "industrial_canteen", 12, 9.6],
  ["industrial_park", "园区外卖厨房", 86, 80, 3200, "cloud_kitchen", 2, 4.5],
  ["nightlife", "夜市临街餐馆", 126, 114, 8800, "nightlife_store", 1, 6.5],
  ["nightlife", "城市屋顶餐厅", 238, 190, 16800, "rooftop_restaurant", 18, 9.4],
  ["tourist_scenic", "景区特色餐厅", 176, 158, 10800, "scenic_store", 12, 8.2],
  ["tourist_scenic", "古街庭院餐馆", 220, 196, 13200, "courtyard_restaurant", 6, 8.8],
  ["suburban_resort", "山水度假山庄", 880, 540, 16500, "mountain_resort", 80, 18],
  ["suburban_resort", "半山别墅私厨", 320, 215, 11800, "villa_private_kitchen", 12, 10.5],
  ["suburban_resort", "田园农家乐", 560, 360, 7600, "farmhouse", 50, 14]
];

function floorFor(area, usableArea, venueTypeId) {
  const width = Math.max(8, Math.round(Math.sqrt(usableArea * 1.35)));
  const height = Math.max(7, Math.ceil(usableArea / width));
  const outdoor = ["mountain_resort", "farmhouse", "villa_private_kitchen", "courtyard_restaurant"].includes(venueTypeId);

  return [{
    id: "floor_1",
    label: "1F",
    area,
    usableArea,
    width,
    height,
    entrances: [{ x: 1, y: Math.max(1, height - 1) }],
    windows: [{ x: Math.max(2, Math.floor(width * 0.3)), y: 0 }, { x: Math.max(3, Math.floor(width * 0.7)), y: 0 }],
    columns: usableArea > 150 ? [{ x: Math.floor(width / 2), y: Math.floor(height / 2), width: 1, height: 1 }] : [],
    utilityPoints: [
      { type: "water", x: Math.max(1, width - 2), y: Math.max(1, height - 2) },
      { type: "power", x: Math.max(1, width - 3), y: Math.max(1, height - 2) },
      { type: "exhaust", x: Math.max(1, width - 1), y: Math.max(1, Math.floor(height / 2)) }
    ],
    notes: outdoor ? "含庭院/户外经营空间预留" : null
  }];
}

class ExpandedPropertyBootstrapSystem {
  ensureLoaded() {
    const existingNames = new Set(propertySystem.list().map((item) => item.name));
    const created = [];

    for (const [districtId, name, area, usableArea, baseMonthlyRent, venueTypeId, parkingSpaces, frontageMeters] of PROPERTY_SEEDS) {
      if (!districtSystem.exists(districtId) || existingNames.has(name)) {
        continue;
      }

      const venueSeatMultiplier = venueTypeId === "villa_private_kitchen" ? 0.5 : venueTypeId === "mountain_resort" ? 0.32 : 1;
      const seats = Math.max(4, Math.floor(usableArea / 4 * venueSeatMultiplier));

      const property = propertySystem.create({
        districtId,
        name,
        area,
        usableArea,
        baseMonthlyRent,
        seats,
        depositMonths: 2,
        floors: floorFor(area, usableArea, venueTypeId),
        frontageMeters,
        ceilingHeight: venueTypeId === "industrial_canteen" ? 4.2 : 3.6,
        parkingSpaces,
        foodServiceAllowed: true,
        exhaustAllowed: true,
        tags: [venueTypeId]
      });

      propertyVenueSystem.setVenueType(property.id, venueTypeId);
      created.push(property.id);
    }

    return {
      created,
      total: propertySystem.list().length
    };
  }
}

export const expandedPropertyBootstrapSystem = new ExpandedPropertyBootstrapSystem();
export { ExpandedPropertyBootstrapSystem, PROPERTY_SEEDS };
