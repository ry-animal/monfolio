export const typographyTokens = {
	fontWeights: {
		light: 300,
		regular: 400,
		medium: 500,
		semiBold: 600,
		bold: 700,
		extraBold: 800,
		black: 900,
	},
	fontSizes: {
		display: {
			size: "90px",
			lineHeight: "95px",
			spacing: "0px",
		},
		h1: {
			size: "72px",
			lineHeight: "80px",
			spacing: "0px",
		},
		h2: {
			size: "64px",
			lineHeight: "72px",
			spacing: "0px",
		},
		h3: {
			size: "48px",
			lineHeight: "56px",
			spacing: "0px",
		},
		h4: {
			size: "40px",
			lineHeight: "48px",
			spacing: "0px",
		},
		h5: {
			size: "32px",
			lineHeight: "40px",
			spacing: "0px",
		},
		h6: {
			size: "24px",
			lineHeight: "32px",
			spacing: "0px",
		},
		bodyL: {
			size: "20px",
			lineHeight: "28px",
			spacing: "0px",
		},
		bodyM: {
			size: "18px",
			lineHeight: "26px",
			spacing: "0px",
		},
		bodyS: {
			size: "16px",
			lineHeight: "24px",
			spacing: "0px",
		},
		captionL: {
			size: "14px",
			lineHeight: "20px",
			spacing: "0px",
		},
		captionM: {
			size: "12px",
			lineHeight: "18px",
			spacing: "0px",
		},
		captionS: {
			size: "10px",
			lineHeight: "16px",
			spacing: "0px",
		},
	},
	fontFamily: {
		primary: "var(--font-sans)",
	},
} as const;

export type TypographyToken = keyof typeof typographyTokens.fontSizes;
export type FontWeight = keyof typeof typographyTokens.fontWeights;
