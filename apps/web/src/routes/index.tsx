import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/Dashboard.1";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return <Dashboard />;
}
