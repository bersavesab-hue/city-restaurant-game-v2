function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

class MapViewportSystem {
  constructor({ minZoom = 0.75, maxZoom = 2.8, zoomStep = 0.2 } = {}) {
    this.minZoom = minZoom;
    this.maxZoom = maxZoom;
    this.zoomStep = zoomStep;
  }

  normalize(state = {}) {
    return {
      zoom: clamp(Number(state.zoom) || 1, this.minZoom, this.maxZoom),
      offsetX: Number(state.offsetX) || 0,
      offsetY: Number(state.offsetY) || 0
    };
  }

  zoom(state, delta, anchor = { x: 0.5, y: 0.5 }) {
    const current = this.normalize(state);
    const nextZoom = clamp(current.zoom + delta, this.minZoom, this.maxZoom);
    const ratio = nextZoom / current.zoom;

    return {
      zoom: nextZoom,
      offsetX: current.offsetX * ratio + (0.5 - anchor.x) * 100 * (ratio - 1),
      offsetY: current.offsetY * ratio + (0.5 - anchor.y) * 100 * (ratio - 1)
    };
  }

  zoomIn(state, anchor) {
    return this.zoom(state, this.zoomStep, anchor);
  }

  zoomOut(state, anchor) {
    return this.zoom(state, -this.zoomStep, anchor);
  }

  pan(state, deltaX, deltaY) {
    const current = this.normalize(state);
    const limit = 120 * current.zoom;

    return {
      ...current,
      offsetX: clamp(current.offsetX + deltaX, -limit, limit),
      offsetY: clamp(current.offsetY + deltaY, -limit, limit)
    };
  }

  reset() {
    return { zoom: 1, offsetX: 0, offsetY: 0 };
  }

  getVisibleDetailLevel(state) {
    const zoom = this.normalize(state).zoom;
    if (zoom < 1.05) return "district";
    if (zoom < 1.65) return "property_cluster";
    return "property";
  }
}

export const mapViewportSystem = new MapViewportSystem();
export { MapViewportSystem };
