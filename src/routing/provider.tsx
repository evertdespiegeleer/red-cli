import type React from "react";
import { createContext, useContext, useState } from "react";
import type { RouteTypes } from "./route-types/index";

type RouteInstance = InstanceType<(typeof RouteTypes)[keyof typeof RouteTypes]>;

interface RouteContextState {
	route: RouteInstance;
	previousRoute: RouteInstance | undefined;
	setRoute: (route: RouteInstance) => unknown;
}

const RouteContext = createContext<RouteContextState | undefined>(undefined);

export const useRoute = (): RouteContextState => {
	const context = useContext(RouteContext);
	if (!context) {
		throw new Error("useRoute must be used within a RouteProvider");
	}

	return context;
};

export function RouteProvider(props: {
	children: React.ReactNode;
	baseRoute: RouteInstance;
}) {
	const [route, _setRoute] = useState<RouteInstance>(props.baseRoute);
	const [previousRoute, setPreviousRoute] = useState<
		RouteInstance | undefined
	>();

	const setRoute = (newRoute: RouteInstance) => {
		setPreviousRoute(route);
		_setRoute(newRoute);
	};

	return (
		<RouteContext.Provider value={{ route, previousRoute, setRoute }}>
			{props.children}
		</RouteContext.Provider>
	);
}
