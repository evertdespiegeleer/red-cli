import { useEffect, useRef, useState } from "react";

export const useDebounce = <T>(initialValue: T, debounce: number = 300) => {
	const [value, setValue] = useState<T>(initialValue);
	const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

	const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

	useEffect(() => {
		clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => {
			setDebouncedValue(value);
		}, debounce);

		return () => {
			clearTimeout(timeoutRef.current);
		};
	}, [value, debounce]);

	return {
		value,
		setValue,
		debouncedValue,
	} as const;
};
