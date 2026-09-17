const UTILITY_META = Object.freeze({
  water: { label: "水", color: "#2f80ed" },
  drain: { label: "排", color: "#5b6b7a" },
  gas: { label: "气", color: "#e67e22" },
  power: { label: "电", color: "#d4a72c" },
  exhaust: { label: "烟", color: "#8e6bb8" },
  grease_trap: { label: "隔", color: "#7b6f5b" },
  fire: { label: "消", color: "#c94747" }
});

const STRUCTURE_META = Object.freeze({
  column: { label: "柱", color: "#55616d" },
  load_bearing_wall: { label: "承重墙", color: "#39434d" },
  wall: { label: "墙", color: "#5f6973" },
  stair: { label: "楼梯", color: "#7d6b55" },
  elevator: { label: "电梯", color: "#566c82" },
  toilet: { label: "卫生间", color: "#6b7f8c" },
  shaft: { label: "管井", color: "#68757f" },
  structure: { label: "固定", color: "#5f6973" }
});

function isFiniteNumber(value) {
  return Number.isFinite(value);
}

function normalizeBounds(floor, bounds = null) {
  const width = Math.max(1, Number(floor?.width ?? 1));
  const height = Math.max(1, Number(floor?.height ?? 1));

  if (!bounds) {
    return { x: 0, y: 0, width, height };
  }

  return {
    x: Number(bounds.x ?? 0),
    y: Number(bounds.y ?? 0),
    width: Math.max(1, Number(bounds.width ?? width)),
    height: Math.max(1, Number(bounds.height ?? height))
  };
}

function normalizeRect(item, fallbackWidth = 1, fallbackHeight = 1) {
  if (!item || !isFiniteNumber(item.x) || !isFiniteNumber(item.y)) {
    return null;
  }

  return {
    ...structuredClone(item),
    x: item.x,
    y: item.y,
    width:
      isFiniteNumber(item.width) && item.width > 0
        ? item.width
        : fallbackWidth,
    height:
      isFiniteNumber(item.height) && item.height > 0
        ? item.height
        : fallbackHeight
  };
}

function rectIntersectsBounds(rect, bounds) {
  return !(
    rect.x + rect.width <= bounds.x ||
    rect.y + rect.height <= bounds.y ||
    rect.x >= bounds.x + bounds.width ||
    rect.y >= bounds.y + bounds.height
  );
}

function pointInBounds(point, bounds) {
  return (
    point.x >= bounds.x &&
    point.y >= bounds.y &&
    point.x <= bounds.x + bounds.width &&
    point.y <= bounds.y + bounds.height
  );
}

function getPolygon(floor) {
  if (Array.isArray(floor?.polygon) && floor.polygon.length >= 3) {
    return structuredClone(floor.polygon);
  }

  const width = Math.max(1, Number(floor?.width ?? 1));
  const height = Math.max(1, Number(floor?.height ?? 1));

  return [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height }
  ];
}

function getUtilityMeta(type) {
  return UTILITY_META[type] ?? {
    label: "点",
    color: "#65727e"
  };
}

function getStructureMeta(type) {
  return STRUCTURE_META[type] ?? STRUCTURE_META.structure;
}

function buildFloorplanVisualModel(floor, viewBounds = null) {
  const bounds = normalizeBounds(floor, viewBounds);
  const polygon = getPolygon(floor);

  const columns = (floor?.columns ?? [])
    .map(item => normalizeRect({ ...item, type: item.type ?? "column" }))
    .filter(Boolean)
    .filter(item => rectIntersectsBounds(item, bounds))
    .map(item => ({
      ...item,
      meta: getStructureMeta(item.type)
    }));

  const fixedStructures = (floor?.fixedStructures ?? [])
    .map(item => normalizeRect(item))
    .filter(Boolean)
    .filter(item => rectIntersectsBounds(item, bounds))
    .map(item => ({
      ...item,
      meta: getStructureMeta(item.type ?? "structure")
    }));

  const windows = (floor?.windows ?? [])
    .map(item => normalizeRect(item, 0.9, 0.18))
    .filter(Boolean)
    .filter(item => rectIntersectsBounds(item, bounds));

  const entrances = (floor?.entrances ?? [])
    .filter(item => item && isFiniteNumber(item.x) && isFiniteNumber(item.y))
    .filter(item => pointInBounds(item, bounds))
    .map(item => structuredClone(item));

  const utilityPoints = (floor?.utilityPoints ?? [])
    .filter(item => item && isFiniteNumber(item.x) && isFiniteNumber(item.y))
    .filter(item => pointInBounds(item, bounds))
    .map(item => ({
      ...structuredClone(item),
      meta: getUtilityMeta(item.type)
    }));

  const legend = [];

  if (entrances.length > 0) {
    legend.push({ id: "entrance", label: "入口", color: "#c8752b" });
  }

  if (windows.length > 0) {
    legend.push({ id: "window", label: "窗", color: "#4b9fc6" });
  }

  if (columns.length > 0) {
    legend.push({ id: "column", label: "柱", color: STRUCTURE_META.column.color });
  }

  for (const item of fixedStructures) {
    const id = `structure:${item.type ?? "structure"}`;
    if (!legend.some(entry => entry.id === id)) {
      legend.push({
        id,
        label: item.meta.label,
        color: item.meta.color
      });
    }
  }

  for (const item of utilityPoints) {
    const id = `utility:${item.type ?? "unknown"}`;
    if (!legend.some(entry => entry.id === id)) {
      legend.push({
        id,
        label: item.meta.label,
        color: item.meta.color
      });
    }
  }

  return {
    floorId: floor?.id ?? null,
    floorLabel: floor?.label ?? null,
    bounds,
    viewBox: `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`,
    polygon,
    polygonPoints: polygon.map(point => `${point.x},${point.y}`).join(" "),
    columns,
    fixedStructures,
    windows,
    entrances,
    utilityPoints,
    legend
  };
}

export {
  UTILITY_META as RENOVATION_UTILITY_META,
  STRUCTURE_META as RENOVATION_STRUCTURE_META,
  normalizeBounds,
  rectIntersectsBounds,
  pointInBounds,
  getUtilityMeta,
  getStructureMeta,
  buildFloorplanVisualModel
};
