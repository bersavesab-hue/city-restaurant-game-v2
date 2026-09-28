const STORAGE_KEY = "city-restaurant-ui-dev-overrides.v6";
const PROJECT_STORAGE_KEY = "city-restaurant-ui-dev-project.v6";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readOverrides() {
  try {
    const current =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (current) {
      return JSON.parse(
        current
      );
    }
  } catch {
    // Dev storage must never break the game.
  }

  return {};
}

function writeOverrides(value) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Dev storage must never break the game.
  }
}

function readProject() {
  try {
    const raw =
      localStorage.getItem(
        PROJECT_STORAGE_KEY
      );

    if (raw) {
      const parsed =
        JSON.parse(raw);

      return {
        components:
          Array.isArray(
            parsed.components
          )
            ? parsed.components
            : [],
        assetOverrides:
          parsed.assetOverrides &&
          typeof parsed.assetOverrides === "object"
            ? parsed.assetOverrides
            : {}
      };
    }
  } catch {
    // Dev storage must never break the game.
  }

  return {
    components: [],
    assetOverrides: {}
  };
}

function writeProject(value) {
  try {
    localStorage.setItem(
      PROJECT_STORAGE_KEY,
      JSON.stringify(value)
    );
  } catch {
    // Dev storage must never break the game.
  }
}

function isBackgroundAssetName(name) {
  const value =
    String(name || "")
      .toLowerCase();

  return (
    /^00[_-]/.test(value) ||
    value.includes("background") ||
    value.includes("背景")
  );
}

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

function uiScale() {
  const value =
    Number.parseFloat(
      getComputedStyle(
        document.documentElement
      ).getPropertyValue(
        "--screen-scale"
      )
    );

  return (
    Number.isFinite(value) &&
    value > 0
  )
    ? value
    : 1;
}

function logicalRect(node) {
  const rect =
    node.getBoundingClientRect();

  const scale =
    uiScale();

  return {
    x: rect.x / scale,
    y: rect.y / scale,
    left: rect.left / scale,
    right: rect.right / scale,
    top: rect.top / scale,
    bottom: rect.bottom / scale,
    width: rect.width / scale,
    height: rect.height / scale
  };
}

function rectOf(node) {
  const rect = node.getBoundingClientRect();

  return {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    width: Math.round(rect.width),
    height: Math.round(rect.height)
  };
}

function isVisible(node) {
  if (!(node instanceof Element)) return false;

  const style = getComputedStyle(node);
  const rect = node.getBoundingClientRect();

  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    rect.width > 0 &&
    rect.height > 0
  );
}

function actionLabel(node) {
  if (node.dataset.nav) return `nav:${node.dataset.nav}`;
  if (node.dataset.openSheet) return `sheet:${node.dataset.openSheet}`;
  if (node.dataset.advance) return `advance:${node.dataset.advance}`;
  if (node.dataset.closeSheet !== undefined) return "sheet:close";
  if (node.dataset.devBound) return node.dataset.devBound;
  return "";
}

function elementLabel(node) {
  const text = (node.textContent || "")
    .replace(/\s+/g, " ")
    .trim();

  if (text) return text.slice(0, 28);

  const component = node.dataset?.uiComponent;
  if (component) return component;

  return node.tagName?.toLowerCase() || "element";
}

function selectorFor(node, root) {
  if (!node || node === root) return "root";

  if (node.dataset.devId) {
    return node.dataset.devId;
  }

  if (node.dataset.layoutKey) {
    const id =
      `[data-layout-key="${node.dataset.layoutKey}"]`;
    node.dataset.devId = id;
    return id;
  }

  if (node.dataset.uiComponent) {
    const id = `[data-ui-component="${node.dataset.uiComponent}"]`;
    node.dataset.devId = id;
    return id;
  }

  if (
    node.dataset.nav &&
    document.querySelectorAll(`[data-nav="${node.dataset.nav}"]`).length === 1
  ) {
    const id = `[data-nav="${node.dataset.nav}"]`;
    node.dataset.devId = id;
    return id;
  }

  if (
    node.dataset.openSheet &&
    document.querySelectorAll(
      `[data-open-sheet="${node.dataset.openSheet}"]`
    ).length === 1
  ) {
    const id = `[data-open-sheet="${node.dataset.openSheet}"]`;
    node.dataset.devId = id;
    return id;
  }

  const parts = [];
  let current = node;

  while (current && current !== root && parts.length < 6) {
    if (
      current !== node &&
      current.dataset?.uiComponent
    ) {
      parts.unshift(
        `component:${current.dataset.uiComponent}`
      );
      break;
    }

    let part = current.tagName.toLowerCase();

    if (current.dataset?.nav) {
      part += `[nav=${current.dataset.nav}]`;
    }

    if (current.dataset?.openSheet) {
      part += `[sheet=${current.dataset.openSheet}]`;
    }

    const parent = current.parentElement;
    if (parent) {
      const sameTag = [...parent.children].filter(
        item => item.tagName === current.tagName
      );

      if (sameTag.length > 1) {
        part += `:nth-of-type(${sameTag.indexOf(current) + 1})`;
      }
    }

    parts.unshift(part);
    current = parent;
  }

  const id = parts.join(" > ") || node.tagName.toLowerCase();
  node.dataset.devId = id;
  return id;
}

function normalizeSelection(target, root, sheetRoot) {
  if (!(target instanceof Element)) return null;

  const custom =
    target.closest(
      "[data-dev-custom]"
    );

  if (
    custom &&
    root.contains(custom)
  ) {
    return custom;
  }

  const selector = [
    "img",
    "[data-dev-custom]",
    "[data-layout-key]",
    "[data-ui-component]",
    "button",
    ".home-metric-card",
    ".hud-card",
    ".home-panel",
    ".feature-card",
    ".list-card",
    "article",
    "section",
    "header",
    "nav",
    "[data-bind]"
  ].join(",");

  const candidate = target.closest(selector);

  if (
    candidate &&
    (root.contains(candidate) || sheetRoot.contains(candidate))
  ) {
    return candidate;
  }

  return target;
}

function makeIssue(level, code, message, node = null) {
  return {
    level,
    code,
    message,
    element: node ? elementLabel(node) : "",
    selector: node?.dataset?.devId || ""
  };
}

export function auditUi({
  root,
  sheetRoot,
  allowedPages = []
}) {
  const issues = [];
  const scope = [root, sheetRoot].filter(Boolean);
  const nodes = scope.flatMap(container => [
    container,
    ...container.querySelectorAll("*")
  ]);

  const visibleButtons = nodes.filter(
    node => node instanceof HTMLButtonElement && isVisible(node)
  );

  for (const button of visibleButtons) {
    const action = actionLabel(button);

    if (!action) {
      issues.push(
        makeIssue(
          "error",
          "button-unbound",
          "按钮没有注册点击动作",
          button
        )
      );
    } else if (!button.dataset.devBound) {
      issues.push(
        makeIssue(
          "error",
          "action-not-bound",
          `声明了动作但没有实际绑定事件：${action}`,
          button
        )
      );
    }

    const rect = button.getBoundingClientRect();

    if (rect.width < 44 || rect.height < 36) {
      issues.push(
        makeIssue(
          "warning",
          "tap-target-small",
          `点击区域偏小：${Math.round(rect.width)}×${Math.round(rect.height)}`,
          button
        )
      );
    }
  }

  for (const node of nodes.filter(node => node?.dataset?.nav)) {
    if (!allowedPages.includes(node.dataset.nav)) {
      issues.push(
        makeIssue(
          "error",
          "invalid-route",
          `目标页面未注册：${node.dataset.nav}`,
          node
        )
      );
    }
  }

  const ids = new Map();

  for (const node of nodes.filter(node => node?.id)) {
    if (!ids.has(node.id)) ids.set(node.id, []);
    ids.get(node.id).push(node);
  }

  for (const [id, items] of ids) {
    if (items.length > 1) {
      issues.push({
        level: "error",
        code: "duplicate-id",
        message: `重复 DOM id：${id}`,
        element: id,
        selector: ""
      });
    }
  }

  const viewportWidth = document.documentElement.clientWidth;

  for (const node of nodes.filter(
    node => node instanceof HTMLElement && isVisible(node)
  )) {
    if (node.closest("#ui-dev-root")) continue;

    const rect = node.getBoundingClientRect();

    if (rect.left < -2 || rect.right > viewportWidth + 2) {
      issues.push(
        makeIssue(
          "warning",
          "viewport-overflow",
          `横向越界：${Math.round(rect.left)} → ${Math.round(rect.right)}`,
          node
        )
      );
    }
  }

  const assets = nodes
    .filter(node => node instanceof HTMLImageElement)
    .map(image => ({
      src: image.currentSrc || image.src,
      width: image.naturalWidth,
      height: image.naturalHeight,
      ok: !image.complete || image.naturalWidth > 0
    }));

  for (const item of assets.filter(item => !item.ok)) {
    issues.push({
      level: "error",
      code: "image-missing",
      message: `图片加载失败：${item.src}`,
      element: "",
      selector: ""
    });
  }

  const errors = issues.filter(item => item.level === "error").length;
  const warnings = issues.filter(item => item.level === "warning").length;

  return {
    score: clamp(100 - errors * 8 - warnings * 2, 0, 100),
    errors,
    warnings,
    checkedButtons: visibleButtons.length,
    boundButtons: visibleButtons.filter(button => actionLabel(button)).length,
    bindings: nodes
      .filter(node => node?.dataset?.bind)
      .map(node => ({
        key: node.dataset.bind,
        value: (node.textContent || "").trim()
      })),
    assets,
    components: Object.entries(
      nodes
        .filter(node => node?.dataset?.uiComponent)
        .reduce((result, node) => {
          const key = node.dataset.uiComponent;
          result[key] = (result[key] || 0) + 1;
          return result;
        }, {})
    ).map(([id, count]) => ({ id, count })),
    issues
  };
}

