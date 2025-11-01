import { createContext, useContext, useMemo, useState } from "react";
import { getConfig } from "../config";

type RefreshContextValue = {
	autoRefresh: boolean;
	setAutoRefresh: React.Dispatch<React.SetStateAction<boolean>>;
	refreshInterval: number;
	setRefreshInterval: React.Dispatch<React.SetStateAction<number>>;
};

const RefreshContext = createContext<RefreshContextValue | undefined>(
	undefined,
);

export const useRefreshContext = () => {
	const context = useContext(RefreshContext);
	if (!context) {
		throw new Error("useRefreshContext must be used within a RefreshProvider");
	}
	return context;
};

export const useRefreshConfig = () => {
	const { autoRefresh, setAutoRefresh, refreshInterval, setRefreshInterval } =
		useRefreshContext();

	return {
		autoRefresh,
		setAutoRefresh,
		toggleAutoRefresh: () => setAutoRefresh(!autoRefresh),

		refreshInterval,
		setRefreshInterval,
	};
};

export function RefreshProvider(props: { children: React.ReactNode }) {
	const [autoRefresh, setAutoRefresh] = useState(getConfig().autoRefresh);
	const [refreshInterval, setRefreshInterval] = useState(
		getConfig().refreshInterval,
	);

	const contextValue = useMemo<RefreshContextValue>(
		() => ({
			autoRefresh,
			setAutoRefresh,
			refreshInterval,
			setRefreshInterval,
		}),
		[autoRefresh, refreshInterval],
	);

	return (
		<RefreshContext.Provider value={contextValue}>
			{props.children}
		</RefreshContext.Provider>
	);
}
