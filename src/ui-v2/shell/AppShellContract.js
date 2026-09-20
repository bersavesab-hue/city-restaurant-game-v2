import {
  WINDOW_WIDTH_CLASS,
  WINDOW_HEIGHT_CLASS
} from "../tokens/tokens.js";

const MIN_SUPPORTED_VIEWPORT = Object.freeze({
  width: 320,
  height: 568
});

const APP_SHELL_REGIONS = Object.freeze([
  "safe-top",
  "global-hud",
  "page-content",
  "global-nav",
  "safe-bottom"
]);

function classifyWindow({
  width,
  height
}) {
  const w =
    Number(width);

  const h =
    Number(height);

  if (
    !Number.isFinite(w) ||
    !Number.isFinite(h) ||
    w <= 0 ||
    h <= 0
  ) {
    throw new TypeError(
      "Window width and height must be positive finite numbers"
    );
  }

  const widthClass =
    w < 600
      ? WINDOW_WIDTH_CLASS.COMPACT
      : w < 840
        ? WINDOW_WIDTH_CLASS.MEDIUM
        : WINDOW_WIDTH_CLASS.EXPANDED;

  const heightClass =
    h < 480
      ? WINDOW_HEIGHT_CLASS.COMPACT
      : h < 900
        ? WINDOW_HEIGHT_CLASS.MEDIUM
        : WINDOW_HEIGHT_CLASS.EXPANDED;

  return Object.freeze({
    widthClass,
    heightClass,
    orientation:
      w > h
        ? "landscape"
        : "portrait"
  });
}

function getPrimaryNavigationMode(
  metrics
) {
  const {
    widthClass
  } =
    classifyWindow(
      metrics
    );

  return (
    widthClass ===
    WINDOW_WIDTH_CLASS.EXPANDED
  )
    ? "rail"
    : "bottom";
}

export {
  MIN_SUPPORTED_VIEWPORT,
  APP_SHELL_REGIONS,
  classifyWindow,
  getPrimaryNavigationMode
};
