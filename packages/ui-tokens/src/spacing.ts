export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;

export const layout = {
  containerMaxWidth: 1200,
  gridGap: 16,
  sectionPaddingY: {
    desktop: 48,
    mobile: 32,
  },
  gridColumns: {
    mobile: 2,
    tablet: 3,
    desktop: 4,
  },
} as const;
