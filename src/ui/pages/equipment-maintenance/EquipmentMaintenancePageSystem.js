import {
  equipmentMaintenanceSystem
} from "../../../systems/EquipmentMaintenanceSystem.js";


class EquipmentMaintenancePageSystem {
  getPage(
    restaurantId
  ) {
    return {
      pageId:
        "equipment-maintenance",

      title:
        "设备维护",

      ...equipmentMaintenanceSystem
        .getDashboard(
          restaurantId
        )
    };
  }
}


export const equipmentMaintenancePageSystem =
  new EquipmentMaintenancePageSystem();

export {
  EquipmentMaintenancePageSystem
};
