const DESIGN_REFERENCE = Object.freeze({
  width: 864,
  height: 1536,
  orientation: "portrait"
});

const WINDOW_WIDTH_CLASS = Object.freeze({
  COMPACT: "compact",
  MEDIUM: "medium",
  EXPANDED: "expanded"
});

const WINDOW_HEIGHT_CLASS = Object.freeze({
  COMPACT: "compact",
  MEDIUM: "medium",
  EXPANDED: "expanded"
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
  minimum: 48,
  comfortable: 52
});

const UI_FONT_WEIGHTS =
  Object.freeze({
    regular: 500,
    medium: 600,
    bold: 700,
    heavy: 800,
    black: 900
  });

const UI_LINE_HEIGHTS =
  Object.freeze({
    tight: 1.08,
    title: 1.16,
    body: 1.4
  });

const UI_SEMANTIC_TYPOGRAPHY =
  Object.freeze({
    pageTitle: 32,
    pageSubtitle: 14,
    summaryValue: 14,
    summaryCaption: 11,
    filter: 14,
    markerTitle: 13,
    markerMeta: 10,
    detailTitle: 22,
    detailBody: 12,
    detailButton: 15,
    metricLabel: 10,
    metricValue: 17,
    sectionTitle: 18,
    opportunityTitle: 11,
    opportunityBody: 9,
    navLabel: 13
  });

export {
  DESIGN_REFERENCE,
  WINDOW_WIDTH_CLASS,
  WINDOW_HEIGHT_CLASS,
  UI_COLORS,
  UI_SPACING,
  UI_RADII,
  UI_TYPOGRAPHY,
  UI_HIT_TARGET,
  UI_FONT_WEIGHTS,
  UI_LINE_HEIGHTS,
  UI_SEMANTIC_TYPOGRAPHY
};
