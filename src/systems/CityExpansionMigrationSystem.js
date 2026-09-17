import { entitySystem } from "../core/EntitySystem.js";

const LEGACY_DISTRICT_MAP = Object.freeze({
  east_gate: "old_town",
  commercial: "cbd"
});

class CityExpansionMigrationSystem {
  migrateProperties() {
    const properties = entitySystem.list("property");
    let migrated = 0;

    for (const property of properties) {
      const target = LEGACY_DISTRICT_MAP[property.districtId];
      if (!target) continue;

      entitySystem.update("property", property.id, {
        districtId: target
      });
      migrated += 1;
    }

    return migrated;
  }
}

export const cityExpansionMigrationSystem = new CityExpansionMigrationSystem();
export { CityExpansionMigrationSystem, LEGACY_DISTRICT_MAP };
