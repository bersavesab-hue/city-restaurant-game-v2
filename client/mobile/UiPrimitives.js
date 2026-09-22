function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderSegmentTabs(items, {
  activeIndex = 0,
  componentId = "segment-tabs"
} = {}) {
  return `
    <div
      class="segment-tabs"
      data-ui-component="${escapeHtml(componentId)}"
    >
      ${items.map((item, index) => `
        <button
          class="${index === activeIndex ? "is-active" : ""}"
          type="button"
        >${escapeHtml(item)}</button>
      `).join("")}
    </div>
  `;
}

export function renderListCardRows(rows, {
  componentId = "list-card"
} = {}) {
  return `
    <section
      class="list-card"
      data-ui-component="${escapeHtml(componentId)}"
    >
      ${rows.map(row => `
        <button type="button">
          <span>${escapeHtml(row.label)}</span>
          <b>${escapeHtml(row.value)}</b>
        </button>
      `).join("")}
    </section>
  `;
}

export function renderActionGrid(items, {
  className = "research-grid",
  componentId = "action-grid"
} = {}) {
  return `
    <section
      class="${escapeHtml(className)}"
      data-ui-component="${escapeHtml(componentId)}"
    >
      ${items.map(item => `
        <button type="button">
          <b>${escapeHtml(item.title)}</b>
          <span>${escapeHtml(item.detail)}</span>
        </button>
      `).join("")}
    </section>
  `;
}

export const UI_COMPONENT_LIBRARY = Object.freeze([
  {
    id: "segment-tabs",
    purpose: "页内一级/二级标签切换",
    renderer: "renderSegmentTabs"
  },
  {
    id: "list-card",
    purpose: "统一管理入口列表",
    renderer: "renderListCardRows"
  },
  {
    id: "action-grid",
    purpose: "功能快捷入口网格",
    renderer: "renderActionGrid"
  }
]);
