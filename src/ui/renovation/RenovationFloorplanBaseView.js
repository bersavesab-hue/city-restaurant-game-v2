import {
  RenovationEditorBaseView
} from "./RenovationEditorBaseView.js";
import {
  buildFloorplanVisualModel
} from "./RenovationFloorplanVisualModel.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function renderRect(item, className, { label = null, fill = "#66717c" } = {}) {
  const safeFill = escapeHtml(fill);
  const text = label
    ? `<text x="${item.x + item.width / 2}" y="${item.y + item.height / 2}" text-anchor="middle" dominant-baseline="central" font-size="0.42" font-weight="700" fill="#24313a">${escapeHtml(label)}</text>`
    : "";

  return `
    <g class="${escapeHtml(className)}">
      <rect
        x="${item.x}"
        y="${item.y}"
        width="${item.width}"
        height="${item.height}"
        rx="0.08"
        fill="${safeFill}"
        fill-opacity="0.34"
        stroke="${safeFill}"
        stroke-width="0.12"
        vector-effect="non-scaling-stroke"
      ></rect>
      ${text}
    </g>
  `;
}

function renderFloorplanLayer(workspace, viewport = null) {
  const floor = workspace?.activeFloor;

  if (!floor) {
    return "";
  }

  const model = buildFloorplanVisualModel(
    floor,
    viewport ?? workspace.viewBounds ?? null
  );
  const markerScale = clamp(
    Math.min(model.bounds.width, model.bounds.height) * 0.025,
    0.24,
    0.75
  );
  const entranceRadius = markerScale * 0.72;
  const utilityRadius = markerScale * 0.62;

  const windows = model.windows
    .map(item => renderRect(
      item,
      "renovation-floor-window",
      { fill: "#4b9fc6" }
    ))
    .join("");

  const columns = model.columns
    .map(item => renderRect(
      item,
      "renovation-floor-column",
      {
        label: item.meta.label,
        fill: item.meta.color
      }
    ))
    .join("");

  const fixedStructures = model.fixedStructures
    .map(item => renderRect(
      item,
      `renovation-floor-fixed renovation-floor-fixed-${item.type ?? "structure"}`,
      {
        label: item.meta.label,
        fill: item.meta.color
      }
    ))
    .join("");

  const entrances = model.entrances
    .map(item => `
      <g class="renovation-floor-entrance">
        <circle
          cx="${item.x}"
          cy="${item.y}"
          r="${entranceRadius}"
          fill="#f0a34b"
          stroke="#a95d16"
          stroke-width="0.12"
          vector-effect="non-scaling-stroke"
        ></circle>
        <text
          x="${item.x}"
          y="${item.y}"
          text-anchor="middle"
          dominant-baseline="central"
          font-size="${markerScale * 0.78}"
          font-weight="800"
          fill="#4b2b0e"
        >门</text>
      </g>
    `)
    .join("");

  const utilityPoints = model.utilityPoints
    .map(item => `
      <g class="renovation-floor-utility renovation-floor-utility-${escapeHtml(item.type ?? "unknown")}">
        <circle
          cx="${item.x}"
          cy="${item.y}"
          r="${utilityRadius}"
          fill="${escapeHtml(item.meta.color)}"
          stroke="#ffffff"
          stroke-width="0.12"
          vector-effect="non-scaling-stroke"
        ></circle>
        <text
          x="${item.x}"
          y="${item.y}"
          text-anchor="middle"
          dominant-baseline="central"
          font-size="${markerScale * 0.72}"
          font-weight="800"
          fill="#ffffff"
        >${escapeHtml(item.meta.label)}</text>
      </g>
    `)
    .join("");

  const legend = model.legend.length > 0
    ? `
      <div
        class="renovation-floor-legend"
        style="position:absolute;left:8px;bottom:8px;z-index:2;display:flex;flex-wrap:wrap;gap:4px;max-width:72%;padding:5px 7px;border-radius:9px;background:rgba(255,255,255,.88);box-shadow:0 3px 10px rgba(0,0,0,.08);pointer-events:none;font-size:10px;color:#34414b"
      >
        ${model.legend.map(item => `
          <span style="display:inline-flex;align-items:center;gap:3px;white-space:nowrap">
            <i style="display:inline-block;width:7px;height:7px;border-radius:2px;background:${escapeHtml(item.color)}"></i>
            ${escapeHtml(item.label)}
          </span>
        `).join("")}
      </div>
    `
    : "";

  return `
    <svg
      class="renovation-floorplan-layer"
      viewBox="${escapeHtml(model.viewBox)}"
      preserveAspectRatio="none"
      aria-hidden="true"
      style="position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;overflow:hidden;border-radius:inherit"
    >
      <rect
        x="${model.bounds.x}"
        y="${model.bounds.y}"
        width="${model.bounds.width}"
        height="${model.bounds.height}"
        fill="#dfe3e5"
        fill-opacity="0.48"
      ></rect>
      <polygon
        points="${escapeHtml(model.polygonPoints)}"
        fill="#fffdf8"
        fill-opacity="0.86"
        stroke="#34424c"
        stroke-width="0.16"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      ></polygon>
      ${windows}
      ${fixedStructures}
      ${columns}
      ${entrances}
      ${utilityPoints}
    </svg>
    ${legend}
  `;
}

class RenovationFloorplanBaseView extends RenovationEditorBaseView {
  renderStructureMarkers() {
    return renderFloorplanLayer(
      this.page?.workspace,
      this.getViewport()
    );
  }
}

export {
  RenovationFloorplanBaseView,
  renderFloorplanLayer
};
