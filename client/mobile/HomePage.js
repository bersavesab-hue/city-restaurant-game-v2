function renderHomePage() {
  return `
    <section
      class="home-editor-canvas"
      data-ui-component="home-page"
      data-layout-key="home-page"
      data-home-layout-version="background-master-v1"
      data-home-shell-version="fixed-chrome-v1"
      data-coordinate-space="logical"
      aria-label="全屏自适应主页画布"
    >
      <div
        class="home-background-layer"
        data-ui-component="home-background-layer"
        data-layout-key="home-background-layer"
        data-background-slot="home"
        aria-hidden="true"
      ></div>

      <header
        class="home-top-chrome"
        data-ui-component="home-top-chrome"
        data-layout-key="home-top-chrome"
        aria-label="主页顶部状态栏"
      >
        <div
          class="home-status-strip"
          data-static-ui="true"
        >
          <div
            class="home-status-cell home-status-date"
            data-ui-component="home-status-date"
            data-layout-key="home-status-date"
          >
            <span class="status-kicker">经营日</span>
            <strong>第28天</strong>
            <small>5月20日 · 周一</small>
          </div>

          <div
            class="home-status-cell home-status-time"
            data-ui-component="home-status-time"
            data-layout-key="home-status-time"
          >
            <span class="status-kicker">营业中</span>
            <strong>12:15</strong>
            <small>午市</small>
          </div>

          <div
            class="home-status-cell home-status-money"
            data-ui-component="home-status-money"
            data-layout-key="home-status-money"
          >
            <span class="status-kicker">资金</span>
            <strong>¥ 86,240</strong>
            <small>可用资金</small>
          </div>

          <div
            class="home-status-cell home-status-rating"
            data-ui-component="home-status-rating"
            data-layout-key="home-status-rating"
          >
            <span class="status-kicker">店铺评分</span>
            <strong>★ 4.7</strong>
            <small>稳定</small>
          </div>

          <div
            class="home-status-cell home-status-level"
            data-ui-component="home-status-level"
            data-layout-key="home-status-level"
          >
            <span class="status-kicker">门店成长</span>
            <strong>Lv.5</strong>
            <small>知名餐厅</small>
          </div>

          <div
            class="home-status-cell home-status-settings"
            data-ui-component="home-status-settings"
            data-layout-key="home-status-settings"
            aria-label="设置占位"
          >
            <span class="settings-glyph">⚙</span>
          </div>
        </div>
      </header>

      <div
        class="home-content-reserve"
        data-ui-component="home-content-reserve"
        data-layout-key="home-content-reserve"
        aria-hidden="true"
      ></div>

      <nav
        class="home-bottom-chrome"
        data-ui-component="home-bottom-chrome"
        data-layout-key="home-bottom-chrome"
        aria-label="主页一级导航"
      >
        <div
          class="home-bottom-nav"
          data-static-ui="true"
        >
          <div
            class="home-nav-item is-active"
            data-ui-component="home-nav-store"
            data-layout-key="home-nav-store"
          >
            <span class="home-nav-icon">⌂</span>
            <strong>门店</strong>
          </div>

          <div
            class="home-nav-item"
            data-ui-component="home-nav-business"
            data-layout-key="home-nav-business"
          >
            <span class="home-nav-icon">▥</span>
            <strong>经营</strong>
          </div>

          <div
            class="home-nav-item"
            data-ui-component="home-nav-research"
            data-layout-key="home-nav-research"
          >
            <span class="home-nav-icon">♨</span>
            <strong>研发</strong>
          </div>

          <div
            class="home-nav-item"
            data-ui-component="home-nav-staff"
            data-layout-key="home-nav-staff"
          >
            <span class="home-nav-icon">◉</span>
            <strong>员工</strong>
          </div>

          <div
            class="home-nav-item"
            data-ui-component="home-nav-more"
            data-layout-key="home-nav-more"
          >
            <span class="home-nav-icon">•••</span>
            <strong>更多</strong>
          </div>
        </div>
      </nav>
    </section>
  `;
}

export {
  renderHomePage
};
