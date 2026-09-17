import { mapViewportSystem } from "../../systems/MapViewportSystem.js";

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpoint(a, b) {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2
  };
}

class CityMapViewportRuntime {
  constructor() {
    this.root = null;
    this.state = mapViewportSystem.reset();
    this.observer = null;
    this.pointers = new Map();
    this.drag = null;
    this.pinch = null;
    this.boundClick = (event) => this.handleClick(event);
    this.boundPointerDown = (event) => this.handlePointerDown(event);
    this.boundPointerMove = (event) => this.handlePointerMove(event);
    this.boundPointerUp = (event) => this.handlePointerUp(event);
    this.boundWheel = (event) => this.handleWheel(event);
  }

  start(root = document) {
    this.stop();
    this.root = root;

    root.addEventListener("click", this.boundClick, true);
    root.addEventListener("pointerdown", this.boundPointerDown, true);
    root.addEventListener("pointermove", this.boundPointerMove, true);
    root.addEventListener("pointerup", this.boundPointerUp, true);
    root.addEventListener("pointercancel", this.boundPointerUp, true);
    root.addEventListener("wheel", this.boundWheel, { passive: false, capture: true });

    this.observer = new MutationObserver(() => this.attach());
    this.observer.observe(document.body, { childList: true, subtree: true });
    this.attach();
    return this;
  }

  stop() {
    if (!this.root) return;
    this.root.removeEventListener("click", this.boundClick, true);
    this.root.removeEventListener("pointerdown", this.boundPointerDown, true);
    this.root.removeEventListener("pointermove", this.boundPointerMove, true);
    this.root.removeEventListener("pointerup", this.boundPointerUp, true);
    this.root.removeEventListener("pointercancel", this.boundPointerUp, true);
    this.root.removeEventListener("wheel", this.boundWheel, true);
    this.observer?.disconnect();
    this.observer = null;
    this.pointers.clear();
    this.drag = null;
    this.pinch = null;
    this.root = null;
  }

  getCanvas() {
    return document.querySelector(".city-map-panel__canvas");
  }

  getLayers() {
    const canvas = this.getCanvas();
    if (!canvas) return [];
    return [
      canvas.querySelector(".city-image-slot--map"),
      canvas.querySelector(".city-map-pins")
    ].filter(Boolean);
  }

  attach() {
    const canvas = this.getCanvas();
    if (!canvas) return;

    canvas.classList.add("city-map-panel__canvas--interactive");

    if (!canvas.querySelector(".city-map-runtime-controls")) {
      const controls = document.createElement("div");
      controls.className = "city-map-runtime-controls";
      controls.innerHTML = `
        <button type="button" data-map-runtime="zoom-out" aria-label="缩小地图">−</button>
        <button type="button" data-map-runtime="reset" aria-label="重置地图">${Math.round(this.state.zoom * 100)}%</button>
        <button type="button" data-map-runtime="zoom-in" aria-label="放大地图">＋</button>
      `;
      canvas.appendChild(controls);
    }

    this.apply();
  }

  apply() {
    const layers = this.getLayers();
    const gesturing = this.drag || this.pinch;

    for (const layer of layers) {
      layer.style.transformOrigin = "50% 50%";
      layer.style.transform = `translate(${this.state.offsetX}px, ${this.state.offsetY}px) scale(${this.state.zoom})`;
      layer.style.transition = gesturing ? "none" : "transform 140ms ease-out";
    }

    const reset = document.querySelector('[data-map-runtime="reset"]');
    if (reset) {
      reset.textContent = `${Math.round(this.state.zoom * 100)}%`;
    }

    const canvas = this.getCanvas();
    if (canvas) {
      canvas.dataset.mapDetailLevel = mapViewportSystem.getVisibleDetailLevel(this.state);
    }
  }

  handleClick(event) {
    const button = event.target.closest?.("[data-map-runtime]");
    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    const action = button.dataset.mapRuntime;
    if (action === "zoom-in") {
      this.state = mapViewportSystem.zoomIn(this.state);
    } else if (action === "zoom-out") {
      this.state = mapViewportSystem.zoomOut(this.state);
    } else if (action === "reset") {
      this.state = mapViewportSystem.reset();
    }

    this.apply();
  }

  handleWheel(event) {
    const canvas = event.target.closest?.(".city-map-panel__canvas");
    if (!canvas) return;

    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const anchor = {
      x: rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0.5,
      y: rect.height > 0 ? (event.clientY - rect.top) / rect.height : 0.5
    };

    this.state = event.deltaY < 0
      ? mapViewportSystem.zoomIn(this.state, anchor)
      : mapViewportSystem.zoomOut(this.state, anchor);
    this.apply();
  }

  startGesture() {
    const points = [...this.pointers.values()];

    if (points.length >= 2) {
      const a = points[0];
      const b = points[1];
      this.drag = null;
      this.pinch = {
        distance: Math.max(1, distance(a, b)),
        midpoint: midpoint(a, b),
        state: { ...this.state }
      };
      return;
    }

    if (points.length === 1) {
      const point = points[0];
      this.pinch = null;
      this.drag = {
        pointerId: point.pointerId,
        x: point.x,
        y: point.y
      };
    }
  }

  handlePointerDown(event) {
    const canvas = event.target.closest?.(".city-map-panel__canvas");
    if (!canvas || event.target.closest?.("button")) return;

    event.preventDefault();
    this.pointers.set(event.pointerId, {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY
    });
    canvas.setPointerCapture?.(event.pointerId);
    this.startGesture();
    this.apply();
  }

  handlePointerMove(event) {
    if (!this.pointers.has(event.pointerId)) return;

    event.preventDefault();
    this.pointers.set(event.pointerId, {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY
    });

    const points = [...this.pointers.values()];

    if (points.length >= 2 && this.pinch) {
      const a = points[0];
      const b = points[1];
      const nextDistance = Math.max(1, distance(a, b));
      const nextMidpoint = midpoint(a, b);
      const ratio = nextDistance / this.pinch.distance;

      this.state = mapViewportSystem.normalize({
        zoom: this.pinch.state.zoom * ratio,
        offsetX:
          this.pinch.state.offsetX +
          (nextMidpoint.x - this.pinch.midpoint.x),
        offsetY:
          this.pinch.state.offsetY +
          (nextMidpoint.y - this.pinch.midpoint.y)
      });
      this.apply();
      return;
    }

    if (points.length === 1 && this.drag && event.pointerId === this.drag.pointerId) {
      const dx = event.clientX - this.drag.x;
      const dy = event.clientY - this.drag.y;
      this.drag.x = event.clientX;
      this.drag.y = event.clientY;
      this.state = mapViewportSystem.pan(this.state, dx, dy);
      this.apply();
    }
  }

  handlePointerUp(event) {
    if (!this.pointers.has(event.pointerId)) return;

    this.pointers.delete(event.pointerId);
    this.drag = null;
    this.pinch = null;
    this.startGesture();
    this.apply();
  }
}

export const cityMapViewportRuntime = new CityMapViewportRuntime();
export { CityMapViewportRuntime };
