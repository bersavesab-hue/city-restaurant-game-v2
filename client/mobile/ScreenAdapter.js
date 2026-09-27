const DEFAULT_WIDTH = 540;
const DEFAULT_HEIGHT = 960;

function positiveNumber(value, fallback) {
  const number = Number(value);

  return (
    Number.isFinite(number) &&
    number > 0
  )
    ? number
    : fallback;
}

function nonNegativeNumber(value) {
  const number = Number(value);

  return (
    Number.isFinite(number) &&
    number >= 0
  )
    ? number
    : 0;
}

export function calculateScreenMetrics({
  viewportWidth,
  viewportHeight,
  baseWidth = DEFAULT_WIDTH,
  baseHeight = DEFAULT_HEIGHT,
  safeTop = 0,
  safeRight = 0,
  safeBottom = 0,
  safeLeft = 0
} = {}) {
  const width =
    positiveNumber(
      viewportWidth,
      baseWidth
    );

  const height =
    positiveNumber(
      viewportHeight,
      baseHeight
    );

  const designWidth =
    positiveNumber(
      baseWidth,
      DEFAULT_WIDTH
    );

  const designHeight =
    positiveNumber(
      baseHeight,
      DEFAULT_HEIGHT
    );

  const scale =
    Math.min(
      width / designWidth,
      height / designHeight
    );

  const logicalWidth =
    width / scale;

  const logicalHeight =
    height / scale;

  const extraWidth =
    Math.max(
      0,
      logicalWidth -
      designWidth
    );

  const extraHeight =
    Math.max(
      0,
      logicalHeight -
      designHeight
    );

  return {
    viewportWidth: width,
    viewportHeight: height,
    baseWidth: designWidth,
    baseHeight: designHeight,
    scale,
    logicalWidth,
    logicalHeight,
    extraWidth,
    extraHeight,
    referenceLeft:
      extraWidth / 2,
    referenceTop:
      extraHeight / 2,
    referenceRight:
      extraWidth / 2,
    referenceBottom:
      extraHeight / 2,
    safeTop:
      nonNegativeNumber(
        safeTop
      ) / scale,
    safeRight:
      nonNegativeNumber(
        safeRight
      ) / scale,
    safeBottom:
      nonNegativeNumber(
        safeBottom
      ) / scale,
    safeLeft:
      nonNegativeNumber(
        safeLeft
      ) / scale
  };
}

function createSafeAreaProbe() {
  const probe =
    document.createElement(
      "div"
    );

  probe.setAttribute(
    "aria-hidden",
    "true"
  );

  probe.style.cssText = [
    "position:fixed",
    "inset:0",
    "pointer-events:none",
    "visibility:hidden",
    "padding-top:env(safe-area-inset-top)",
    "padding-right:env(safe-area-inset-right)",
    "padding-bottom:env(safe-area-inset-bottom)",
    "padding-left:env(safe-area-inset-left)"
  ].join(";");

  document.body.append(
    probe
  );

  return probe;
}

function readSafeArea(probe) {
  const style =
    getComputedStyle(
      probe
    );

  return {
    safeTop:
      parseFloat(
        style.paddingTop
      ) || 0,
    safeRight:
      parseFloat(
        style.paddingRight
      ) || 0,
    safeBottom:
      parseFloat(
        style.paddingBottom
      ) || 0,
    safeLeft:
      parseFloat(
        style.paddingLeft
      ) || 0
  };
}

function setMetric(
  style,
  name,
  value,
  unit = "px"
) {
  style.setProperty(
    name,
    `${value}${unit}`
  );
}

export function installScreenAdapter({
  baseWidth = DEFAULT_WIDTH,
  baseHeight = DEFAULT_HEIGHT
} = {}) {
  const rootStyle =
    document.documentElement
      .style;

  const safeProbe =
    createSafeAreaProbe();

  let destroyed = false;
  let frame = 0;
  let metrics = null;

  function measure() {
    const viewport =
      window.visualViewport;

    const viewportWidth =
      positiveNumber(
        viewport?.width,
        window.innerWidth
      );

    const viewportHeight =
      positiveNumber(
        viewport?.height,
        window.innerHeight
      );

    metrics =
      calculateScreenMetrics({
        viewportWidth,
        viewportHeight,
        baseWidth,
        baseHeight,
        ...readSafeArea(
          safeProbe
        )
      });

    rootStyle.setProperty(
      "--screen-scale",
      String(
        metrics.scale
      )
    );

    setMetric(
      rootStyle,
      "--logical-width",
      metrics.logicalWidth
    );

    setMetric(
      rootStyle,
      "--logical-height",
      metrics.logicalHeight
    );

    setMetric(
      rootStyle,
      "--reference-left",
      metrics.referenceLeft
    );

    setMetric(
      rootStyle,
      "--reference-top",
      metrics.referenceTop
    );

    setMetric(
      rootStyle,
      "--reference-right",
      metrics.referenceRight
    );

    setMetric(
      rootStyle,
      "--reference-bottom",
      metrics.referenceBottom
    );

    setMetric(
      rootStyle,
      "--safe-top",
      metrics.safeTop
    );

    setMetric(
      rootStyle,
      "--safe-right",
      metrics.safeRight
    );

    setMetric(
      rootStyle,
      "--safe-bottom",
      metrics.safeBottom
    );

    setMetric(
      rootStyle,
      "--safe-left",
      metrics.safeLeft
    );

    document.documentElement
      .dataset.screenAdapter =
      "ready";

    window.dispatchEvent(
      new CustomEvent(
        "ui-screen-resize",
        {
          detail:
            { ...metrics }
        }
      )
    );

    return metrics;
  }

  function schedule() {
    if (
      destroyed ||
      frame
    ) {
      return;
    }

    frame =
      requestAnimationFrame(
        () => {
          frame = 0;
          measure();
        }
      );
  }

  const viewport =
    window.visualViewport;

  window.addEventListener(
    "resize",
    schedule,
    { passive: true }
  );

  window.addEventListener(
    "orientationchange",
    schedule,
    { passive: true }
  );

  viewport?.addEventListener(
    "resize",
    schedule,
    { passive: true }
  );

  viewport?.addEventListener(
    "scroll",
    schedule,
    { passive: true }
  );

  measure();

  const api = {
    update: measure,
    getMetrics() {
      return metrics
        ? { ...metrics }
        : measure();
    },
    destroy() {
      if (destroyed) {
        return;
      }

      destroyed = true;

      if (frame) {
        cancelAnimationFrame(
          frame
        );
        frame = 0;
      }

      window.removeEventListener(
        "resize",
        schedule
      );

      window.removeEventListener(
        "orientationchange",
        schedule
      );

      viewport?.removeEventListener(
        "resize",
        schedule
      );

      viewport?.removeEventListener(
        "scroll",
        schedule
      );

      safeProbe.remove();
    }
  };

  window.__CITY_SCREEN__ =
    api;

  return api;
}

export const SCREEN_DESIGN_SIZE =
  Object.freeze({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT
  });
