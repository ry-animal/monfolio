export const colorTokens = {
  brand: 'rgba(131, 110, 249, 1)',
  primary: 'rgba(20, 21, 26, 1)',
  secondary: 'rgba(15, 19, 36, 0.60)',
  tertiary: 'rgba(13, 17, 38, 0.40)',
} as const;

export type ColorToken = keyof typeof colorTokens;

// CSS custom properties for dynamic theming
export const colorVariables = {
  '--color-brand': colorTokens.brand,
  '--color-primary': colorTokens.primary,
  '--color-secondary': colorTokens.secondary,
  '--color-tertiary': colorTokens.tertiary,
} as const;