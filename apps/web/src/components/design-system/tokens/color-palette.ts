export const colorPalette = {
  'monad-off-white': {
    rgb: 'rgba(251, 250, 249, 1)',
    hex: '#FBFAF9',
  },
  'monad-purple': {
    rgb: 'rgba(131, 110, 249, 1)',
    hex: '#836EF9',
  },
  'monad-blue': {
    rgb: 'rgba(32, 0, 82, 1)',
    hex: '#200052',
  },
  'monad-berry': {
    rgb: 'rgba(160, 5, 93, 1)',
    hex: '#A0055D',
  },
  'off-black': {
    rgb: 'rgba(14, 16, 15, 1)',
    hex: '#0E100F',
  },
} as const;

export type ColorPalette = keyof typeof colorPalette;

// CSS custom properties for dynamic theming
export const paletteVariables = {
  '--color-monad-off-white': colorPalette['monad-off-white'].rgb,
  '--color-monad-purple': colorPalette['monad-purple'].rgb,
  '--color-monad-blue': colorPalette['monad-blue'].rgb,
  '--color-monad-berry': colorPalette['monad-berry'].rgb,
  '--color-off-black': colorPalette['off-black'].rgb,
} as const;

// Utility function to get color value
export function getColorValue(color: ColorPalette, format: 'rgb' | 'hex' = 'rgb'): string {
  return colorPalette[color][format];
}