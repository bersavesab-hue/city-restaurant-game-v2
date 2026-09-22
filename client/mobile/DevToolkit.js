const STORAGE_KEY = "city-restaurant-ui-dev-overrides.v1";

function readOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeOverrides(value) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Development helper only: storage failure must never break the game.
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
    height: Math.round(rect.height),
    right: Math.round(rect.right),
    bottom: Math.round(rect.bottom)
  };
}

function actionLabel(node) {
  if (node.dataset.nav) return `nav:${node.dataset.nav}`;
  if (node.dataset.openSheet) return `sheet:${node.dataset.openSheet}`;
  if (node.dataset.speed) return `speed:${node.dataset.speed}`;
  if (node.dataset.run) return `run:${node.dataset.run}`;
  if (node.dataset.advance) return `advance:${node.dataset.advance}`;
  if (node.dataset.closeSheet !== undefined) return "sheet:close";
  if (node.dataset.devBound) return node.dataset.devBound;
  return "";
}

function isVisible(node) {
  if (!(node instanceof Element)) return false;
  const style = getComputedStyle(node);
  const rect = node.getBoundingClientRect();
  return style.display !== "none" &&
    style.visibility !== "hidden" &&
    rect.width > 0 &&
    rect.height > 0;
}

function selectorFor(node, root) {
  if (!node || node === root) return "root";

  const existing = node.dataset.devId;
  if (existing) return existing;

  const parts = [];
  let current = node;

  while (current && current !== root && parts.length < 5) {
    let part = current.tagName.toLowerCase();

    if (current.dataset.nav) {
      part += `[data-nav="${current.dataset.nav}"]`;
      parts.unshift(part);
      break;
    }

    if (current.dataset.openSheet) {
      part += `[data-open-sheet="${current.dataset.openSheet}"]`;
      parts.unshift(part);
      break;
    }

    const parent = current.parentElement;
    if (parent) {
      const siblings = [...parent.children].filter(
        item => item.tagName === current.tagName
      );
      if (siblings.length > 1) {
        part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
      }
    }

    parts.unshift(part);
    current = parent;
  }

  const id = parts.join(" > ") || node.tagName.toLowerCase();
  node.dataset.devId = id;
  return id;
}

