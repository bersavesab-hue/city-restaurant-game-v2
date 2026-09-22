const STORAGE_KEY = "city-restaurant-ui-dev-overrides.v2";
const LEGACY_STORAGE_KEY = "city-restaurant-ui-dev-overrides.v1";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readOverrides() {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) return JSON.parse(current);

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      return parsed;
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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

  const selector = [
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
    tab: "edit",
    selecting: false,
    selected: null,
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

  function candidates() {
    return [
      ...root.querySelectorAll("[data-dev-id]"),
      ...sheetRoot.querySelectorAll("[data-dev-id]")
    ];
  }

  function assignIds() {
    [root, sheetRoot]
      .filter(Boolean)
      .forEach(container => {
        container
          .querySelectorAll(
            "button,[data-bind],[data-ui-component],article,section,header,nav,.feature-card,.list-card"
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

    return {
      id: selectorFor(state.selected, root),
      label: elementLabel(state.selected),
      rect: rectOf(state.selected),
      action: actionLabel(state.selected),
      bound: Boolean(state.selected.dataset.devBound),
      values: {
        fontSize: Math.round(parseFloat(style.fontSize) || 0),
        padding: Math.round(parseFloat(style.paddingTop) || 0),
        minHeight: Math.round(parseFloat(style.minHeight) || state.selected.getBoundingClientRect().height),
        borderRadius: Math.round(parseFloat(style.borderRadius) || 0),
        left: style.left === "auto" ? 0 : Math.round(parseFloat(style.left) || 0),
        top: style.top === "auto" ? 0 : Math.round(parseFloat(style.top) || 0)
      }
    };
  }

  function pushHistory() {
    state.undoStack.push(clone(state.overrides));

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
    removeOverrideStyles(state.overrides);

    state.overrides = clone(snapshot);
    writeOverrides(state.overrides);
    applyOverrides();
    renderPanel();
  }

  function undo() {
    if (!state.undoStack.length) return;

    state.redoStack.push(clone(state.overrides));
    restoreSnapshot(state.undoStack.pop());
  }

  function redo() {
    if (!state.redoStack.length) return;

    state.undoStack.push(clone(state.overrides));
    restoreSnapshot(state.redoStack.pop());
  }

  function ensureSelectedOverride(info) {
    if (!state.overrides[info.id]) {
      state.overrides[info.id] = {};
    }

    return state.overrides[info.id];
  }

  function adjust(property, delta) {
    const info = selectedInfo();
    if (!info) return;

    pushHistory();

    const styles = ensureSelectedOverride(info);
    const computed = getComputedStyle(state.selected);

    let current = 0;

    if (property === "padding") {
      current = parseFloat(computed.paddingTop) || 0;
    } else if (property === "minHeight") {
      current =
        parseFloat(computed.minHeight) ||
        state.selected.getBoundingClientRect().height ||
        0;
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
        : property === "minHeight"
          ? 24
          : property === "left" || property === "top"
            ? -200
            : 0;

    const next = Math.max(min, current + delta);
    const value = `${Math.round(next)}px`;

    styles[property] = value;
    state.selected.style[property] = value;

    writeOverrides(state.overrides);
    renderPanel();
  }

  function resetSelected() {
    const info = selectedInfo();
    if (!info || !state.overrides[info.id]) return;

    pushHistory();

    const styles = state.overrides[info.id];

    for (const key of Object.keys(styles)) {
      state.selected.style.removeProperty(
        key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
      );
    }

    delete state.overrides[info.id];
    writeOverrides(state.overrides);
    renderPanel();
  }

  function clearAll() {
    if (!Object.keys(state.overrides).length) return;

    pushHistory();

    removeOverrideStyles(state.overrides);

    state.overrides = {};
    writeOverrides(state.overrides);
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
      version: 2,
      page: getActivePage(),
      overrides: state.overrides
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

    state.selected.scrollIntoView({
      block: "center",
      behavior: "smooth"
    });

    renderPanel();
  }

  function startSelecting() {
    state.selecting = true;
    state.open = false;
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

    if (!info) {
      return `
        <div class="dev-empty">
          点“点选界面”，然后直接点游戏里的卡片、按钮或区域。选中后工具会自动回来。
        </div>
      `;
    }

    return `
      <div class="dev-selected-card">
        <div>
          <small>当前选中</small>
          <strong>${info.label}</strong>
        </div>
        <span>${info.rect.width}×${info.rect.height}</span>
      </div>

      <div class="dev-editor-grid">
        ${stepper("字号", "fontSize", info.values.fontSize, 1)}
        ${stepper("内边距", "padding", info.values.padding, 2)}
        ${stepper("高度", "minHeight", info.values.minHeight, 4)}
        ${stepper("圆角", "borderRadius", info.values.borderRadius, 2)}
        ${stepper("左右", "left", info.values.left, 4)}
        ${stepper("上下", "top", info.values.top, 4)}
      </div>

      <div class="dev-selected-meta">
        <span>${info.action || "无动作"}</span>
        <span>${info.bound ? "事件已绑定" : "无事件"}</span>
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
    const changes = Object.keys(state.overrides).length;

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
          <strong>${report?.components?.length ?? "--"}</strong>
        </article>
      </div>

      <p class="dev-help">
        调整只保存在当前手机。点“复制配置”后把内容发给我，我再正式合并进仓库。
      </p>
    `;
  }

  function renderPanel() {
    if (state.selecting) {
      host.innerHTML = `
        <div class="ui-dev-select-bar">
          <strong>点选模式</strong>
          <span>直接点要修改的卡片或按钮</span>
          <button type="button" data-dev-cancel-select>取消</button>
        </div>
      `;

      bindPanelEvents();
      return;
    }

    if (!state.open) {
      host.innerHTML = "";
      return;
    }

    host.innerHTML = `
      <section class="ui-dev-sheet ${state.expanded ? "is-expanded" : ""}">
        <div class="ui-dev-grabber"></div>

        <header class="ui-dev-sheet-header">
          <div>
            <small>DEV · ${getActivePage()}</small>
            <strong>UI 工具</strong>
          </div>

          <div class="dev-header-actions">
            <button type="button" data-dev-undo ${state.undoStack.length ? "" : "disabled"}>↶</button>
            <button type="button" data-dev-redo ${state.redoStack.length ? "" : "disabled"}>↷</button>
            <button type="button" data-dev-expand>${state.expanded ? "收起" : "展开"}</button>
            <button type="button" data-dev-close>×</button>
          </div>
        </header>

        <div class="ui-dev-quickbar">
          <button class="primary" type="button" data-dev-select>点选界面</button>
          <button type="button" data-dev-audit>立即体检</button>
          <button type="button" data-dev-copy>复制配置</button>
        </div>

        <nav class="ui-dev-tabs">
          <button class="${state.tab === "edit" ? "is-active" : ""}" data-dev-tab="edit">编辑</button>
          <button class="${state.tab === "audit" ? "is-active" : ""}" data-dev-tab="audit">体检</button>
          <button class="${state.tab === "config" ? "is-active" : ""}" data-dev-tab="config">配置</button>
        </nav>

        <div class="ui-dev-body">
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
  }

  function findByDevId(id) {
    if (!id) return null;

    return candidates().find(
      item => item.dataset.devId === id
    ) || null;
  }

  function bindPanelEvents() {
    host.querySelector("[data-dev-close]")?.addEventListener("click", () => {
      state.open = false;
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
        state.tab = button.dataset.devTab;
        renderPanel();
      });
    });

    host.querySelectorAll("[data-dev-select]").forEach(button => {
      button.addEventListener("click", startSelecting);
    });

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

    host.querySelectorAll("[data-dev-adjust]").forEach(button => {
      button.addEventListener("click", () => {
        const [property, rawDelta] =
          button.dataset.devAdjust.split(":");

        adjust(property, Number(rawDelta));
      });
    });

    host.querySelector("[data-dev-reset-selected]")?.addEventListener(
      "click",
      resetSelected
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

    const node = normalizeSelection(
      event.target,
      root,
      sheetRoot
    );

    if (!node) return;

    event.preventDefault();
    event.stopPropagation();

    openEditorFor(node);
  }

  document.addEventListener(
    "click",
    handleSelection,
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
    applyOverrides();

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
      renderPanel();
    },
    select: startSelecting,
    runAudit,
    undo,
    redo,
    getReport: () => state.report,
    exportLayout: () => clone(state.overrides),
    clearLayout: clearAll,
    app
  };

  renderPanel();

  return {
    afterRender,
    runAudit
  };
}