export function createDevToolkit({
  app,
  root,
  sheetRoot,
  allowedPages,
  getActivePage
}) {
  const state = {
    open: false,
    expanded: false,
    dock: "bottom",
    tab: "edit",
    selecting: false,
    selectionScope: "any",
    selected: null,
    dragMode: false,
    dragPointer: null,
    resizePointer: null,
    snap: 4,
    guides: true,
    panelScroll: {
      edit: 0,
      audit: 0,
      config: 0
    },
    project: readProject(),
    uploadMode: "add",
    report: null,
    overrides: readOverrides(),
    undoStack: [],
    redoStack: [],
    suppressMoreClick: false,
    longPressTimer: null
  };

  const host = document.createElement("div");
  host.id = "ui-dev-root";
  document.body.append(host);

  const chrome = document.createElement("div");
  chrome.id = "ui-dev-chrome";
  chrome.innerHTML = `
    <div class="ui-dev-guides" data-dev-guides aria-hidden="true">
      <div class="ui-dev-guide-screen" data-dev-guide-screen></div>
      <div class="ui-dev-guide-reference" data-dev-guide-reference></div>
      <div class="ui-dev-guide-line is-center-v" data-dev-guide-center-v></div>
      <div class="ui-dev-guide-line is-center-h" data-dev-guide-center-h></div>
      <div class="ui-dev-guide-line is-safe-top" data-dev-guide-safe-top></div>
      <div class="ui-dev-guide-line is-safe-bottom" data-dev-guide-safe-bottom></div>
    </div>

    <div class="ui-dev-resize-frame">
      <button type="button" data-dev-resize="nw" aria-label="左上缩放"></button>
      <button type="button" data-dev-resize="ne" aria-label="右上缩放"></button>
      <button type="button" data-dev-resize="sw" aria-label="左下缩放"></button>
      <button type="button" data-dev-resize="se" aria-label="右下缩放"></button>
    </div>
  `;
  document.body.append(chrome);

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/png,image/jpeg,image/webp,image/svg+xml";
  fileInput.style.display = "none";
  document.body.append(fileInput);

  function candidates() {
    return [
      ...root.querySelectorAll("[data-dev-id]"),
      ...sheetRoot.querySelectorAll("[data-dev-id]")
    ];
  }

  function projectPageRoot() {
    return (
      root.querySelector(
        '[data-layout-key="home-page"]'
      ) ||
      root.querySelector(".page-host") ||
      root
    );
  }

  function positioningParentRect(parentKey = "canvas") {
    const page =
      projectPageRoot();

    const pageRect =
      logicalRect(page);

    const metrics =
      window.__CITY_SCREEN__?.getMetrics?.() || {};

    if (parentKey === "safe") {
      const left =
        Number(metrics.safeLeft || 0);
      const top =
        Number(metrics.safeTop || 0);
      const right =
        Number(metrics.safeRight || 0);
      const bottom =
        Number(metrics.safeBottom || 0);

      return {
        x: left,
        y: top,
        width: Math.max(
          0,
          pageRect.width - left - right
        ),
        height: Math.max(
          0,
          pageRect.height - top - bottom
        )
      };
    }

    if (parentKey === "reference") {
      return {
        x: Number(metrics.referenceLeft || 0),
        y: Number(metrics.referenceTop || 0),
        width: 540,
        height: 960
      };
    }

    return {
      x: 0,
      y: 0,
      width: pageRect.width,
      height: pageRect.height
    };
  }

  function normalizePlacement(item) {
    if (!item) return;

    if (!item.positionParent) {
      item.positionParent =
        "canvas";
    }

    if (!item.anchor) {
      item.anchor =
        "top-left";
    }
  }

  function resolveItemPlacement(item) {
    normalizePlacement(item);

    const frame =
      positioningParentRect(
        item.positionParent
      );

    const width =
      Number(item.width || 0);
    const height =
      Number(item.height || 0);
    const x =
      Number(item.x || 0);
    const y =
      Number(item.y || 0);

    let left = frame.x + x;
    let top = frame.y + y;

    if (
      item.anchor.includes("center")
    ) {
      const parts =
        item.anchor.split("-");

      if (
        item.anchor === "center" ||
        parts[1] === "center"
      ) {
        left =
          frame.x +
          (frame.width - width) / 2 +
          x;
      }
    }

    if (item.anchor.endsWith("right")) {
      left =
        frame.x +
        frame.width -
        width -
        x;
    }

    if (
      item.anchor === "center" ||
      item.anchor.startsWith("center-")
    ) {
      top =
        frame.y +
        (frame.height - height) / 2 +
        y;
    }

    if (item.anchor.startsWith("bottom-")) {
      top =
        frame.y +
        frame.height -
        height -
        y;
    }

    return {
      left: Math.round(left),
      top: Math.round(top),
      width: Math.round(width),
      height: Math.round(height),
      frame
    };
  }

  function offsetsForAbsolutePosition(
    item,
    left,
    top
  ) {
    normalizePlacement(item);

    const frame =
      positioningParentRect(
        item.positionParent
      );

    const width =
      Number(item.width || 0);
    const height =
      Number(item.height || 0);

    let x =
      left - frame.x;
    let y =
      top - frame.y;

    if (
      item.anchor === "top-center" ||
      item.anchor === "bottom-center"
    ) {
      x =
        left -
        (
          frame.x +
          (frame.width - width) / 2
        );
    } else if (
      item.anchor.endsWith("right")
    ) {
      x =
        frame.x +
        frame.width -
        width -
        left;
    } else if (item.anchor === "center") {
      x =
        left -
        (
          frame.x +
          (frame.width - width) / 2
        );
    }

    if (
      item.anchor.startsWith("center-") ||
      item.anchor === "center"
    ) {
      y =
        top -
        (
          frame.y +
          (frame.height - height) / 2
        );
    } else if (
      item.anchor.startsWith("bottom-")
    ) {
      y =
        frame.y +
        frame.height -
        height -
        top;
    }

    return {
      x: Math.round(x),
      y: Math.round(y)
    };
  }

  function setItemAbsolutePosition(
    item,
    left,
    top
  ) {
    const offsets =
      offsetsForAbsolutePosition(
        item,
        left,
        top
      );

    item.x = offsets.x;
    item.y = offsets.y;
  }

  function customComponentById(id) {
    return state.project.components.find(
      item => item.id === id
    ) || null;
  }

  function persistProject() {
    writeProject(state.project);
  }

  function renderProjectComponents() {
    root
      .querySelectorAll(
        '[data-dev-created="true"]'
      )
      .forEach(node => node.remove());

    const parent =
      projectPageRoot();

    if (
      !parent ||
      getActivePage() !== "store"
    ) {
      return;
    }

    if (
      getComputedStyle(parent).position ===
      "static"
    ) {
      parent.style.position =
        "relative";
    }

    let projectChanged = false;

    for (
      const item
      of state.project.components.filter(
        entry =>
          entry.page ===
          getActivePage()
      )
    ) {
      if (!item.positionParent) {
        item.positionParent =
          "canvas";
        projectChanged = true;
      }

      if (!item.anchor) {
        item.anchor =
          "top-left";
        projectChanged = true;
      }

      const legacyFullCanvasBackground =
        item.type === "image" &&
        item.role !== "background" &&
        !isBackgroundAssetName(
          item.name
        ) &&
        Number(item.x || 0) === 0 &&
        Number(item.y || 0) === 0 &&
        Number(item.zIndex ?? 40) <= 1 &&
        item.objectFit === "cover";

      if (
        item.type === "image" &&
        (
          item.role === "background" ||
          isBackgroundAssetName(
            item.name
          ) ||
          legacyFullCanvasBackground
        )
      ) {
        if (
          legacyFullCanvasBackground
        ) {
          item.role =
            "background";
          item.name =
            "00_home_background";
          item.backgroundInitialized =
            true;
          projectChanged = true;
        }
        const rect =
          logicalRect(
            parent
          );

        const nextWidth =
          Math.round(
            rect.width
          );

        const nextHeight =
          Math.round(
            rect.height
          );

        if (
          item.x !== 0 ||
          item.y !== 0 ||
          item.width !== nextWidth ||
          item.height !== nextHeight ||
          item.objectFit !== "cover" ||
          item.lockAspect !== false ||
          item.zIndex !== 0 ||
          !item.backgroundInitialized
        ) {
          item.x = 0;
          item.y = 0;
          item.positionParent =
            "canvas";
          item.anchor =
            "top-left";
          item.width = nextWidth;
          item.height = nextHeight;
          item.objectFit = "cover";
          item.lockAspect = false;
          item.zIndex = 0;
          item.backgroundInitialized = true;
          projectChanged = true;
        }
      }

      const wrapper =
        document.createElement("div");

      wrapper.className =
        "dev-custom-component";

      wrapper.dataset.devCreated =
        "true";

      wrapper.dataset.devCustom =
        item.id;

      wrapper.dataset.devId =
        `custom:${item.id}`;

      wrapper.style.position =
        "absolute";

      const placement =
        resolveItemPlacement(item);

      wrapper.style.left =
        `${placement.left}px`;

      wrapper.style.top =
        `${placement.top}px`;

      wrapper.style.width =
        `${placement.width}px`;

      wrapper.style.height =
        `${placement.height}px`;

      wrapper.style.zIndex =
        String(item.zIndex ?? 20);

      wrapper.style.opacity =
        String(item.opacity ?? 1);

      wrapper.dataset.devLocked =
        item.locked === true
          ? "true"
          : "false";

      wrapper.dataset.devHidden =
        item.hidden === true
          ? "true"
          : "false";

      wrapper.style.display =
        item.hidden === true
          ? "none"
          : "block";

      wrapper.style.pointerEvents =
        item.locked === true
          ? "none"
          : "auto";

      if (item.type === "image") {
        const image =
          document.createElement("img");

        image.src = item.src;
        image.alt = "";
        image.draggable = false;
        image.style.width = "100%";
        image.style.height = "100%";
        image.style.display = "block";
        image.style.objectFit =
          item.objectFit || "contain";
        image.style.objectPosition =
          item.objectPosition || "center";

        wrapper.append(image);
      } else if (
        item.type === "html" &&
        item.html
      ) {
        wrapper.innerHTML =
          item.html;
      }

      parent.append(wrapper);
    }

    if (projectChanged) {
      persistProject();
    }

    for (
      const [id, src]
      of Object.entries(
        state.project.assetOverrides
      )
    ) {
      const node =
        candidates().find(
          item =>
            item.dataset.devId === id
        );

      if (
        node instanceof
        HTMLImageElement
      ) {
        if (
          !node.dataset
            .devOriginalSrc
        ) {
          node.dataset.devOriginalSrc =
            node.getAttribute("src") || "";
        }

        node.src = src;
      }
    }
  }

  function snapshotState() {
    return {
      overrides:
        clone(state.overrides),
      project:
        clone(state.project)
    };
  }

  function relativeRect(node) {
    const parent =
      projectPageRoot();

    const parentRect =
      parent.getBoundingClientRect();

    const rect =
      node.getBoundingClientRect();

    const scale =
      uiScale();

    return {
      x:
        Math.round(
          (
            rect.left -
            parentRect.left
          ) / scale
        ),
      y:
        Math.round(
          (
            rect.top -
            parentRect.top
          ) / scale
        ),
      width:
        Math.max(
          24,
          Math.round(
            rect.width /
            scale
          )
        ),
      height:
        Math.max(
          24,
          Math.round(
            rect.height /
            scale
          )
        )
    };
  }

  function nextCustomId() {
    return (
      "ui-" +
      Date.now().toString(36) +
      "-" +
      Math.random()
        .toString(36)
        .slice(2, 7)
    );
  }

  function stripInteractiveAttributes(node) {
    if (!(node instanceof Element)) {
      return;
    }

    for (
      const attribute
      of [
        "id",
        "data-nav",
        "data-open-sheet",
        "data-advance",
        "data-layout-key",
        "data-ui-component",
        "data-dev-id",
        "data-dev-bound"
      ]
    ) {
      node.removeAttribute(
        attribute
      );
    }

    node
      .querySelectorAll("*")
      .forEach(child => {
        stripInteractiveAttributes(
          child
        );
      });
  }

  function sanitizeCloneHtml(node) {
    const cloned =
      node.cloneNode(true);

    stripInteractiveAttributes(
      cloned
    );

    cloned
      .classList
      .remove(
        "dev-selected-outline"
      );

    cloned.style.width = "100%";
    cloned.style.height = "100%";
    cloned.style.margin = "0";
    cloned.style.pointerEvents = "none";

    return cloned.outerHTML;
  }

  function renderGuides() {
    const guides =
      chrome.querySelector(
        "[data-dev-guides]"
      );

    const parent =
      projectPageRoot();

    if (
      !guides ||
      !parent ||
      !state.open ||
      !state.guides
    ) {
      chrome.classList.remove(
        "guides-visible"
      );
      return;
    }

    const rect =
      parent.getBoundingClientRect();

    const scale =
      uiScale();

    const metrics =
      window.__CITY_SCREEN__?.getMetrics?.() || {};

    const referenceLeft =
      Number(metrics.referenceLeft || 0);

    const referenceTop =
      Number(metrics.referenceTop || 0);

    const safeTop =
      Number(metrics.safeTop || 0);

    const safeBottom =
      Number(metrics.safeBottom || 0);

    const screen =
      guides.querySelector(
        "[data-dev-guide-screen]"
      );

    const reference =
      guides.querySelector(
        "[data-dev-guide-reference]"
      );

    const centerV =
      guides.querySelector(
        "[data-dev-guide-center-v]"
      );

    const centerH =
      guides.querySelector(
        "[data-dev-guide-center-h]"
      );

    const topLine =
      guides.querySelector(
        "[data-dev-guide-safe-top]"
      );

    const bottomLine =
      guides.querySelector(
        "[data-dev-guide-safe-bottom]"
      );

    if (screen) {
      screen.style.left =
        `${Math.round(rect.left)}px`;
      screen.style.top =
        `${Math.round(rect.top)}px`;
      screen.style.width =
        `${Math.round(rect.width)}px`;
      screen.style.height =
        `${Math.round(rect.height)}px`;
    }

    if (reference) {
      reference.style.left =
        `${Math.round(rect.left + referenceLeft * scale)}px`;
      reference.style.top =
        `${Math.round(rect.top + referenceTop * scale)}px`;
      reference.style.width =
        `${Math.round(540 * scale)}px`;
      reference.style.height =
        `${Math.round(960 * scale)}px`;
    }

    if (centerV) {
      centerV.style.left =
        `${Math.round(rect.left + rect.width / 2)}px`;
      centerV.style.top =
        `${Math.round(rect.top)}px`;
      centerV.style.height =
        `${Math.round(rect.height)}px`;
    }

    if (centerH) {
      centerH.style.left =
        `${Math.round(rect.left)}px`;
      centerH.style.top =
        `${Math.round(rect.top + rect.height / 2)}px`;
      centerH.style.width =
        `${Math.round(rect.width)}px`;
    }

    if (topLine) {
      topLine.style.left =
        `${Math.round(rect.left)}px`;
      topLine.style.top =
        `${Math.round(rect.top + safeTop * scale)}px`;
      topLine.style.width =
        `${Math.round(rect.width)}px`;
    }

    if (bottomLine) {
      bottomLine.style.left =
        `${Math.round(rect.left)}px`;
      bottomLine.style.top =
        `${Math.round(rect.bottom - safeBottom * scale)}px`;
      bottomLine.style.width =
        `${Math.round(rect.width)}px`;
    }

    chrome.classList.add(
      "guides-visible"
    );
  }

  function renderSelectionChrome() {
    renderGuides();
    const frame =
      chrome.querySelector(
        ".ui-dev-resize-frame"
      );

    const info =
      selectedInfo();

    if (
      !frame ||
      !state.open ||
      !state.selected ||
      !document.contains(
        state.selected
      ) ||
      state.selecting ||
      state.dragMode ||
      info?.locked ||
      info?.hidden
    ) {
      chrome.classList.remove(
        "is-visible"
      );
      return;
    }

    const rect =
      state.selected
        .getBoundingClientRect();

    frame.style.left =
      `${Math.round(rect.left)}px`;

    frame.style.top =
      `${Math.round(rect.top)}px`;

    frame.style.width =
      `${Math.round(rect.width)}px`;

    frame.style.height =
      `${Math.round(rect.height)}px`;

    chrome.classList.add(
      "is-visible"
    );
  }

  function fileToDataUrl(file) {
    return new Promise(
      (resolve, reject) => {
        const reader =
          new FileReader();

        reader.onload = () =>
          resolve(
            String(
              reader.result || ""
            )
          );

        reader.onerror = reject;
        reader.readAsDataURL(file);
      }
    );
  }

  async function optimizeImage(file) {
    const raw =
      await fileToDataUrl(
        file
      );

    if (
      file.type ===
      "image/svg+xml"
    ) {
      return raw;
    }

    return new Promise(
      resolve => {
        const image =
          new Image();

        image.onload = () => {
          const maxSide = 1600;
          const scale =
            Math.min(
              1,
              maxSide /
              Math.max(
                image.naturalWidth,
                image.naturalHeight
              )
            );

          const width =
            Math.max(
              1,
              Math.round(
                image.naturalWidth *
                scale
              )
            );

          const height =
            Math.max(
              1,
              Math.round(
                image.naturalHeight *
                scale
              )
            );

          const canvas =
            document.createElement(
              "canvas"
            );

          canvas.width = width;
          canvas.height = height;

          const context =
            canvas.getContext("2d");

          if (!context) {
            resolve(raw);
            return;
          }

          context.drawImage(
            image,
            0,
            0,
            width,
            height
          );

          resolve(
            canvas.toDataURL(
              "image/webp",
              .9
            )
          );
        };

        image.onerror = () =>
          resolve(raw);

        image.src = raw;
      }
    );
  }

  function measureImage(src) {
    return new Promise(
      (resolve, reject) => {
        const image =
          new Image();

        image.onload = () => {
          resolve({
            width:
              image.naturalWidth || 1,
            height:
              image.naturalHeight || 1
          });
        };

        image.onerror = reject;
        image.src = src;
      }
    );
  }

  function assignIds() {
    [root, sheetRoot]
      .filter(Boolean)
      .forEach(container => {
        container
          .querySelectorAll(
            "img,button,[data-bind],[data-layout-key],[data-ui-component],article,section,header,nav,.feature-card,.list-card,[data-dev-custom]"
          )
          .forEach(node => {
            selectorFor(node, root);
          });
      });
  }

  function applyOverrides() {
    assignIds();

    for (const [id, styles] of Object.entries(state.overrides)) {
      const node = candidates().find(item => item.dataset.devId === id);
      if (!node) continue;

      for (const [key, value] of Object.entries(styles)) {
        node.style[key] = value;
      }
    }
  }

  function selectedInfo() {
    if (!state.selected || !document.contains(state.selected)) {
      return null;
    }

    const style = getComputedStyle(state.selected);
    const custom =
      state.selected.dataset.devCustom
        ? customComponentById(
            state.selected.dataset.devCustom
          )
        : null;

    return {
      id: selectorFor(state.selected, root),
      label:
        custom?.name ||
        elementLabel(state.selected),
      rect:
        custom
          ? {
              x: Math.round(Number(custom.x || 0)),
              y: Math.round(Number(custom.y || 0)),
              width: Math.round(Number(custom.width || 0)),
              height: Math.round(Number(custom.height || 0))
            }
          : rectOf(state.selected),
      action: actionLabel(state.selected),
      bound: Boolean(state.selected.dataset.devBound),
      layoutKey: state.selected.dataset.layoutKey || "",
      customId: state.selected.dataset.devCustom || "",
      locked:
        custom?.locked === true,
      hidden:
        custom?.hidden === true,
      role:
        custom?.role || "",
      positionParent:
        custom?.positionParent ||
        "canvas",
      anchor:
        custom?.anchor ||
        "top-left",
      isImage:
        state.selected instanceof HTMLImageElement ||
        Boolean(
          custom?.type === "image"
        ),
      imageSettings:
        custom?.type === "image"
          ? {
              objectFit:
                custom.objectFit || "contain",
              lockAspect:
                custom.lockAspect === true,
              aspectRatio:
                Number(
                  custom.aspectRatio ||
                  (
                    custom.naturalWidth &&
                    custom.naturalHeight
                      ? custom.naturalWidth /
                        custom.naturalHeight
                      : custom.width /
                        custom.height
                  ) ||
                  1
                ),
              naturalWidth:
                Number(
                  custom.naturalWidth || 0
                ),
              naturalHeight:
                Number(
                  custom.naturalHeight || 0
                )
            }
          : null,
      values: {
        fontSize: Math.round(parseFloat(style.fontSize) || 0),
        padding: Math.round(parseFloat(style.paddingTop) || 0),
        width:
          custom
            ? Math.round(Number(custom.width || 0))
            : Math.round(state.selected.getBoundingClientRect().width / uiScale()),
        height:
          custom
            ? Math.round(Number(custom.height || 0))
            : Math.round(state.selected.getBoundingClientRect().height / uiScale()),
        borderRadius: Math.round(parseFloat(style.borderRadius) || 0),
        left:
          custom
            ? Math.round(Number(custom.x || 0))
            : (
                style.left === "auto"
                  ? 0
                  : Math.round(parseFloat(style.left) || 0)
              ),
        top:
          custom
            ? Math.round(Number(custom.y || 0))
            : (
                style.top === "auto"
                  ? 0
                  : Math.round(parseFloat(style.top) || 0)
              ),
        opacity: Math.round((parseFloat(style.opacity) || 1) * 100),
        zIndex:
          custom
            ? Math.round(Number(custom.zIndex ?? 20))
            : (
                Number.isFinite(parseInt(style.zIndex, 10))
                  ? parseInt(style.zIndex, 10)
                  : 0
              )
      }
    };
  }

  function pushHistory() {
    state.undoStack.push(
      snapshotState()
    );

    if (state.undoStack.length > 40) {
      state.undoStack.shift();
    }

    state.redoStack = [];
  }

  function removeOverrideStyles(overrides) {
    assignIds();

    const all = candidates();

    for (const [id, styles] of Object.entries(overrides)) {
      const node = all.find(item => item.dataset.devId === id);
      if (!node) continue;

      for (const key of Object.keys(styles)) {
        node.style.removeProperty(
          key.replace(
            /[A-Z]/g,
            match => `-${match.toLowerCase()}`
          )
        );
      }
    }
  }

  function restoreSnapshot(snapshot) {
    removeOverrideStyles(
      state.overrides
    );

    state.overrides =
      clone(
        snapshot.overrides || {}
      );

    state.project =
      clone(
        snapshot.project || {
          components: [],
          assetOverrides: {}
        }
      );

    writeOverrides(
      state.overrides
    );

    persistProject();
    renderProjectComponents();
    assignIds();
    applyOverrides();
    renderSelectionChrome();
    renderPanel();
  }

  function undo() {
    if (!state.undoStack.length) return;

    state.redoStack.push(
      snapshotState()
    );
    restoreSnapshot(
      state.undoStack.pop()
    );
  }

  function redo() {
    if (!state.redoStack.length) return;

    state.undoStack.push(
      snapshotState()
    );
    restoreSnapshot(
      state.redoStack.pop()
    );
  }

  function ensureSelectedOverride(info) {
    if (!state.overrides[info.id]) {
      state.overrides[info.id] = {};
    }

    return state.overrides[info.id];
  }

  function setExactValue(property, rawValue) {
    const info = selectedInfo();

    if (!info?.customId) {
      showToast("请先选中上传组件");
      return;
    }

    const item =
      customComponentById(info.customId);

    if (!item) return;

    if (
      item.locked === true &&
      ["x", "y", "width", "height"].includes(property)
    ) {
      showToast("组件已锁定");
      return;
    }

    const number = Number(rawValue);

    if (!Number.isFinite(number)) {
      return;
    }

    pushHistory();

    const value = Math.round(number);

    if (property === "x") {
      item.x = clamp(value, -4000, 4000);
    } else if (property === "y") {
      item.y = clamp(value, -4000, 4000);
    } else if (property === "width") {
      item.width = clamp(value, 24, 4000);
    } else if (property === "height") {
      item.height = clamp(value, 24, 4000);
    } else if (property === "zIndex") {
      item.zIndex = clamp(value, -1000, 9999);
    } else {
      return;
    }

    syncSelectedGeometry(
      item
    );
  }

  function adjust(property, delta) {
    const info = selectedInfo();
    if (!info) return;

    if (
      info.locked &&
      ["width", "height", "left", "top"].includes(property)
    ) {
      showToast("组件已锁定");
      return;
    }

    pushHistory();

    const styles = ensureSelectedOverride(info);
    const computed = getComputedStyle(state.selected);

    let current = 0;

    if (property === "padding") {
      current = parseFloat(computed.paddingTop) || 0;
    } else if (property === "width") {
      current =
        (
          state.selected
            .getBoundingClientRect()
            .width /
          uiScale()
        ) || 0;
    } else if (property === "height") {
      current =
        (
          state.selected
            .getBoundingClientRect()
            .height /
          uiScale()
        ) || 0;
    } else if (property === "left" || property === "top") {
      current = computed[property] === "auto"
        ? 0
        : parseFloat(computed[property]) || 0;

      if (computed.position === "static") {
        styles.position = "relative";
        state.selected.style.position = "relative";
      }
    } else {
      current = parseFloat(computed[property]) || 0;
    }

    const min =
      property === "fontSize"
        ? 8
        : property === "width"
          ? 24
          : property === "height"
            ? 24
          : property === "left" || property === "top"
            ? -200
            : 0;

    const next = Math.max(min, current + delta);
    const value = `${Math.round(next)}px`;

    const customId =
      state.selected.dataset.devCustom;

    if (
      customId &&
      (
        property === "width" ||
        property === "height" ||
        property === "left" ||
        property === "top"
      )
    ) {
      const item =
        customComponentById(
          customId
        );

      if (item) {
        if (property === "width") {
          item.width =
            Math.round(next);

          if (
            item.type === "image" &&
            item.lockAspect !== false &&
            item.aspectRatio
          ) {
            item.height =
              Math.max(
                24,
                Math.round(
                  item.width /
                  item.aspectRatio
                )
              );
          } else if (
            item.type === "image"
          ) {
            item.objectFit = "fill";
          }
        } else if (
          property === "height"
        ) {
          item.height =
            Math.round(next);

          if (
            item.type === "image" &&
            item.lockAspect !== false &&
            item.aspectRatio
          ) {
            item.width =
              Math.max(
                24,
                Math.round(
                  item.height *
                  item.aspectRatio
                )
              );
          } else if (
            item.type === "image"
          ) {
            item.objectFit = "fill";
          }
        } else if (
          property === "left"
        ) {
          item.x =
            Math.round(next);
        } else if (
          property === "top"
        ) {
          item.y =
            Math.round(next);
        }

        persistProject();

        if (
          property === "width" ||
          property === "height"
        ) {
          state.selected.style.width =
            `${item.width}px`;
          state.selected.style.height =
            `${item.height}px`;

          styles.width =
            `${item.width}px`;
          styles.height =
            `${item.height}px`;
        }
      }
    }

    if (
      !(
        customId &&
        (
          property === "width" ||
          property === "height"
        )
      )
    ) {
      styles[property] = value;
      state.selected.style[property] = value;
    }

    writeOverrides(
      state.overrides
    );
    renderSelectionChrome();
    renderPanel();
  }

  function resetSelected() {
    const info =
      selectedInfo();

    if (!info) return;

    const hasStyles =
      Boolean(
        state.overrides[
          info.id
        ]
      );

    const hasAsset =
      Boolean(
        state.project
          .assetOverrides[
            info.id
          ]
      );

    if (
      !hasStyles &&
      !hasAsset
    ) {
      return;
    }

    pushHistory();

    if (hasStyles) {
      const styles =
        state.overrides[
          info.id
        ];

      for (
        const key
        of Object.keys(styles)
      ) {
        state.selected
          .style
          .removeProperty(
            key.replace(
              /[A-Z]/g,
              match =>
                `-${match.toLowerCase()}`
            )
          );
      }

      delete state.overrides[
        info.id
      ];
    }

    if (
      hasAsset &&
      state.selected instanceof
        HTMLImageElement
    ) {
      if (
        state.selected.dataset
          .devOriginalSrc
      ) {
        state.selected.src =
          state.selected.dataset
            .devOriginalSrc;
      }

      delete state.project
        .assetOverrides[
          info.id
        ];

      persistProject();
    }

    writeOverrides(
      state.overrides
    );

    renderSelectionChrome();
    renderPanel();
  }

  function deleteSelected() {
    const info =
      selectedInfo();

    if (!info) return;

    if (
      info.layoutKey ===
      "home-page"
    ) {
      showToast(
        "空白画布不能删除"
      );
      return;
    }

    pushHistory();

    if (info.customId) {
      state.project.components =
        state.project.components
          .filter(
            item =>
              item.id !==
              info.customId
          );

      persistProject();

      state.selected.remove();
      state.selected = null;
      renderProjectComponents();
      assignIds();
    } else {
      const styles =
        ensureSelectedOverride(
          info
        );

      styles.display = "none";
      state.selected.style.display =
        "none";
      writeOverrides(
        state.overrides
      );
      state.selected = null;
    }

    chrome.classList.remove(
      "is-visible"
    );

    showToast(
      info.customId
        ? "上传组件已删除"
        : "原组件已从当前布局删除，可撤销"
    );

    renderPanel();
  }

  function duplicateSelected() {
    const info =
      selectedInfo();

    if (!info) return;

    if (info.locked) {
      showToast("组件已锁定");
      return;
    }

    pushHistory();

    const rect =
      relativeRect(
        state.selected
      );

    const source =
      info.customId
        ? customComponentById(
            info.customId
          )
        : null;

    const item =
      source
        ? {
            ...clone(source),
            id: nextCustomId(),
            x:
              Number(source.x || 0) +
              12,
            y:
              Number(source.y || 0) +
              12,
            zIndex:
              Number(
                source.zIndex || 20
              ) + 1
          }
        : {
            id: nextCustomId(),
            page:
              getActivePage(),
            type: "html",
            html:
              sanitizeCloneHtml(
                state.selected
              ),
            x: rect.x + 12,
            y: rect.y + 12,
            width: rect.width,
            height: rect.height,
            zIndex: 30,
            opacity: 1
          };

    state.project.components.push(
      item
    );

    persistProject();
    renderProjectComponents();
    assignIds();

    const node =
      root.querySelector(
        `[data-dev-custom="${item.id}"]`
      );

    openEditorFor(node);

    showToast("已复制组件");
  }

  function setLayer(mode) {
    const info =
      selectedInfo();

    if (!info) return;

    pushHistory();

    const custom =
      info.customId
        ? customComponentById(
            info.customId
          )
        : null;

    const current =
      Number(
        getComputedStyle(
          state.selected
        ).zIndex
      ) || 0;

    const next =
      mode === "front"
        ? 999
        : mode === "back"
          ? 1
          : mode === "up"
            ? current + 1
            : Math.max(
                0,
                current - 1
              );

    if (custom) {
      custom.zIndex = next;
      persistProject();
    }

    const styles =
      ensureSelectedOverride(
        info
      );

    if (
      getComputedStyle(
        state.selected
      ).position === "static"
    ) {
      styles.position =
        "relative";
      state.selected.style.position =
        "relative";
    }

    styles.zIndex =
      String(next);

    state.selected.style.zIndex =
      String(next);

    writeOverrides(
      state.overrides
    );

    renderSelectionChrome();
    renderPanel();
  }

  function syncSelectedGeometry(item) {
    if (
      !item ||
      !state.selected
    ) {
      return;
    }

    const info =
      selectedInfo();

    if (!info) return;

    const styles =
      ensureSelectedOverride(
        info
      );

    const placement =
      resolveItemPlacement(item);

    styles.position = "absolute";
    styles.left =
      `${placement.left}px`;
    styles.top =
      `${placement.top}px`;
    styles.width =
      `${placement.width}px`;
    styles.height =
      `${placement.height}px`;
    styles.zIndex =
      String(
        Math.round(
          item.zIndex ?? 20
        )
      );

    state.selected.style.position =
      "absolute";
    state.selected.style.left =
      styles.left;
    state.selected.style.top =
      styles.top;
    state.selected.style.width =
      styles.width;
    state.selected.style.height =
      styles.height;
    state.selected.style.zIndex =
      styles.zIndex;

    writeOverrides(
      state.overrides
    );
    persistProject();
    renderSelectionChrome();
  }

  function setPlacementParent(parentKey) {
    const info =
      selectedInfo();

    if (!info?.customId) return;

    const item =
      customComponentById(
        info.customId
      );

    if (!item || item.role === "background") {
      return;
    }

    const allowed =
      ["canvas", "safe", "reference"];

    if (!allowed.includes(parentKey)) {
      return;
    }

    const current =
      resolveItemPlacement(item);

    pushHistory();
    item.positionParent =
      parentKey;

    setItemAbsolutePosition(
      item,
      current.left,
      current.top
    );

    syncSelectedGeometry(item);
    renderPanel();
  }

  function setAnchor(anchor) {
    const info =
      selectedInfo();

    if (!info?.customId) return;

    const item =
      customComponentById(
        info.customId
      );

    if (!item || item.role === "background") {
      return;
    }

    const allowed = [
      "top-left",
      "top-center",
      "top-right",
      "center-left",
      "center",
      "center-right",
      "bottom-left",
      "bottom-center",
      "bottom-right"
    ];

    if (!allowed.includes(anchor)) {
      return;
    }

    const current =
      resolveItemPlacement(item);

    pushHistory();
    item.anchor = anchor;

    setItemAbsolutePosition(
      item,
      current.left,
      current.top
    );

    syncSelectedGeometry(item);
    renderPanel();
  }

  function alignSelected(mode) {
    const info =
      selectedInfo();

    if (info?.locked) {
      showToast("组件已锁定");
      return;
    }

    if (!info?.customId) {
      showToast(
        "请先选中上传组件"
      );
      return;
    }

    const item =
      customComponentById(
        info.customId
      );

    if (!item) return;

    const rect =
      positioningParentRect(
        item.positionParent
      );

    const current =
      resolveItemPlacement(item);

    let left =
      current.left;

    let top =
      current.top;

    pushHistory();

    if (mode === "left") {
      left =
        rect.x;
    } else if (
      mode === "center-x"
    ) {
      left =
        rect.x +
        (
          rect.width -
          item.width
        ) / 2;
    } else if (
      mode === "right"
    ) {
      left =
        rect.x +
        rect.width -
        item.width;
    } else if (
      mode === "top"
    ) {
      top =
        rect.y;
    } else if (
      mode === "center-y"
    ) {
      top =
        rect.y +
        (
          rect.height -
          item.height
        ) / 2;
    } else if (
      mode === "bottom"
    ) {
      top =
        rect.y +
        rect.height -
        item.height;
    } else if (
      mode === "center"
    ) {
      left =
        rect.x +
        (
          rect.width -
          item.width
        ) / 2;
      top =
        rect.y +
        (
          rect.height -
          item.height
        ) / 2;
    } else {
      return;
    }

    setItemAbsolutePosition(
      item,
      left,
      top
    );

    syncSelectedGeometry(
      item
    );
    renderPanel();
  }

  function sizeSelected(mode) {
    const info =
      selectedInfo();

    if (info?.locked) {
      showToast("组件已锁定");
      return;
    }

    if (!info?.customId) {
      showToast(
        "请先选中上传组件"
      );
      return;
    }

    const item =
      customComponentById(
        info.customId
      );

    if (!item) return;

    const rect =
      positioningParentRect(
        item.positionParent
      );

    const current =
      resolveItemPlacement(item);

    pushHistory();

    // Size commands are explicit: never force width/height linkage.
    item.lockAspect = false;

    if (
      item.type === "image"
    ) {
      item.objectFit =
        mode === "canvas"
          ? "cover"
          : "fill";
    }

    if (mode === "width") {
      item.width =
        Math.round(
          rect.width
        );

      setItemAbsolutePosition(
        item,
        rect.x,
        current.top
      );
    } else if (
      mode === "height"
    ) {
      item.height =
        Math.round(
          rect.height
        );

      setItemAbsolutePosition(
        item,
        current.left,
        rect.y
      );
    } else if (
      mode === "canvas"
    ) {
      item.width =
        Math.round(
          rect.width
        );
      item.height =
        Math.round(
          rect.height
        );

      setItemAbsolutePosition(
        item,
        rect.x,
        rect.y
      );
    } else {
      return;
    }

    syncSelectedGeometry(
      item
    );
    renderPanel();
  }

  function restoreNaturalRatio() {
    const item =
      selectedImageItem();

    if (
      !item ||
      !item.aspectRatio
    ) {
      return;
    }

    pushHistory();

    // Keep the current width and recompute only height once.
    item.height =
      Math.max(
        24,
        Math.round(
          item.width /
          item.aspectRatio
        )
      );

    item.lockAspect = false;

    syncSelectedGeometry(
      item
    );
    renderPanel();
  }

  function repairSelectedImageFrame() {
    const item =
      selectedImageItem();

    if (
      !item ||
      !item.aspectRatio
    ) {
      return;
    }

    const parent =
      projectPageRoot();

    const rect =
      logicalRect(
        parent
      );

    pushHistory();

    item.height =
      Math.max(
        24,
        Math.round(
          item.width /
          item.aspectRatio
        )
      );

    item.x =
      Math.round(
        (
          rect.width -
          item.width
        ) / 2
      );

    item.objectFit = "contain";
    item.lockAspect = false;

    syncSelectedGeometry(item);
    renderPanel();
    showToast("已修复外框并水平居中");
  }

  function fitImageNaturalWidth() {
    const item =
      selectedImageItem();

    if (
      !item ||
      !item.aspectRatio
    ) {
      return;
    }

    const parent =
      projectPageRoot();

    const rect =
      logicalRect(
        parent
      );

    pushHistory();

    item.x = 0;
    item.width =
      Math.round(rect.width);
    item.height =
      Math.max(
        24,
        Math.round(
          item.width /
          item.aspectRatio
        )
      );

    item.objectFit = "contain";
    item.lockAspect = false;

    syncSelectedGeometry(item);
    renderPanel();
    showToast("已按原比例铺满宽度");
  }

  function selectedImageItem() {
    const info =
      selectedInfo();

    if (
      !info?.customId
    ) {
      return null;
    }

    const item =
      customComponentById(
        info.customId
      );

    return item?.type === "image"
      ? item
      : null;
  }

  function setImageFit(mode) {
    const item =
      selectedImageItem();

    if (!item) return;

    if (
      !["contain", "cover", "fill"]
        .includes(mode)
    ) {
      return;
    }

    pushHistory();

    // Display mode changes only how pixels are drawn inside the frame.
    // It must never change the component width/height or linkage state.
    item.objectFit = mode;

    persistProject();
    renderProjectComponents();
    assignIds();

    const node =
      root.querySelector(
        `[data-dev-custom="${item.id}"]`
      );

    openEditorFor(node);

    showToast(
      mode === "contain"
        ? "完整显示"
        : mode === "cover"
          ? "已铺满并裁剪"
          : "已拉伸填满"
    );
  }

  function toggleAspectLock() {
    const item =
      selectedImageItem();

    if (!item) return;

    pushHistory();

    item.lockAspect =
      item.lockAspect === false;

    if (
      item.lockAspect &&
      item.aspectRatio
    ) {
      item.objectFit = "contain";
      item.height =
        Math.max(
          24,
          Math.round(
            item.width /
            item.aspectRatio
          )
        );
    } else {
      item.objectFit = "fill";
    }

    persistProject();
    renderProjectComponents();
    assignIds();

    const node =
      root.querySelector(
        `[data-dev-custom="${item.id}"]`
      );

    openEditorFor(node);
  }

  function fillCanvasWithSelectedImage() {
    const item =
      selectedImageItem();

    if (!item) return;

    const parent =
      projectPageRoot();

    const rect =
      logicalRect(
        parent
      );

    pushHistory();

    state.project.components =
      state.project.components.filter(
        entry =>
          entry.id === item.id ||
          !(
            entry.page ===
              getActivePage() &&
            entry.type ===
              "image" &&
            (
              entry.role ===
                "background" ||
              isBackgroundAssetName(
                entry.name
              )
            )
          )
      );

    item.role =
      "background";
    item.name =
      "00_home_background";
    item.positionParent =
      "canvas";
    item.anchor =
      "top-left";
    item.x = 0;
    item.y = 0;
    item.width =
      Math.round(rect.width);
    item.height =
      Math.round(rect.height);
    item.objectFit = "cover";
    item.objectPosition =
      item.objectPosition ||
      "center";
    item.lockAspect = false;
    item.zIndex = 0;
    item.backgroundInitialized =
      true;

    persistProject();
    renderProjectComponents();
    assignIds();

    const node =
      root.querySelector(
        `[data-dev-custom="${item.id}"]`
      );

    openEditorFor(node);
    showToast(
      "已设为全屏背景，会随屏幕自动适配"
    );
  }

  function chooseImage(mode) {
    state.uploadMode = mode;
    fileInput.value = "";
    fileInput.click();
  }

  async function handleImageFile(file) {
    if (!file) return;

    const src =
      await optimizeImage(
        file
      );

    pushHistory();

    if (
      state.uploadMode ===
      "replace"
    ) {
      const info =
        selectedInfo();

      if (
        !info ||
        !info.isImage
      ) {
        showToast(
          "请先选中图片"
        );
        return;
      }

      if (info.customId) {
        const item =
          customComponentById(
            info.customId
          );

        if (
          item &&
          item.type === "image"
        ) {
          const dimensions =
            await measureImage(src);

          item.src = src;
          item.naturalWidth =
            dimensions.width;
          item.naturalHeight =
            dimensions.height;
          item.aspectRatio =
            dimensions.width /
            dimensions.height;

          if (
            item.lockAspect !== false &&
            item.width
          ) {
            item.height =
              Math.max(
                24,
                Math.round(
                  item.width /
                  item.aspectRatio
                )
              );
          }

          persistProject();
          renderProjectComponents();
          assignIds();

          const node =
            root.querySelector(
              `[data-dev-custom="${item.id}"]`
            );

          openEditorFor(node);
        }
      } else if (
        state.selected instanceof
        HTMLImageElement
      ) {
        if (
          !state.selected.dataset
            .devOriginalSrc
        ) {
          state.selected.dataset.devOriginalSrc =
            state.selected.getAttribute("src") || "";
        }

        state.project
          .assetOverrides[
            info.id
          ] = src;

        persistProject();
        state.selected.src = src;
        renderSelectionChrome();
        renderPanel();
      }

      showToast("图片已替换");
      return;
    }

    const parent =
      projectPageRoot();

    const parentRect =
      logicalRect(
        parent
      );

    const dimensions =
      await measureImage(src);

    const aspectRatio =
      Math.max(
        .05,
        dimensions.width /
        dimensions.height
      );

    const maxWidth =
      Math.max(
        96,
        Math.round(
          parentRect.width -
          16
        )
      );

    const maxHeight =
      Math.max(
        48,
        Math.round(
          parentRect.height *
          .82
        )
      );

    let width =
      Math.min(
        maxWidth,
        Math.max(
          96,
          Math.round(
            parentRect.width *
            .92
          )
        )
      );

    let height =
      width /
      aspectRatio;

    if (
      height >
      maxHeight
    ) {
      height =
        maxHeight;
      width =
        height *
        aspectRatio;
    }

    width =
      Math.max(
        24,
        Math.round(width)
      );

    height =
      Math.max(
        24,
        Math.round(height)
      );

    const background =
      state.uploadMode ===
        "background" ||
      isBackgroundAssetName(
        file.name
      );

    if (background) {
      state.project.components =
        state.project.components.filter(
          entry =>
            !(
              entry.page ===
                getActivePage() &&
              entry.type ===
                "image" &&
              (
                entry.role ===
                  "background" ||
                isBackgroundAssetName(
                  entry.name
                )
              )
            )
        );
    }

    const item = {
      id: nextCustomId(),
      page:
        getActivePage(),
      type: "image",
      positionParent:
        "canvas",
      anchor:
        "top-left",
      role:
        background
          ? "background"
          : "component",
      src,
      name:
        background
          ? "00_home_background"
          : (
              file.name ||
              "image"
            ),
      x:
        background
          ? 0
          : Math.round(
              (
                parentRect.width -
                width
              ) / 2
            ),
      y:
        background
          ? 0
          : Math.max(
              0,
              Math.round(
                (
                  parentRect.height -
                  Math.min(
                    height,
                    parentRect.height
                  )
                ) / 2
              )
            ),
      width:
        background
          ? Math.round(
              parentRect.width
            )
          : width,
      height:
        background
          ? Math.round(
              parentRect.height
            )
          : height,
      naturalWidth:
        dimensions.width,
      naturalHeight:
        dimensions.height,
      aspectRatio,
      lockAspect: false,
      zIndex:
        background
          ? 0
          : 40,
      opacity: 1,
      objectFit:
        background
          ? "cover"
          : "contain",
      objectPosition: "center",
      backgroundInitialized:
        background
    };

    state.project.components.push(
      item
    );

    persistProject();
    renderProjectComponents();
    assignIds();

    const node =
      root.querySelector(
        `[data-dev-custom="${item.id}"]`
      );

    openEditorFor(node);
    showToast("图片组件已添加");
  }

  fileInput.addEventListener(
    "change",
    () => {
      handleImageFile(
        fileInput.files?.[0]
      ).catch(
        () =>
          showToast(
            "图片导入失败"
          )
      );
    }
  );

  function clearAll() {
    if (
      !Object.keys(
        state.overrides
      ).length &&
      !state.project
        .components.length &&
      !Object.keys(
        state.project
          .assetOverrides
      ).length
    ) {
      return;
    }

    pushHistory();

    removeOverrideStyles(
      state.overrides
    );

    for (
      const id
      of Object.keys(
        state.project
          .assetOverrides
      )
    ) {
      const node =
        candidates().find(
          item =>
            item.dataset.devId === id
        );

      if (
        node instanceof
          HTMLImageElement &&
        node.dataset
          .devOriginalSrc
      ) {
        node.src =
          node.dataset
            .devOriginalSrc;
      }
    }

    state.overrides = {};
    state.project = {
      components: [],
      assetOverrides: {}
    };

    writeOverrides(
      state.overrides
    );
    persistProject();

    state.selected = null;
    renderProjectComponents();
    chrome.classList.remove(
      "is-visible"
    );
    renderPanel();
  }

  function runAudit({ keepTab = false } = {}) {
    assignIds();

    state.report = auditUi({
      root,
      sheetRoot,
      allowedPages
    });

    if (!keepTab) {
      state.tab = "audit";
    }

    state.open = true;
    renderPanel();

    return state.report;
  }

  function exportJson() {
    const payload = {
      version: 5,
      page: getActivePage(),
      layoutMode: "component-layout-v6-responsive-logical-space",
      overrides:
        state.overrides,
      project:
        state.project
    };

    const json = JSON.stringify(payload, null, 2);

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(json).catch(() => {
        copyFallback(json);
      });
    } else {
      copyFallback(json);
    }

    showToast("配置已复制");
  }

  function copyFallback(value) {
    const area = document.createElement("textarea");
    area.value = value;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    document.execCommand?.("copy");
    area.remove();
  }

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "ui-dev-toast";
    toast.textContent = message;
    host.append(toast);

    setTimeout(() => {
      toast.remove();
    }, 1300);
  }

  function activeProjectLayers() {
    const pageItems =
      state.project.components
        .filter(
          item =>
            item.page ===
            getActivePage()
        );

    const order =
      new Map(
        pageItems.map(
          (item, index) =>
            [item.id, index]
        )
      );

    return pageItems
      .slice()
      .sort(
        (a, b) => {
          const zDiff =
            Number(b.zIndex ?? 20) -
            Number(a.zIndex ?? 20);

          if (zDiff !== 0) {
            return zDiff;
          }

          return (
            Number(order.get(b.id) || 0) -
            Number(order.get(a.id) || 0)
          );
        }
      );
  }

  function sameZCount(zIndex) {
    return state.project.components
      .filter(
        item =>
          item.page ===
            getActivePage() &&
          Number(item.zIndex ?? 20) ===
            Number(zIndex)
      )
      .length;
  }

  function selectedCustomId() {
    return state.selected?.dataset?.devCustom || "";
  }

  function selectProjectLayer(id) {
    const node =
      root.querySelector(
        `[data-dev-custom="${id}"]`
      );

    if (!node) return;

    openEditorFor(node);
  }

  function refreshProjectSelection(id) {
    renderProjectComponents();
    assignIds();

    const node =
      root.querySelector(
        `[data-dev-custom="${id}"]`
      );

    state.selected = node || null;

    if (state.selected) {
      state.selected.classList.add(
        "dev-selected-outline"
      );
    }

    renderSelectionChrome();
    renderPanel();
  }

  function renameSelected(rawName) {
    const info =
      selectedInfo();

    if (!info?.customId) return;

    const item =
      customComponentById(
        info.customId
      );

    if (!item) return;

    const name =
      String(rawName || "")
        .trim()
        .slice(0, 64);

    if (!name || name === item.name) {
      return;
    }

    pushHistory();
    item.name = name;
    persistProject();
    renderPanel();
  }

  function toggleComponentLock(id) {
    const item =
      customComponentById(id);

    if (!item) return;

    pushHistory();
    item.locked =
      item.locked !== true;
    persistProject();
    refreshProjectSelection(id);

    showToast(
      item.locked
        ? "组件已锁定"
        : "组件已解锁"
    );
  }

  function toggleComponentVisibility(id) {
    const item =
      customComponentById(id);

    if (!item) return;

    pushHistory();
    item.hidden =
      item.hidden !== true;
    persistProject();
    refreshProjectSelection(id);

    showToast(
      item.hidden
        ? "组件已隐藏，可从图层列表恢复"
        : "组件已显示"
    );
  }

  function toggleGuides() {
    state.guides =
      !state.guides;
    renderSelectionChrome();
    renderPanel();
  }

  function layerListMarkup() {
    const layers =
      activeProjectLayers();

    if (!layers.length) {
      return `
        <section class="dev-layer-panel">
          <div class="dev-layer-panel-head">
            <strong>图层</strong>
            <button type="button" data-dev-guides>
              参考线：${state.guides ? "开" : "关"}
            </button>
          </div>
          <div class="dev-layer-empty">还没有上传组件</div>
        </section>
      `;
    }

    const selectedId =
      selectedCustomId();

    return `
      <section class="dev-layer-panel">
        <div class="dev-layer-panel-head">
          <strong>图层 · ${layers.length} · 上方=画面前层</strong>
          <button type="button" data-dev-guides>
            参考线：${state.guides ? "开" : "关"}
          </button>
        </div>

        <div class="dev-layer-list">
          ${layers.map(item => `
            <div class="dev-layer-row ${selectedId === item.id ? "is-selected" : ""} ${item.hidden ? "is-hidden" : ""}">
              <button
                class="dev-layer-select"
                type="button"
                data-dev-layer-select="${item.id}"
              >
                <span>Z${Number(item.zIndex ?? 20)}</span>
                <strong>${escapeHtml(item.name || item.id)}</strong>
              </button>

              <button
                class="dev-layer-mini ${item.hidden ? "is-active" : ""}"
                type="button"
                data-dev-layer-visible="${item.id}"
                aria-label="${item.hidden ? "显示" : "隐藏"}"
              >${item.hidden ? "显" : "隐"}</button>

              <button
                class="dev-layer-mini ${item.locked ? "is-active" : ""}"
                type="button"
                data-dev-layer-lock="${item.id}"
                aria-label="${item.locked ? "解锁" : "锁定"}"
              >${item.locked ? "锁" : "开"}</button>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }

  function openEditorFor(node) {
    if (!node) return;

    document
      .querySelectorAll(".dev-selected-outline")
      .forEach(item => item.classList.remove("dev-selected-outline"));

    state.selected = node;
    state.selected.classList.add("dev-selected-outline");
    state.selecting = false;
    state.open = true;
    state.tab = "edit";

    renderPanel();
  }

  function startSelecting(scope = "any") {
    state.selecting = true;
    state.selectionScope = scope;
    state.open = false;
    renderPanel();
  }

  function startLayoutSelecting() {
    startSelecting("layout");
  }

  function startDragMode() {
    const info = selectedInfo();

    if (
      !info ||
      (
        !info.layoutKey &&
        !info.customId
      )
    ) {
      showToast("请先选择组件");
      return;
    }

    if (info.locked) {
      showToast("组件已锁定");
      return;
    }

    state.dragMode = true;
    state.open = false;
    renderPanel();
  }

  function finishDragMode() {
    state.dragMode = false;
    state.dragPointer = null;
    state.open = true;
    writeOverrides(state.overrides);
    renderPanel();
  }

  function issueMarkup() {
    const report = state.report;

    if (!report) {
      return '<div class="dev-empty">还没检查。点“立即体检”即可扫描当前页面。</div>';
    }

    if (!report.issues.length) {
      return '<div class="dev-empty good">当前页面没有发现 UI 错误或警告。</div>';
    }

    return report.issues
      .slice(0, 40)
      .map(item => `
        <button
          class="dev-issue ${item.level}"
          type="button"
          data-dev-jump="${encodeURIComponent(item.selector || "")}"
        >
          <strong>${item.level === "error" ? "错误" : "警告"} · ${item.code}</strong>
          <span>${item.message}</span>
          ${item.element ? `<small>${item.element}</small>` : ""}
        </button>
      `)
      .join("");
  }

  function stepper(label, property, value, step) {
    return `
      <div class="dev-stepper">
        <span>${label}</span>
        <button type="button" data-dev-adjust="${property}:${-step}">−</button>
        <strong>${value}px</strong>
        <button type="button" data-dev-adjust="${property}:${step}">＋</button>
      </div>
    `;
  }

  function editorMarkup() {
    const info = selectedInfo();
    const layers =
      layerListMarkup();

    if (!info) {
      return `
        ${layers}
        <div class="dev-empty">
          第一步先放主页背景。点“上传主页背景”选择图片，系统会自动置底、铺满并按屏幕比例裁剪；其他素材再用“＋ 上传组件”。
        </div>
      `;
    }

    return `
      ${layers}

      <div class="dev-selected-card">
        <div>
          <small>当前选中</small>
          <strong>${escapeHtml(info.label)}</strong>
        </div>
        <span>${info.rect.width}×${info.rect.height}</span>
      </div>

      ${
        info.customId
          ? `
            <section class="dev-component-settings">
              <label class="dev-name-field">
                <span>组件名称</span>
                <input
                  type="text"
                  maxlength="64"
                  value="${escapeHtml(info.label)}"
                  data-dev-name-input
                >
              </label>

              <div class="dev-component-actions">
                <button
                  type="button"
                  class="${info.locked ? "is-active" : ""}"
                  data-dev-toggle-lock="${info.customId}"
                >${info.locked ? "已锁定" : "锁定"}</button>

                <button
                  type="button"
                  class="${info.hidden ? "is-active" : ""}"
                  data-dev-toggle-visible="${info.customId}"
                >${info.hidden ? "已隐藏" : "隐藏"}</button>
              </div>
            </section>
          `
          : ""
      }

      ${
        info.imageSettings
          ? `
            <section class="dev-image-settings dev-image-settings-priority">
              <div class="dev-image-settings-head">
                <div>
                  <strong>图片尺寸</strong>
                  <small>
                    原图 ${info.imageSettings.naturalWidth || "--"}×${info.imageSettings.naturalHeight || "--"}
                  </small>
                </div>

                <button
                  type="button"
                  class="${info.imageSettings.lockAspect ? "is-active" : ""}"
                  data-dev-aspect-lock
                >
                  ${info.imageSettings.lockAspect ? "宽高联动：开" : "宽高联动：关"}
                </button>
              </div>

              <div class="dev-image-repair-actions">
                <button
                  class="primary"
                  type="button"
                  data-dev-repair-image
                >修复外框</button>
                <button
                  type="button"
                  data-dev-natural-width
                >原比例铺满宽度</button>
              </div>

              <div class="dev-fit-actions">
                <button
                  type="button"
                  class="${info.imageSettings.objectFit === "contain" ? "is-active" : ""}"
                  data-dev-fit="contain"
                >完整显示</button>
                <button
                  type="button"
                  class="${info.imageSettings.objectFit === "cover" ? "is-active" : ""}"
                  data-dev-fit="cover"
                >铺满裁剪</button>
                <button
                  type="button"
                  class="${info.imageSettings.objectFit === "fill" ? "is-active" : ""}"
                  data-dev-fit="fill"
                >拉伸填满</button>
              </div>
            </section>
          `
          : ""
      }

      ${
        info.customId
          ? `
            <section class="dev-align-settings dev-align-settings-priority">
              <strong>快速对齐</strong>
              <div class="dev-align-actions">
                <button type="button" data-dev-align="left">左</button>
                <button type="button" data-dev-align="center-x">水平居中</button>
                <button type="button" data-dev-align="right">右</button>
                <button type="button" data-dev-align="top">顶</button>
                <button type="button" data-dev-align="center-y">垂直居中</button>
                <button type="button" data-dev-align="bottom">底</button>
              </div>

              <strong>尺寸快捷</strong>
              <div class="dev-size-actions">
                <button type="button" data-dev-size="width">只铺满宽度</button>
                <button type="button" data-dev-size="height">只铺满高度</button>
                <button type="button" data-dev-size="canvas">铺满定位区</button>
                ${
                  info.imageSettings
                    ? '<button type="button" data-dev-natural-ratio>外框恢复原比例</button>'
                    : ""
                }
              </div>
            </section>
          `
          : ""
      }

      ${
        info.customId &&
        info.role !== "background"
          ? `
            <section class="dev-anchor-settings">
              <div class="dev-anchor-head">
                <strong>定位与锚点</strong>
                <small>X/Y 为相对当前锚点的偏移</small>
              </div>

              <div class="dev-parent-actions">
                <button
                  type="button"
                  class="${info.positionParent === "canvas" ? "is-active" : ""}"
                  data-dev-position-parent="canvas"
                >实际画布</button>
                <button
                  type="button"
                  class="${info.positionParent === "safe" ? "is-active" : ""}"
                  data-dev-position-parent="safe"
                >安全区</button>
                <button
                  type="button"
                  class="${info.positionParent === "reference" ? "is-active" : ""}"
                  data-dev-position-parent="reference"
                >540×960框</button>
              </div>

              <div class="dev-anchor-grid">
                ${[
                  ["top-left","↖"],
                  ["top-center","↑"],
                  ["top-right","↗"],
                  ["center-left","←"],
                  ["center","●"],
                  ["center-right","→"],
                  ["bottom-left","↙"],
                  ["bottom-center","↓"],
                  ["bottom-right","↘"]
                ].map(([key,label]) => `
                  <button
                    type="button"
                    class="${info.anchor === key ? "is-active" : ""}"
                    data-dev-anchor="${key}"
                    aria-label="${key}"
                  >${label}</button>
                `).join("")}
              </div>

              <p class="dev-anchor-help">
                顶部 HUD：建议“安全区 + 左上/上中/右上”；底部导航：建议“安全区 + 左下/下中/右下”。
              </p>
            </section>
          `
          : ""
      }

      ${
        info.customId
          ? `
            <section class="dev-precise-settings">
              <div class="dev-precise-head">
                <strong>精确坐标</strong>
                <small>逻辑坐标，不受手机分辨率影响</small>
              </div>

              <div class="dev-precise-grid">
                <label><span>X</span><input type="number" inputmode="numeric" value="${info.values.left}" data-dev-exact="x" ${info.locked ? "disabled" : ""}></label>
                <label><span>Y</span><input type="number" inputmode="numeric" value="${info.values.top}" data-dev-exact="y" ${info.locked ? "disabled" : ""}></label>
                <label><span>W</span><input type="number" inputmode="numeric" min="24" value="${info.values.width}" data-dev-exact="width" ${info.locked ? "disabled" : ""}></label>
                <label><span>H</span><input type="number" inputmode="numeric" min="24" value="${info.values.height}" data-dev-exact="height" ${info.locked ? "disabled" : ""}></label>
                <label><span>Z</span><input type="number" inputmode="numeric" value="${info.values.zIndex}" data-dev-exact="zIndex"></label>
              </div>

              <p class="dev-z-help ${sameZCount(info.values.zIndex) > 1 ? "has-conflict" : ""}">
                Z 只控制前后覆盖，不会改变大小或位置。
                ${sameZCount(info.values.zIndex) > 1
                  ? `当前有 ${sameZCount(info.values.zIndex)} 个组件同为 Z=${info.values.zIndex}；同层时图层列表越靠上，画面越靠前。`
                  : `当前 Z=${info.values.zIndex} 无同层冲突。`
                }
              </p>
            </section>
          `
          : ""
      }

      <div class="dev-editor-grid">
        ${
          info.imageSettings
            ? ""
            : stepper("字号", "fontSize", info.values.fontSize, 1)
        }
        ${
          info.imageSettings
            ? ""
            : stepper("内边距", "padding", info.values.padding, 2)
        }
        ${stepper("宽度", "width", info.values.width, 4)}
        ${stepper("高度", "height", info.values.height, 4)}
        ${stepper("左右", "left", info.values.left, 4)}
        ${stepper("上下", "top", info.values.top, 4)}
        ${stepper("圆角", "borderRadius", info.values.borderRadius, 2)}
      </div>

      <p class="dev-resize-help">
        宽高联动关闭时，宽度和高度完全独立。图片里的“完整显示/裁剪/拉伸”只改变图片在外框内的显示方式，不会再自动修改宽高。
      </p>

      <div class="dev-layout-actions">
        ${
          info.layoutKey || info.customId
            ? `
              <button class="primary" type="button" data-dev-drag ${info.locked ? "disabled" : ""}>
                ${info.locked ? "组件已锁定" : "拖动当前组件"}
              </button>
            `
            : ""
        }
        <button type="button" data-dev-duplicate>复制</button>
        ${
          info.customId
            ? '<button class="danger" type="button" data-dev-delete>删除上传组件</button>'
            : ""
        }
        <span>吸附 ${state.snap}px</span>
      </div>

      <div class="dev-asset-actions">
        <button class="primary" type="button" data-dev-upload-background>上传主页背景</button>
        <button type="button" data-dev-upload>＋ 上传图片组件</button>
        ${
          info.isImage
            ? '<button type="button" data-dev-replace-image>替换图片</button>'
            : ""
        }
      </div>

      ${
        info.imageSettings
          ? `
            <button
              class="dev-fill-canvas"
              type="button"
              data-dev-fill-canvas
            >设为全屏背景（自动适配）</button>
          `
          : ""
      }

      <div class="dev-layer-actions">
        <span>图层 Z=${info.values.zIndex}</span>
        <button type="button" data-dev-layer="back">置底</button>
        <button type="button" data-dev-layer="down">下一层</button>
        <button type="button" data-dev-layer="up">上一层</button>
        <button type="button" data-dev-layer="front">置顶</button>
      </div>

      <div class="dev-selected-meta">
        <span>${info.action || "无动作"}</span>
        <span>${info.bound ? "事件已绑定" : "无事件"}</span>
        ${info.customId ? `<span>自定义：${info.customId}</span>` : ""}
        <span>层级：${info.values.zIndex}</span>
      </div>
    `;
  }

  function auditSummaryMarkup() {
    const report = state.report;

    return `
      <div class="dev-audit-summary">
        <article><span>健康</span><strong>${report?.score ?? "--"}</strong></article>
        <article><span>错误</span><strong>${report?.errors ?? "--"}</strong></article>
        <article><span>警告</span><strong>${report?.warnings ?? "--"}</strong></article>
        <article><span>按钮</span><strong>${report ? `${report.boundButtons}/${report.checkedButtons}` : "--"}</strong></article>
      </div>
    `;
  }

  function configMarkup() {
    const report = state.report;
    const changes =
      Object.keys(
        state.overrides
      ).length +
      state.project
        .components.length +
      Object.keys(
        state.project
          .assetOverrides
      ).length;

    return `
      <div class="dev-config-summary">
        <article>
          <span>已修改元素</span>
          <strong>${changes}</strong>
        </article>
        <article>
          <span>数据绑定</span>
          <strong>${report?.bindings?.length ?? "--"}</strong>
        </article>
        <article>
          <span>图片素材</span>
          <strong>${report?.assets?.length ?? "--"}</strong>
        </article>
        <article>
          <span>组件</span>
          <strong>${(report?.components?.length ?? 0) + state.project.components.length}</strong>
        </article>
      </div>

      <p class="dev-help">
        调整只保存在当前手机。点“复制配置”后把内容发给我，我再正式合并进仓库。
      </p>
    `;
  }

  function capturePanelScroll() {
    const body =
      host.querySelector(
        ".ui-dev-body"
      );

    if (!body) {
      return;
    }

    const tab =
      body.dataset.devBodyTab ||
      state.tab;

    state.panelScroll[tab] =
      body.scrollTop;
  }

  function restorePanelScroll() {
    const body =
      host.querySelector(
        ".ui-dev-body"
      );

    if (!body) {
      return;
    }

    const tab =
      body.dataset.devBodyTab ||
      state.tab;

    const top =
      Number(
        state.panelScroll[tab] || 0
      );

    body.scrollTop = top;

    requestAnimationFrame(
      () => {
        if (
          document.contains(body)
        ) {
          body.scrollTop = top;
        }
      }
    );
  }

  function renderPanel() {
    capturePanelScroll();
    renderSelectionChrome();

    if (state.dragMode) {
      const info = selectedInfo();

      host.innerHTML = `
        <div class="ui-dev-drag-bar">
          <div>
            <strong>拖动排版</strong>
            <span>${info?.layoutKey || info?.customId || "组件"}</span>
          </div>
          <div class="dev-snap-group">
            ${[1,4,8].map(value => `
              <button
                type="button"
                class="${state.snap === value ? "is-active" : ""}"
                data-dev-snap="${value}"
              >${value}px</button>
            `).join("")}
          </div>
          <button class="finish" type="button" data-dev-finish-drag>
            完成
          </button>
        </div>
      `;

      bindPanelEvents();
      return;
    }

    if (state.selecting) {
      host.innerHTML = `
        <div class="ui-dev-select-bar">
          <strong>点选模式</strong>
          <span>${
            state.selectionScope === "layout"
              ? "只会选中已上传组件"
              : "直接点要修改的图片、卡片或按钮"
          }</span>
          <button type="button" data-dev-cancel-select>取消</button>
        </div>
      `;

      bindPanelEvents();
      return;
    }

    if (!state.open) {
      host.innerHTML = `
        <button
          class="ui-dev-launcher"
          type="button"
          data-dev-open
          aria-label="打开 UI 编辑器"
        >UI</button>
      `;

      bindPanelEvents();
      return;
    }

    host.innerHTML = `
      <section class="ui-dev-sheet ${state.expanded ? "is-expanded" : ""} ${state.dock === "top" ? "is-top" : ""}">
        <div class="ui-dev-grabber"></div>

        <header class="ui-dev-sheet-header">
          <div>
            <small>DEV · ${getActivePage()}</small>
            <strong>UI 工具</strong>
          </div>

          <div class="dev-header-actions">
            <button type="button" data-dev-undo ${state.undoStack.length ? "" : "disabled"}>↶</button>
            <button type="button" data-dev-redo ${state.redoStack.length ? "" : "disabled"}>↷</button>
            <button type="button" data-dev-dock>${state.dock === "bottom" ? "上移" : "下移"}</button>
            <button type="button" data-dev-expand>${state.expanded ? "收起" : "展开"}</button>
            <button type="button" data-dev-close>×</button>
          </div>
        </header>

        <div class="ui-dev-quickbar">
          ${
            getActivePage() === "store"
              ? '<button class="primary" type="button" data-dev-layout-select>上传排版</button>'
              : '<button class="primary" type="button" data-dev-select>点选界面</button>'
          }
          <button type="button" data-dev-select>自由点选</button>
          <button class="primary" type="button" data-dev-upload-background>上传主页背景</button>
          <button type="button" data-dev-upload>＋ 上传组件</button>
          <button type="button" data-dev-guides>参考线：${state.guides ? "开" : "关"}</button>
          <button type="button" data-dev-audit>立即体检</button>
          <button type="button" data-dev-copy>复制配置</button>
        </div>

        <nav class="ui-dev-tabs">
          <button class="${state.tab === "edit" ? "is-active" : ""}" data-dev-tab="edit">编辑</button>
          <button class="${state.tab === "audit" ? "is-active" : ""}" data-dev-tab="audit">体检</button>
          <button class="${state.tab === "config" ? "is-active" : ""}" data-dev-tab="config">配置</button>
        </nav>

        <div
          class="ui-dev-body"
          data-dev-body-tab="${state.tab}"
        >
          ${state.tab === "edit" ? editorMarkup() : ""}

          ${state.tab === "audit" ? `
            ${auditSummaryMarkup()}
            <div class="dev-issues">${issueMarkup()}</div>
          ` : ""}

          ${state.tab === "config" ? `
            ${configMarkup()}
            <div class="dev-config-actions">
              <button type="button" data-dev-copy>复制配置</button>
              <button type="button" data-dev-reset-selected ${selectedInfo() ? "" : "disabled"}>重置当前</button>
              <button class="danger" type="button" data-dev-clear>清空全部调整</button>
            </div>
          ` : ""}
        </div>
      </section>
    `;

    bindPanelEvents();

    const body =
      host.querySelector(
        ".ui-dev-body"
      );

    if (body) {
      body.scrollTop =
        state.panelScroll[
          state.tab
        ] || 0;
    }
  }

  function findByDevId(id) {
    if (!id) return null;

    return candidates().find(
      item => item.dataset.devId === id
    ) || null;
  }

  function bindPanelEvents() {
    const panelBody =
      host.querySelector(
        ".ui-dev-body"
      );

    panelBody?.addEventListener(
      "scroll",
      () => {
        state.panelScroll[
          state.tab
        ] =
          panelBody.scrollTop;
      },
      {
        passive: true
      }
    );

    host.querySelector("[data-dev-open]")?.addEventListener(
      "click",
      togglePanel
    );

    host.querySelector("[data-dev-close]")?.addEventListener("click", () => {
      state.open = false;
      renderPanel();
    });

    host.querySelector("[data-dev-dock]")?.addEventListener("click", () => {
      state.dock =
        state.dock === "bottom"
          ? "top"
          : "bottom";
      renderPanel();
    });

    host.querySelector("[data-dev-expand]")?.addEventListener("click", () => {
      state.expanded = !state.expanded;
      renderPanel();
    });

    host.querySelector("[data-dev-undo]")?.addEventListener("click", undo);
    host.querySelector("[data-dev-redo]")?.addEventListener("click", redo);

    host.querySelectorAll("[data-dev-tab]").forEach(button => {
      button.addEventListener("click", () => {
        const currentBody =
          host.querySelector(
            ".ui-dev-body"
          );

        if (currentBody) {
          state.panelScroll[
            state.tab
          ] =
            currentBody.scrollTop;
        }

        state.tab =
          button.dataset.devTab;

        renderPanel();
      });
    });

    host.querySelectorAll("[data-dev-select]").forEach(button => {
      button.addEventListener(
        "click",
        () => startSelecting("any")
      );
    });

    host.querySelectorAll("[data-dev-layout-select]").forEach(button => {
      button.addEventListener(
        "click",
        startLayoutSelecting
      );
    });

    host.querySelectorAll("[data-dev-drag]").forEach(button => {
      button.addEventListener(
        "click",
        startDragMode
      );
    });

    host.querySelectorAll("[data-dev-snap]").forEach(button => {
      button.addEventListener(
        "click",
        () => {
          state.snap =
            Number(
              button.dataset.devSnap
            ) || 4;
          renderPanel();
        }
      );
    });

    host.querySelector("[data-dev-finish-drag]")?.addEventListener(
      "click",
      finishDragMode
    );

    host.querySelector("[data-dev-cancel-select]")?.addEventListener(
      "click",
      () => {
        state.selecting = false;
        state.open = true;
        renderPanel();
      }
    );

    host.querySelectorAll("[data-dev-audit]").forEach(button => {
      button.addEventListener("click", () => runAudit());
    });

    host.querySelectorAll("[data-dev-copy]").forEach(button => {
      button.addEventListener("click", exportJson);
    });


    host.querySelectorAll("[data-dev-layer-select]").forEach(button => {
      button.addEventListener(
        "click",
        () =>
          selectProjectLayer(
            button.dataset.devLayerSelect
          )
      );
    });

    host.querySelectorAll("[data-dev-layer-visible]").forEach(button => {
      button.addEventListener(
        "click",
        () =>
          toggleComponentVisibility(
            button.dataset.devLayerVisible
          )
      );
    });

    host.querySelectorAll("[data-dev-layer-lock]").forEach(button => {
      button.addEventListener(
        "click",
        () =>
          toggleComponentLock(
            button.dataset.devLayerLock
          )
      );
    });

    host.querySelectorAll("[data-dev-toggle-lock]").forEach(button => {
      button.addEventListener(
        "click",
        () =>
          toggleComponentLock(
            button.dataset.devToggleLock
          )
      );
    });

    host.querySelectorAll("[data-dev-toggle-visible]").forEach(button => {
      button.addEventListener(
        "click",
        () =>
          toggleComponentVisibility(
            button.dataset.devToggleVisible
          )
      );
    });

    host.querySelectorAll("[data-dev-guides]").forEach(button => {
      button.addEventListener(
        "click",
        toggleGuides
      );
    });

    host.querySelector("[data-dev-name-input]")?.addEventListener(
      "change",
      event => {
        renameSelected(
          event.target.value
        );
      }
    );
    host.querySelectorAll("[data-dev-adjust]").forEach(button => {
      button.addEventListener("click", () => {
        const [property, rawDelta] =
          button.dataset.devAdjust.split(":");

        adjust(property, Number(rawDelta));
      });
    });


    host.querySelectorAll("[data-dev-exact]").forEach(input => {
      const apply = () =>
        setExactValue(
          input.dataset.devExact,
          input.value
        );

      input.addEventListener(
        "pointerdown",
        event => {
          event.stopPropagation();
        }
      );

      input.addEventListener(
        "click",
        event => {
          event.stopPropagation();
        }
      );

      input.addEventListener(
        "change",
        apply
      );

      input.addEventListener(
        "keydown",
        event => {
          if (event.key === "Enter") {
            event.preventDefault();
            apply();
            input.blur();
          }
        }
      );
    });
    host.querySelector("[data-dev-reset-selected]")?.addEventListener(
      "click",
      resetSelected
    );

    host.querySelector("[data-dev-delete]")?.addEventListener(
      "click",
      deleteSelected
    );

    host.querySelector("[data-dev-duplicate]")?.addEventListener(
      "click",
      duplicateSelected
    );

    host.querySelectorAll("[data-dev-upload]").forEach(button => {
      button.addEventListener(
        "click",
        () => chooseImage("add")
      );
    });

    host.querySelectorAll("[data-dev-upload-background]").forEach(button => {
      button.addEventListener(
        "click",
        () => chooseImage("background")
      );
    });

    host.querySelector("[data-dev-replace-image]")?.addEventListener(
      "click",
      () => chooseImage("replace")
    );

    host.querySelectorAll("[data-dev-layer]").forEach(button => {
      button.addEventListener(
        "click",
        () =>
          setLayer(
            button.dataset.devLayer
          )
      );
    });

    host.querySelectorAll("[data-dev-position-parent]").forEach(button => {
      button.addEventListener(
        "click",
        () =>
          setPlacementParent(
            button.dataset.devPositionParent
          )
      );
    });

    host.querySelectorAll("[data-dev-anchor]").forEach(button => {
      button.addEventListener(
        "click",
        () =>
          setAnchor(
            button.dataset.devAnchor
          )
      );
    });

    host.querySelectorAll("[data-dev-align]").forEach(button => {
      button.addEventListener(
        "click",
        () =>
          alignSelected(
            button.dataset.devAlign
          )
      );
    });

    host.querySelectorAll("[data-dev-size]").forEach(button => {
      button.addEventListener(
        "click",
        () =>
          sizeSelected(
            button.dataset.devSize
          )
      );
    });

    host.querySelector("[data-dev-natural-ratio]")?.addEventListener(
      "click",
      restoreNaturalRatio
    );

    host.querySelector("[data-dev-repair-image]")?.addEventListener(
      "click",
      repairSelectedImageFrame
    );

    host.querySelector("[data-dev-natural-width]")?.addEventListener(
      "click",
      fitImageNaturalWidth
    );

    host.querySelectorAll("[data-dev-fit]").forEach(button => {
      button.addEventListener(
        "click",
        () =>
          setImageFit(
            button.dataset.devFit
          )
      );
    });

    host.querySelector("[data-dev-aspect-lock]")?.addEventListener(
      "click",
      toggleAspectLock
    );

    host.querySelector("[data-dev-fill-canvas]")?.addEventListener(
      "click",
      fillCanvasWithSelectedImage
    );

    host.querySelector("[data-dev-clear]")?.addEventListener(
      "click",
      clearAll
    );

    host.querySelectorAll("[data-dev-jump]").forEach(button => {
      button.addEventListener("click", () => {
        const id = decodeURIComponent(
          button.dataset.devJump || ""
        );

        const node = findByDevId(id);

        if (!node) return;

        openEditorFor(node);
      });
    });
  }

  function handleSelection(event) {
    if (!state.selecting) return;
    if (event.target.closest("#ui-dev-root")) return;

    const node =
      state.selectionScope === "layout"
        ? event.target.closest(
            "[data-layout-key],[data-dev-custom]"
          )
        : normalizeSelection(
            event.target,
            root,
            sheetRoot
          );

    if (
      !node ||
      !(
        root.contains(node) ||
        sheetRoot.contains(node)
      )
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    openEditorFor(node);
  }

  document.addEventListener(
    "click",
    handleSelection,
    true
  );

  function beginResize(event) {
    const handle =
      event.target.closest(
        "[data-dev-resize]"
      );

    if (
      !handle ||
      !state.selected ||
      !document.contains(
        state.selected
      )
    ) {
      return;
    }

    const info =
      selectedInfo();

    if (!info) return;

    pushHistory();

    const rect =
      state.selected
        .getBoundingClientRect();

    const computed =
      getComputedStyle(
        state.selected
      );

    const styles =
      ensureSelectedOverride(
        info
      );

    if (
      computed.position ===
      "static"
    ) {
      styles.position =
        "relative";

      state.selected
        .style
        .position =
        "relative";
    }

    state.resizePointer = {
      pointerId:
        event.pointerId,
      corner:
        handle.dataset.devResize,
      x:
        event.clientX,
      y:
        event.clientY,
      width:
        rect.width /
        uiScale(),
      height:
        rect.height /
        uiScale(),
      left:
        computed.left === "auto"
          ? 0
          : parseFloat(
              computed.left
            ) || 0,
      top:
        computed.top === "auto"
          ? 0
          : parseFloat(
              computed.top
            ) || 0,
      id:
        info.id,
      customId:
        info.customId,
      aspectRatio:
        info.imageSettings?.aspectRatio || null,
      lockAspect:
        Boolean(
          info.imageSettings?.lockAspect
        )
    };

    handle.setPointerCapture?.(
      event.pointerId
    );

    event.preventDefault();
    event.stopPropagation();
  }

  function moveResize(event) {
    const resize =
      state.resizePointer;

    if (
      !resize ||
      resize.pointerId !==
        event.pointerId ||
      !state.selected
    ) {
      return;
    }

    const snap =
      Math.max(
        1,
        Number(state.snap) || 1
      );

    const scale =
      uiScale();

    const dx =
      (
        event.clientX -
        resize.x
      ) / scale;

    const dy =
      (
        event.clientY -
        resize.y
      ) / scale;

    const west =
      resize.corner.includes(
        "w"
      );

    const north =
      resize.corner.includes(
        "n"
      );

    let width =
      resize.width +
      (west ? -dx : dx);

    let height =
      resize.height +
      (north ? -dy : dy);

    if (
      resize.lockAspect &&
      resize.aspectRatio
    ) {
      const widthChange =
        Math.abs(
          width -
          resize.width
        );

      const heightChange =
        Math.abs(
          height -
          resize.height
        );

      if (
        widthChange >=
        heightChange
      ) {
        width =
          Math.max(
            24,
            width
          );
        height =
          width /
          resize.aspectRatio;
      } else {
        height =
          Math.max(
            24,
            height
          );
        width =
          height *
          resize.aspectRatio;
      }
    }

    width =
      Math.max(
        24,
        Math.round(
          width / snap
        ) * snap
      );

    height =
      Math.max(
        24,
        Math.round(
          height / snap
        ) * snap
      );

    if (
      resize.lockAspect &&
      resize.aspectRatio
    ) {
      height =
        Math.max(
          24,
          Math.round(
            width /
            resize.aspectRatio
          )
        );
    }

    let left =
      resize.left;

    let top =
      resize.top;

    if (west) {
      left =
        resize.left +
        resize.width -
        width;
    }

    if (north) {
      top =
        resize.top +
        resize.height -
        height;
    }

    left =
      Math.round(
        left / snap
      ) * snap;

    top =
      Math.round(
        top / snap
      ) * snap;

    const styles =
      state.overrides[
        resize.id
      ] || (
        state.overrides[
          resize.id
        ] = {}
      );

    styles.width =
      `${width}px`;

    styles.height =
      `${height}px`;

    styles.left =
      `${left}px`;

    styles.top =
      `${top}px`;

    state.selected
      .style
      .width =
      styles.width;

    state.selected
      .style
      .height =
      styles.height;

    state.selected
      .style
      .left =
      styles.left;

    state.selected
      .style
      .top =
      styles.top;

    if (resize.customId) {
      const item =
        customComponentById(
          resize.customId
        );

      if (item) {
        item.width = width;
        item.height = height;

        setItemAbsolutePosition(
          item,
          left,
          top
        );

        if (
          item.type === "image" &&
          item.lockAspect === false
        ) {
          item.objectFit = "fill";

          const image =
            state.selected
              .querySelector("img");

          if (image) {
            image.style.objectFit =
              "fill";
          }
        }
      }
    }

    renderSelectionChrome();
    event.preventDefault();
  }

  function endResize(event) {
    if (
      !state.resizePointer ||
      state.resizePointer.pointerId !==
        event.pointerId
    ) {
      return;
    }

    if (
      state.resizePointer.customId
    ) {
      persistProject();
    }

    writeOverrides(
      state.overrides
    );

    state.resizePointer = null;
    renderSelectionChrome();
    renderPanel();
    event.preventDefault();
  }

  chrome.addEventListener(
    "pointerdown",
    beginResize,
    true
  );

  document.addEventListener(
    "pointermove",
    moveResize,
    true
  );

  document.addEventListener(
    "pointerup",
    endResize,
    true
  );

  document.addEventListener(
    "pointercancel",
    endResize,
    true
  );

  function beginLayoutDrag(event) {
    if (
      !state.dragMode ||
      !state.selected ||
      !document.contains(state.selected) ||
      event.target.closest("#ui-dev-root")
    ) {
      return;
    }

    if (!state.selected.contains(event.target)) {
      return;
    }

    const info = selectedInfo();
    if (
      !info ||
      (
        !info.layoutKey &&
        !info.customId
      ) ||
      info.locked
    ) {
      return;
    }

    const computed =
      getComputedStyle(
        state.selected
      );

    pushHistory();

    const styles =
      ensureSelectedOverride(info);

    if (computed.position === "static") {
      styles.position = "relative";
      state.selected.style.position =
        "relative";
    }

    const startLeft =
      computed.left === "auto"
        ? 0
        : parseFloat(computed.left) || 0;

    const startTop =
      computed.top === "auto"
        ? 0
        : parseFloat(computed.top) || 0;

    state.dragPointer = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      left: startLeft,
      top: startTop,
      id: info.id,
      customId:
        info.customId
    };

    state.selected.setPointerCapture?.(
      event.pointerId
    );

    event.preventDefault();
    event.stopPropagation();
  }

  function moveLayoutDrag(event) {
    const drag = state.dragPointer;

    if (
      !state.dragMode ||
      !drag ||
      drag.pointerId !== event.pointerId ||
      !state.selected
    ) {
      return;
    }

    const snap =
      Math.max(
        1,
        Number(state.snap) || 1
      );

    const nextLeft =
      Math.round(
        (
          drag.left +
          (
            event.clientX -
            drag.x
          ) / uiScale()
        ) / snap
      ) * snap;

    const nextTop =
      Math.round(
        (
          drag.top +
          (
            event.clientY -
            drag.y
          ) / uiScale()
        ) / snap
      ) * snap;

    const styles =
      state.overrides[drag.id] ||
      (state.overrides[drag.id] = {});

    styles.left = `${nextLeft}px`;
    styles.top = `${nextTop}px`;

    state.selected.style.left =
      styles.left;
    state.selected.style.top =
      styles.top;

    if (drag.customId) {
      const item =
        customComponentById(
          drag.customId
        );

      if (item) {
        setItemAbsolutePosition(
          item,
          nextLeft,
          nextTop
        );
      }
    }

    event.preventDefault();
  }

  function endLayoutDrag(event) {
    if (
      !state.dragPointer ||
      state.dragPointer.pointerId !== event.pointerId
    ) {
      return;
    }

    if (
      state.dragPointer.customId
    ) {
      persistProject();
    }

    state.dragPointer = null;
    writeOverrides(
      state.overrides
    );
    event.preventDefault();
  }

  document.addEventListener(
    "pointerdown",
    beginLayoutDrag,
    true
  );

  document.addEventListener(
    "pointermove",
    moveLayoutDrag,
    true
  );

  document.addEventListener(
    "pointerup",
    endLayoutDrag,
    true
  );

  document.addEventListener(
    "pointercancel",
    endLayoutDrag,
    true
  );

  function togglePanel() {
    state.selecting = false;
    state.open = !state.open;

    if (state.open && !state.report) {
      state.report = auditUi({
        root,
        sheetRoot,
        allowedPages
      });
    }

    renderPanel();
  }

  function clearLongPressTimer() {
    if (state.longPressTimer) {
      clearTimeout(state.longPressTimer);
      state.longPressTimer = null;
    }
  }

  document.addEventListener(
    "pointerdown",
    event => {
      if (!event.target.closest('[data-nav="more"]')) {
        return;
      }

      clearLongPressTimer();

      state.longPressTimer = setTimeout(() => {
        state.longPressTimer = null;
        state.suppressMoreClick = true;
        togglePanel();

        if (navigator.vibrate) {
          navigator.vibrate(35);
        }
      }, 650);
    },
    true
  );

  document.addEventListener(
    "pointerup",
    clearLongPressTimer,
    true
  );

  document.addEventListener(
    "pointercancel",
    clearLongPressTimer,
    true
  );

  document.addEventListener(
    "click",
    event => {
      if (
        state.suppressMoreClick &&
        event.target.closest('[data-nav="more"]')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        state.suppressMoreClick = false;
      }
    },
    true
  );

  function afterRender() {
    assignIds();
    renderProjectComponents();
    assignIds();
    applyOverrides();
    renderSelectionChrome();

    if (state.report) {
      state.report = auditUi({
        root,
        sheetRoot,
        allowedPages
      });
    }

    renderPanel();
  }

  window.__CITY_RESTAURANT_DEV__ = {
    open() {
      state.open = true;
      state.selecting = false;
      renderPanel();
    },
    close() {
      state.open = false;
      state.selecting = false;
      state.dragMode = false;
      state.dragPointer = null;
      state.resizePointer = null;
      chrome.classList.remove(
        "is-visible"
      );
      renderPanel();
    },
    select: () => startSelecting("any"),
    selectLayout: startLayoutSelecting,
    dragSelected: startDragMode,
    finishDrag: finishDragMode,
    runAudit,
    undo,
    redo,
    getReport: () => state.report,
    exportLayout: () => clone(state.overrides),
    clearLayout: clearAll,
    exportProject:
      () => clone(state.project),
    addImage:
      () => chooseImage("add"),
    addBackground:
      () => chooseImage("background"),
    app
  };

  renderPanel();

  return {
    afterRender,
    runAudit
  };
}
