import { DevConsole } from "./components/functional/dev-console";
import { RouteProvider } from "./routing/provider";
import { RouteTypes } from "./routing/route-types";

export function AppProvider({ children }: { children: React.ReactNode }) {
	return (
		<>
			<RouteProvider baseRoute={new RouteTypes.Browser("")}>
				{children}
			</RouteProvider>
			<DevConsole />
		</>
	);
}
