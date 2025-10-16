import { useEffect, useRef } from "react";

export function useInterval(callback: () => unknown, delay: number) {
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (delay !== null) {
			intervalRef.current = setInterval(callback, delay);
		}
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [callback, delay]);
}
