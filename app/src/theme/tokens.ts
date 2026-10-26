export const colors = {
  primary: "#1E3A5F",
  primaryDeep: "#162C48",
  onPrimary: "#FFFFFF",
  primarySoft: "#E7EEF6",
  paper: "#FBF8F1",
  paperDeep: "#F3EFE6",
  ink: "#1C1917",
  muted: "#44403C",
  faint: "#78716C",
  line: "#DDD6CB",
  lineStrong: "#C9C1B4",
  canvas: "#FBF8F1",
  danger: "#7A2E22",
  dangerSoft: "#F5E8E4",
  onDanger: "#7A2E22",
  ok: "#2F4F42",
  okSoft: "#E7EFE9",
  onOk: "#2F4F42",
  warn: "#6B4423",
  warnSoft: "#F4EBE0",
  link: "#1E3A5F",
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  screenGutter: 16,
} as const;

export const rounded = {
  xs: 2,
  sm: 4,
  md: 4,
  lg: 4,
} as const;

export const fontFamily = {
  serif: "Georgia",
  serifFallback: "serif",
  system: "System",
} as const;

export const type = {
  heading1: {
    fontFamily: fontFamily.serif,
    fontSize: 28,
    fontWeight: "400" as const,
    lineHeight: 34,
  },
  screenTitle: {
    fontFamily: fontFamily.serif,
    fontSize: 22,
    fontWeight: "400" as const,
    lineHeight: 27,
  },
  headingCard: {
    fontSize: 17,
    fontWeight: "600" as const,
    lineHeight: 22,
  },
  bodyMd: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 22,
  },
  bodyMdMedium: {
    fontSize: 16,
    fontWeight: "500" as const,
    lineHeight: 22,
  },
  bodySm: {
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 13,
    fontWeight: "400" as const,
    lineHeight: 18,
  },
  microUppercase: {
    fontSize: 11,
    fontWeight: "600" as const,
    lineHeight: 15,
    letterSpacing: 0.8,
  },
  buttonMd: {
    fontSize: 16,
    fontWeight: "600" as const,
    lineHeight: 19,
  },
} as const;

export const tokens = { colors, spacing, rounded, fontFamily, type } as const;
