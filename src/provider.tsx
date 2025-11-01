import { QueryClientProvider } from "@tanstack/react-query";
import { DevConsole } from "./components/functional/dev-console";
import { getConfig } from "./config";
import { RegisteredKeybindsProvider } from "./contexts/registered-keybinds";
import { queryClient } from "./query-client";
import { RouteProvider } from "./routing/provider";
import { RouteTypes } from "./routing/route-types";

export function AppProvider({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<RouteProvider baseRoute={new RouteTypes.Browser(getConfig().path)}>
				<RegisteredKeybindsProvider>{children}</RegisteredKeybindsProvider>
			</RouteProvider>
			<DevConsole />
		</QueryClientProvider>
	);
}
