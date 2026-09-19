export const CHAIN_SCHEMA_VERSION =
  1;

export const CHAIN_EXPANSION_POLICY =
  Object.freeze({
    secondStoreLevel: 6,
    chainManagementLevel: 8,
    centralKitchenLevel: 9,
    regionalExpansionLevel: 10,

    branchMinimumInitialCapital:
      20000,

    flagshipMinimumReserve:
      20000,

    regionUnlockCost:
      60000,

    maxStoresByLevel:
      Object.freeze({
        6: 2,
        7: 2,
        8: 4,
        9: 6,
        10: 10
      })
  });

export const CHAIN_REGIONS =
  Object.freeze([
    Object.freeze({
      id: "northwest",
      name: "城西北经营区"
    }),
    Object.freeze({
      id: "northeast",
      name: "城东北经营区"
    }),
    Object.freeze({
      id: "southwest",
      name: "城西南经营区"
    }),
    Object.freeze({
      id: "southeast",
      name: "城东南经营区"
    })
  ]);

export function getChainRegionByPosition(
  position
) {
  if (
    !position ||
    !Number.isFinite(
      position.x
    ) ||
    !Number.isFinite(
      position.y
    )
  ) {
    throw new Error(
      "District map position is required"
    );
  }

  const east =
    position.x >= 50;

  const south =
    position.y >= 50;

  if (
    !east &&
    !south
  ) {
    return "northwest";
  }

  if (
    east &&
    !south
  ) {
    return "northeast";
  }

  if (
    !east &&
    south
  ) {
    return "southwest";
  }

  return "southeast";
}

export function getMaxChainStoresForLevel(
  level
) {
  const safeLevel =
    Math.max(
      1,
      Math.floor(
        Number(level) || 1
      )
    );

  if (
    safeLevel <
    CHAIN_EXPANSION_POLICY
      .secondStoreLevel
  ) {
    return 1;
  }

  let maxStores = 2;

  for (
    const [
      unlockLevel,
      value
    ]
    of Object.entries(
      CHAIN_EXPANSION_POLICY
        .maxStoresByLevel
    )
  ) {
    if (
      safeLevel >=
      Number(
        unlockLevel
      )
    ) {
      maxStores =
        value;
    }
  }

  return maxStores;
}

export function getChainRegion(
  regionId
) {
  return (
    CHAIN_REGIONS.find(
      item =>
        item.id ===
        regionId
    ) ??
    null
  );
}
