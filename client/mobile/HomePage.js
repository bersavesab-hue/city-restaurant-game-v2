function renderHomePage() {
  return `
    <section
      class="home-editor-canvas"
      data-ui-component="home-page"
      data-layout-key="home-page"
      data-home-layout-version="blank-canvas-v8"
      data-coordinate-space="logical"
      aria-label="全屏自适应 UI 空白画布"
    ></section>
  `;
}

export {
  renderHomePage
};
