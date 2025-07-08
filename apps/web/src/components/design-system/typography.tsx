import type { JSX } from "react";
import { cn } from "@/lib/utils";
import { type ColorPalette, colorPalette } from "./tokens/color-palette";
import { type ColorToken, colorTokens } from "./tokens/colors";
import {
	type FontWeight,
	type TypographyToken,
	typographyTokens,
} from "./tokens/typography";

interface TypographyProps {
	variant?: TypographyToken;
	weight?: FontWeight;
	color?: ColorToken | ColorPalette;
	className?: string;
	children: React.ReactNode;
	as?: keyof JSX.IntrinsicElements;
}

export function Typography({
	variant = "bodyM",
	weight = "regular",
	color = "primary",
	className,
	children,
	as,
}: TypographyProps) {
	const Component = as || getDefaultElement(variant);
	const fontConfig = typographyTokens.fontSizes[variant];
	const fontWeight = typographyTokens.fontWeights[weight];

	const textColor =
		color in colorTokens
			? colorTokens[color as ColorToken]
			: colorPalette[color as ColorPalette]?.rgb;

	return (
		<Component
			className={cn(className)}
			style={{
				fontSize: fontConfig.size,
				lineHeight: fontConfig.lineHeight,
				letterSpacing: fontConfig.spacing,
				fontWeight,
				fontFamily: typographyTokens.fontFamily.primary,
				color: textColor,
			}}
		>
			{children}
		</Component>
	);
}

function getDefaultElement(
	variant: TypographyToken,
): keyof JSX.IntrinsicElements {
	switch (variant) {
		case "display":
			return "h1";
		case "h1":
			return "h1";
		case "h2":
			return "h2";
		case "h3":
			return "h3";
		case "h4":
			return "h4";
		case "h5":
			return "h5";
		case "h6":
			return "h6";
		case "bodyL":
		case "bodyM":
		case "bodyS":
			return "p";
		case "captionL":
		case "captionM":
		case "captionS":
			return "span";
		default:
			return "p";
	}
}

// Convenience components for common usage
export const Display = (props: Omit<TypographyProps, "variant">) => (
	<Typography variant="display" {...props} />
);

export const H1 = (props: Omit<TypographyProps, "variant">) => (
	<Typography variant="h1" {...props} />
);

export const H2 = (props: Omit<TypographyProps, "variant">) => (
	<Typography variant="h2" {...props} />
);

export const H3 = (props: Omit<TypographyProps, "variant">) => (
	<Typography variant="h3" {...props} />
);

export const H4 = (props: Omit<TypographyProps, "variant">) => (
	<Typography variant="h4" {...props} />
);

export const H5 = (props: Omit<TypographyProps, "variant">) => (
	<Typography variant="h5" {...props} />
);

export const H6 = (props: Omit<TypographyProps, "variant">) => (
	<Typography variant="h6" {...props} />
);

export const BodyL = (props: Omit<TypographyProps, "variant">) => (
	<Typography variant="bodyL" {...props} />
);

export const BodyM = (props: Omit<TypographyProps, "variant">) => (
	<Typography variant="bodyM" {...props} />
);

export const BodyS = (props: Omit<TypographyProps, "variant">) => (
	<Typography variant="bodyS" {...props} />
);

export const CaptionL = (props: Omit<TypographyProps, "variant">) => (
	<Typography variant="captionL" {...props} />
);

export const CaptionM = (props: Omit<TypographyProps, "variant">) => (
	<Typography variant="captionM" {...props} />
);

export const CaptionS = (props: Omit<TypographyProps, "variant">) => (
	<Typography variant="captionS" {...props} />
);
