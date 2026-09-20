import {
  VIEWPORT_PROFILES
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

function classifyViewport({
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
      "Viewport width and height must be positive finite numbers"
    );
  }

  if (
    w >
    h
  ) {
    return VIEWPORT_PROFILES.LANDSCAPE;
  }

  const heightToWidth =
    h / w;

  if (
    heightToWidth >=
    2.1
  ) {
    return VIEWPORT_PROFILES.TALL_PHONE;
  }

  if (
    heightToWidth >=
    1.9
  ) {
    return VIEWPORT_PROFILES.STANDARD_PHONE;
  }

  return VIEWPORT_PROFILES.WIDE_PHONE_TABLET;
}

export {
  MIN_SUPPORTED_VIEWPORT,
  APP_SHELL_REGIONS,
  classifyViewport
};
