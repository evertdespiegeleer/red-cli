import { useKeyboard } from "@opentui/react";
import { Browser } from "./components/functional/browser/browser";
import { EntryDetails } from "./components/functional/entry-detail-view";
import { Header } from "./components/functional/header";
import { AppProvider } from "./provider";
import { useRoute } from "./routing/provider";
import { RouteTypes } from "./routing/route-types";

export function App() {
	return (
		<AppProvider>
			<box flexDirection="column" height="100%" width="100%">
				<Header />
				<Content />
				<GeneralKeyBindings />
			</box>
		</AppProvider>
	);
}

function Content() {
	const { route } = useRoute();
	if (route instanceof RouteTypes.Browser) {
		return <Browser focussed path={route.path} />;
	}
	if (route instanceof RouteTypes.EntryDetails) {
		return <EntryDetails focussed pathKey={route.pathKey} />;
	}
	throw new Error("Unsupported route type");
}

function GeneralKeyBindings() {
	useKeyboard((key) => {
		if ((key.name === "c" && key.ctrl) || key.name === "q") {
			process.exit(0);
		}
	});

	return undefined;
}
