const WORKSPACE_MODE = Object.freeze({
  DIRECT: "direct",
  ZOOM: "zoom",
  ZONE: "zone"
});

const MODE_LABELS = Object.freeze({
  [WORKSPACE_MODE.DIRECT]: "整店编辑",
  [WORKSPACE_MODE.ZOOM]: "缩放编辑",
  [WORKSPACE_MODE.ZONE]: "分区编辑"
});

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getFloorArea(floor) {
  if (!floor) {
    return 0;
  }

  if (Number.isFinite(floor.usableArea)) {
    return floor.usableArea;
  }

  if (Number.isFinite(floor.area)) {
    return floor.area;
  }

  return Math.max(0, (floor.width ?? 0) * (floor.height ?? 0));
}

function getWorkspaceMode(floor) {
  const area = getFloorArea(floor);

  if (area <= 120) {
    return WORKSPACE_MODE.DIRECT;
  }

  if (area <= 1000) {
    return WORKSPACE_MODE.ZOOM;
  }

  return WORKSPACE_MODE.ZONE;
}

function getZoomConfig(mode) {
  if (mode === WORKSPACE_MODE.DIRECT) {
    return {
      min: 1,
      max: 1,
      step: 0,
      defaultValue: 1
    };
  }

  if (mode === WORKSPACE_MODE.ZOOM) {
    return {
      min: 1,
      max: 2.5,
      step: 0.25,
      defaultValue: 1
    };
  }

  return {
    min: 1,
    max: 3,
    step: 0.25,
    defaultValue: 1
  };
}

function normalizeZoom(value, mode) {
  const config = getZoomConfig(mode);
  const numeric = Number.isFinite(value) ? value : config.defaultValue;

  if (config.step === 0) {
    return config.defaultValue;
  }

  const stepped = Math.round(numeric / config.step) * config.step;
  return Number(clamp(stepped, config.min, config.max).toFixed(2));
}

function buildWorkspaceZones(floor) {
  if (!floor) {
    return [];
  }

  const width = Math.max(1, Math.round(floor.width ?? 1));
  const height = Math.max(1, Math.round(floor.height ?? 1));
  const area = getFloorArea(floor);

  if (area <= 1000) {
    return [
      {
        id: "zone_all",
        label: "全层",
        x: 0,
        y: 0,
        width,
        height,
        row: 0,
        column: 0
      }
    ];
  }

  const desired = clamp(Math.ceil(area / 800), 2, 16);
  const aspect = width / Math.max(1, height);
  const columns = clamp(
    Math.ceil(Math.sqrt(desired * aspect)),
    1,
    6
  );
  const rows = clamp(Math.ceil(desired / columns), 1, 6);
  const zoneWidth = Math.ceil(width / columns);
  const zoneHeight = Math.ceil(height / rows);
  const zones = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = column * zoneWidth;
      const y = row * zoneHeight;

      if (x >= width || y >= height) {
        continue;
      }

      const letter = String.fromCharCode(65 + row);

      zones.push({
        id: `zone_${row + 1}_${column + 1}`,
        label: `${letter}${column + 1}区`,
        x,
        y,
        width: Math.min(zoneWidth, width - x),
        height: Math.min(zoneHeight, height - y),
        row,
        column
      });
    }
  }

  return zones;
}

function getViewBounds(floor, mode, zones = [], activeZoneId = null) {
  const full = {
    x: 0,
    y: 0,
    width: Math.max(1, Math.round(floor?.width ?? 1)),
    height: Math.max(1, Math.round(floor?.height ?? 1))
  };

  if (mode !== WORKSPACE_MODE.ZONE) {
    return full;
  }

  const zone =
    zones.find(item => item.id === activeZoneId) ??
    zones[0] ??
    null;

  return zone
    ? {
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height
      }
    : full;
}

function placementIntersectsBounds(placement, bounds) {
  const width = Math.max(1, placement.width ?? 1);
  const height = Math.max(1, placement.height ?? 1);

  return !(
    placement.x + width <= bounds.x ||
    placement.y + height <= bounds.y ||
    placement.x >= bounds.x + bounds.width ||
    placement.y >= bounds.y + bounds.height
  );
}

function buildMinimapModel({
  floor,
  placements = [],
  viewBounds
}) {
  const width = Math.max(1, floor?.width ?? 1);
  const height = Math.max(1, floor?.height ?? 1);

  return {
    width,
    height,
    polygon: structuredClone(floor?.polygon ?? []),
    placements: placements.map(item => ({
      id: item.id,
      x: item.x,
      y: item.y,
      width: item.width ?? 1,
      height: item.height ?? 1,
      type: item.type ?? null
    })),
    viewport: {
      x: viewBounds.x / width,
      y: viewBounds.y / height,
      width: viewBounds.width / width,
      height: viewBounds.height / height
    }
  };
}

export {
  WORKSPACE_MODE,
  MODE_LABELS as RENOVATION_WORKSPACE_MODE_LABELS,
  getFloorArea,
  getWorkspaceMode,
  getZoomConfig,
  normalizeZoom,
  buildWorkspaceZones,
  getViewBounds,
  placementIntersectsBounds,
  buildMinimapModel
};
