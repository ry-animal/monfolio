export const colorTokens = {
	brand: "hsl(var(--color-primary))",
	primary: "hsl(var(--color-foreground))",
	secondary: "hsl(var(--color-muted-foreground))",
	tertiary: "hsl(var(--color-muted-foreground) / 0.6)",
	"monad-purple": "rgba(131, 110, 249, 1)",
} as const;

export type ColorToken = keyof typeof colorTokens;

// CSS custom properties for dynamic theming
export const colorVariables = {
	"--color-brand": colorTokens.brand,
	"--color-primary": colorTokens.primary,
	"--color-secondary": colorTokens.secondary,
	"--color-tertiary": colorTokens.tertiary,
	"--color-monad-purple": colorTokens["monad-purple"],
} as const;
