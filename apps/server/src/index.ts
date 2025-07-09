import { env } from "cloudflare:workers";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { createContext } from "./lib/context";
import { appRouter } from "./routers/index";

const app = new Hono();

app.use(logger());

// Add security headers only in production
const isProduction =
	env.NODE_ENV === "production" || env.CORS_ORIGIN?.includes("pages.dev");
if (isProduction) {
	app.use(
		"/*",
		secureHeaders({
			contentSecurityPolicy: {
				defaultSrc: ["'self'"],
				styleSrc: ["'self'", "'unsafe-inline'"],
				scriptSrc: ["'self'", "'unsafe-inline'"],
				imgSrc: ["'self'", "data:", "https:"],
				connectSrc: ["'self'", "https:"],
				fontSrc: ["'self'"],
				frameSrc: ["'none'"],
				objectSrc: ["'none'"],
			},
			crossOriginEmbedderPolicy: false,
			crossOriginOpenerPolicy: false,
			crossOriginResourcePolicy: false,
			originAgentCluster: true,
			referrerPolicy: "strict-origin-when-cross-origin",
			strictTransportSecurity: "max-age=31536000; includeSubDomains",
			xContentTypeOptions: "nosniff",
			xDnsPrefetchControl: "off",
			xDownloadOptions: "noopen",
			xFrameOptions: "DENY",
			xPermittedCrossDomainPolicies: "none",
			xXssProtection: "1; mode=block",
		}),
	);
}

app.use(
	"/*",
	cors({
		origin: (origin) => {
			// Allow the main domain and any preview URLs
			const allowedOrigins = [
				env.CORS_ORIGIN || "",
				"https://takehome-61d.pages.dev"
			];
			
			// Allow any *.takehome-61d.pages.dev subdomain for preview deployments
			if (origin && origin.includes("takehome-61d.pages.dev")) {
				return origin;
			}
			
			// Return the origin if it's in the allowed list
			if (allowedOrigins.includes(origin || "")) {
				return origin;
			}
			
			return false;
		},
		allowMethods: ["GET", "POST", "OPTIONS"],
	}),
);

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => {
			return createContext({ context });
		},
	}),
);

app.get("/", (c) => {
	return c.text("OK");
});

export default app;