function elementLabel(node) {
  const text = (node.textContent || "").replace(/\s+/g, " ").trim();
  return text.slice(0, 34) || node.tagName.toLowerCase();
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
          `声明了动作但没有实际绑定点击事件：${action}`,
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
  const viewportHeight = document.documentElement.clientHeight;

  for (const node of nodes.filter(
    node => node instanceof HTMLElement && isVisible(node)
  )) {
    if (node.closest("#ui-dev-root")) continue;

    const rect = node.getBoundingClientRect();
    const horizontalOverflow =
      rect.left < -2 || rect.right > viewportWidth + 2;
    const verticalOverflow =
      rect.top < -200 || rect.bottom > viewportHeight + 2000;

    if (horizontalOverflow || verticalOverflow) {
      issues.push(
        makeIssue(
          "warning",
          "viewport-overflow",
          `元素超出安全显示范围：${Math.round(rect.left)},${Math.round(rect.top)} / ${Math.round(rect.right)},${Math.round(rect.bottom)}`,
          node
        )
      );
    }
  }

  for (const image of nodes.filter(node => node instanceof HTMLImageElement)) {
    if (image.complete && image.naturalWidth === 0) {
      issues.push(
        makeIssue(
          "error",
          "image-missing",
          `图片加载失败：${image.getAttribute("src") || "(空路径)"}`,
          image
        )
      );
    }
  }

  const errors = issues.filter(item => item.level === "error").length;
  const warnings = issues.filter(item => item.level === "warning").length;
  const score = clamp(100 - errors * 8 - warnings * 2, 0, 100);

  return {
    generatedAt: new Date().toISOString(),
    score,
    errors,
    warnings,
    checkedButtons: visibleButtons.length,
    boundButtons: visibleButtons.filter(button => actionLabel(button)).length,
    bindings: nodes.filter(node => node?.dataset?.bind).map(node => ({
      key: node.dataset.bind,
      value: (node.textContent || "").trim(),
      selector: node.dataset.devId || ""
    })),
    assets: nodes
      .filter(node => node instanceof HTMLImageElement)
      .map(image => ({
        src: image.currentSrc || image.src,
        width: image.naturalWidth,
        height: image.naturalHeight,
        ok: image.naturalWidth > 0
      })),
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
    tab: "audit",
    selecting: false,
    selected: null,
    report: null,
    overrides: readOverrides()
  };

  const host = document.createElement("div");
  host.id = "ui-dev-root";
  document.body.append(host);

  function assignIds() {
    [root, sheetRoot]
      .filter(Boolean)
      .forEach(container => {
        container
          .querySelectorAll("button,[data-bind],article,section,header,nav,.feature-card,.list-card")
          .forEach(node => {
            selectorFor(node, root);
          });
      });
  }

  function applyOverrides() {
    for (const [id, styles] of Object.entries(state.overrides)) {
      const candidates = [
        ...root.querySelectorAll("[data-dev-id]"),
        ...sheetRoot.querySelectorAll("[data-dev-id]")
      ];
      const node = candidates.find(item => item.dataset.devId === id);
      if (!node) continue;

      for (const [key, value] of Object.entries(styles)) {
        node.style[key] = value;
      }
    }
  }

  function runAudit() {
    assignIds();
    state.report = auditUi({
      root,
      sheetRoot,
      allowedPages
    });
    renderPanel();
    return state.report;
  }

  function selectedInfo() {
    if (!state.selected || !document.contains(state.selected)) {
      return null;
    }

    return {
      id: selectorFor(state.selected, root),
      label: elementLabel(state.selected),
      rect: rectOf(state.selected),
      style: getComputedStyle(state.selected),
      action: actionLabel(state.selected),
      bound: Boolean(state.selected.dataset.devBound)
    };
  }

  function adjustStyle(property, delta, unit = "px") {
    const info = selectedInfo();
    if (!info) return;

    const current = parseFloat(info.style[property]) || 0;
    const value = `${Math.max(0, current + delta)}${unit}`;

    if (!state.overrides[info.id]) {
      state.overrides[info.id] = {};
    }

    state.overrides[info.id][property] = value;
    state.selected.style[property] = value;
    writeOverrides(state.overrides);
    renderPanel();
  }

  function resetSelected() {
    const info = selectedInfo();
    if (!info) return;

    const styles = state.overrides[info.id] || {};
    for (const key of Object.keys(styles)) {
      state.selected.style.removeProperty(
        key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
      );
    }

    delete state.overrides[info.id];
    writeOverrides(state.overrides);
    renderPanel();
  }

  function exportJson() {
    const json = JSON.stringify(state.overrides, null, 2);
    const area = host.querySelector("[data-dev-export]");
    if (area) {
      area.value = json;
      area.focus();
      area.select();
    }

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(json).catch(() => {
        document.execCommand?.("copy");
      });
    } else {
      document.execCommand?.("copy");
    }
  }

  function issueMarkup(report) {
    if (!report) {
      return '<div class="dev-empty">点击“重新体检”开始扫描当前页面。</div>';
    }

    if (report.issues.length === 0) {
      return '<div class="dev-empty good">当前页面未发现 UI 错误或警告。</div>';
    }

    return report.issues.slice(0, 80).map(item => `
      <button class="dev-issue ${item.level}" type="button" data-dev-jump="${encodeURIComponent(item.selector)}">
        <strong>${item.level === "error" ? "错误" : "警告"} · ${item.code}</strong>
        <span>${item.message}</span>
        ${item.element ? `<small>${item.element}</small>` : ""}
      </button>
    `).join("");
  }

  function bindingsMarkup(report) {
    const bindings = report?.bindings || [];
    if (!bindings.length) {
      return '<div class="dev-empty">当前页面没有 data-bind 数据绑定。</div>';
    }

    return bindings.map(item => `
      <article class="dev-binding">
        <strong>${item.key}</strong>
        <span>${item.value || "(空值)"}</span>
        <small>${item.selector}</small>
      </article>
    `).join("");
  }

  function editorMarkup() {
    const info = selectedInfo();
    if (!info) {
      return `
        <div class="dev-empty">
          开启“点选元素”后，直接点击游戏里的组件。选中后可调整字号、内边距和尺寸，修改会保存到本机开发配置。
        </div>
      `;
    }

    return `
      <section class="dev-selected">
        <strong>${info.label}</strong>
        <small>${info.id}</small>
        <p>位置 ${info.rect.x}, ${info.rect.y} · 尺寸 ${info.rect.width}×${info.rect.height}</p>
        <p>动作：${info.action || "未声明"} · 事件：${info.bound ? "已绑定" : "未绑定"}</p>
      </section>

      <div class="dev-control-grid">
        <button type="button" data-dev-adjust="fontSize:-1">字号 -</button>
        <button type="button" data-dev-adjust="fontSize:1">字号 +</button>
        <button type="button" data-dev-adjust="padding:-2">内边距 -</button>
        <button type="button" data-dev-adjust="padding:2">内边距 +</button>
        <button type="button" data-dev-adjust="minWidth:-8">宽度 -</button>
        <button type="button" data-dev-adjust="minWidth:8">宽度 +</button>
        <button type="button" data-dev-adjust="minHeight:-8">高度 -</button>
        <button type="button" data-dev-adjust="minHeight:8">高度 +</button>
      </div>

      <button class="dev-danger-button" type="button" data-dev-reset-selected>重置当前元素</button>
    `;
  }

  function renderPanel() {
    const report = state.report;

    host.innerHTML = `
      <button class="ui-dev-fab" type="button" data-dev-toggle>DEV</button>

      ${state.open ? `
        <section class="ui-dev-panel">
          <header class="ui-dev-header">
            <div>
              <small>开发模式 · ${getActivePage()}</small>
              <strong>UI 开发工具箱</strong>
            </div>
            <button type="button" data-dev-close>×</button>
          </header>

          <div class="ui-dev-summary">
            <article>
              <span>健康度</span>
              <strong>${report?.score ?? "--"}</strong>
            </article>
            <article>
              <span>错误</span>
              <strong>${report?.errors ?? "--"}</strong>
            </article>
            <article>
              <span>警告</span>
              <strong>${report?.warnings ?? "--"}</strong>
            </article>
            <article>
              <span>已绑定按钮</span>
              <strong>${report ? `${report.boundButtons}/${report.checkedButtons}` : "--"}</strong>
            </article>
          </div>

          <nav class="ui-dev-tabs">
            <button class="${state.tab === "audit" ? "is-active" : ""}" data-dev-tab="audit">体检</button>
            <button class="${state.tab === "editor" ? "is-active" : ""}" data-dev-tab="editor">UI编辑</button>
            <button class="${state.tab === "bindings" ? "is-active" : ""}" data-dev-tab="bindings">数据绑定</button>
            <button class="${state.tab === "export" ? "is-active" : ""}" data-dev-tab="export">配置</button>
          </nav>

          <div class="ui-dev-body">
            ${state.tab === "audit" ? `
              <div class="dev-toolbar">
                <button class="primary" type="button" data-dev-audit>重新体检</button>
                <button type="button" data-dev-select>${state.selecting ? "停止点选" : "点选元素"}</button>
              </div>
              <div class="dev-issues">${issueMarkup(report)}</div>
            ` : ""}

            ${state.tab === "editor" ? `
              <div class="dev-toolbar">
                <button class="${state.selecting ? "primary" : ""}" type="button" data-dev-select>
                  ${state.selecting ? "正在点选…" : "点选元素"}
                </button>
              </div>
              ${editorMarkup()}
            ` : ""}

            ${state.tab === "bindings" ? `
              <div class="dev-toolbar">
                <button type="button" data-dev-audit>刷新绑定</button>
              </div>
              <div class="dev-bindings">${bindingsMarkup(report)}</div>
            ` : ""}

            ${state.tab === "export" ? `
              <p class="dev-help">这里保存的是开发期 UI 覆盖配置。正式发布前可以关闭 DEV_MODE，玩家不会看到工具箱。</p>
              <textarea data-dev-export spellcheck="false">${JSON.stringify(state.overrides, null, 2)}</textarea>
              <div class="dev-toolbar">
                <button class="primary" type="button" data-dev-copy>复制 JSON</button>
                <button type="button" data-dev-clear>清空本机配置</button>
              </div>
            ` : ""}
          </div>
        </section>
      ` : ""}
    `;

    bindPanelEvents();
  }

  function findByDevId(id) {
    if (!id) return null;
    return [
      ...root.querySelectorAll("[data-dev-id]"),
      ...sheetRoot.querySelectorAll("[data-dev-id]")
    ].find(item => item.dataset.devId === id) || null;
  }

  function bindPanelEvents() {
    host.querySelector("[data-dev-toggle]")?.addEventListener("click", () => {
      state.open = !state.open;
      if (state.open && !state.report) runAudit();
      else renderPanel();
    });

    host.querySelector("[data-dev-close]")?.addEventListener("click", () => {
      state.open = false;
      state.selecting = false;
      renderPanel();
    });

    host.querySelectorAll("[data-dev-tab]").forEach(button => {
      button.addEventListener("click", () => {
        state.tab = button.dataset.devTab;
        renderPanel();
      });
    });

    host.querySelectorAll("[data-dev-audit]").forEach(button => {
      button.addEventListener("click", runAudit);
    });

    host.querySelectorAll("[data-dev-select]").forEach(button => {
      button.addEventListener("click", () => {
        state.selecting = !state.selecting;
        if (state.selecting) {
          state.open = false;
        }
        renderPanel();
      });
    });

    host.querySelectorAll("[data-dev-adjust]").forEach(button => {
      button.addEventListener("click", () => {
        const [property, rawDelta] = button.dataset.devAdjust.split(":");
        adjustStyle(property, Number(rawDelta));
      });
    });

    host.querySelector("[data-dev-reset-selected]")?.addEventListener(
      "click",
      resetSelected
    );

    host.querySelector("[data-dev-copy]")?.addEventListener("click", exportJson);

    host.querySelector("[data-dev-clear]")?.addEventListener("click", () => {
      state.overrides = {};
      writeOverrides({});
      afterRender();
      renderPanel();
    });

    host.querySelectorAll("[data-dev-jump]").forEach(button => {
      button.addEventListener("click", () => {
        const id = decodeURIComponent(button.dataset.devJump || "");
        const node = findByDevId(id);
        if (!node) return;

        node.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
        node.classList.add("dev-highlight");
        setTimeout(() => node.classList.remove("dev-highlight"), 1400);
      });
    });
  }

  function handleSelection(event) {
    if (!state.selecting) return;
    if (event.target.closest("#ui-dev-root")) return;

    event.preventDefault();
    event.stopPropagation();

    state.selected = event.target;
    state.selecting = false;
    state.open = true;
    state.tab = "editor";

    document
      .querySelectorAll(".dev-selected-outline")
      .forEach(node => node.classList.remove("dev-selected-outline"));

    state.selected.classList.add("dev-selected-outline");
    renderPanel();
  }

  document.addEventListener("click", handleSelection, true);

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
    runAudit,
    getReport: () => state.report,
    exportLayout: () => JSON.parse(JSON.stringify(state.overrides)),
    clearLayout: () => {
      state.overrides = {};
      writeOverrides({});
      afterRender();
    },
    app
  };

  renderPanel();

  return {
    afterRender,
    runAudit
  };
}
