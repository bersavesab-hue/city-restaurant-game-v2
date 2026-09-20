const DESIGN_REFERENCE = Object.freeze({
  width: 864,
  height: 1536,
  orientation: "portrait"
});

const VIEWPORT_PROFILES = Object.freeze({
  TALL_PHONE: "tall-phone",
  STANDARD_PHONE: "standard-phone",
  WIDE_PHONE_TABLET: "wide-phone-tablet",
  LANDSCAPE: "landscape"
});

const UI_COLORS = Object.freeze({
  brand: "#0877C9",
  brandDeep: "#034A84",
  brandDark: "#023861",
  accent: "#FFD229",
  accentStrong: "#F6B800",
  surface: "#FFFFFF",
  surfaceSoft: "#F4F7FA",
  surfaceMuted: "#EAF1F6",
  text: "#102E4A",
  textSecondary: "#5F7488",
  textMuted: "#8A9AAA",
  border: "#D9E4EC",
  success: "#14A36B",
  warning: "#F59A16",
  danger: "#E64B4B",
  info: "#1D8FE1"
});

const UI_SPACING = Object.freeze({
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32
});

const UI_RADII = Object.freeze({
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999
});

const UI_TYPOGRAPHY = Object.freeze({
  caption: 12,
  bodySmall: 14,
  body: 16,
  label: 16,
  titleSmall: 20,
  title: 24,
  display: 32
});

const UI_HIT_TARGET = Object.freeze({
  minimum: 44,
  comfortable: 48
});

export {
  DESIGN_REFERENCE,
  VIEWPORT_PROFILES,
  UI_COLORS,
  UI_SPACING,
  UI_RADII,
  UI_TYPOGRAPHY,
  UI_HIT_TARGET
};
