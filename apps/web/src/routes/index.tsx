import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing-page";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return <LandingPage />;
}
