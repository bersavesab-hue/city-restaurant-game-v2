function renderHomePage() {
  return `
    <section
      class="home-editor-canvas"
      data-ui-component="home-page"
      data-layout-key="home-page"
      data-home-layout-version="background-master-v1"
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
    </section>
  `;
}

export {
  renderHomePage
};
