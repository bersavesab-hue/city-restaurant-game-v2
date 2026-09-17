import { mapViewportSystem } from "../../systems/MapViewportSystem.js";

class CityMapViewportRuntime {
  constructor() {
    this.root = null;
    this.state = mapViewportSystem.reset();
    this.observer = null;
    this.drag = null;
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
    for (const layer of layers) {
      layer.style.transformOrigin = "50% 50%";
      layer.style.transform = `translate(${this.state.offsetX}px, ${this.state.offsetY}px) scale(${this.state.zoom})`;
      layer.style.transition = this.drag ? "none" : "transform 140ms ease-out";
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

  handlePointerDown(event) {
    const canvas = event.target.closest?.(".city-map-panel__canvas");
    if (!canvas || event.target.closest?.("button")) return;

    this.drag = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY
    };
    canvas.setPointerCapture?.(event.pointerId);
    this.apply();
  }

  handlePointerMove(event) {
    if (!this.drag || event.pointerId !== this.drag.pointerId) return;

    const dx = event.clientX - this.drag.x;
    const dy = event.clientY - this.drag.y;
    this.drag.x = event.clientX;
    this.drag.y = event.clientY;
    this.state = mapViewportSystem.pan(this.state, dx, dy);
    this.apply();
  }

  handlePointerUp(event) {
    if (!this.drag || event.pointerId !== this.drag.pointerId) return;
    this.drag = null;
    this.apply();
  }
}

export const cityMapViewportRuntime = new CityMapViewportRuntime();
export { CityMapViewportRuntime };
