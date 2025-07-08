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
const isProduction = env.NODE_ENV === "production" || env.CORS_ORIGIN?.includes("pages.dev");
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
		origin: env.CORS_ORIGIN || "",
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
