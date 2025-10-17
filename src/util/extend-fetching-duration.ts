import { useEffect, useRef, useState } from "react";

export const useExtendsTrueishDuration = (
	bool: boolean,
	debounceMillis: number = 300,
) => {
	const [debouncedBool, setDebouncedBool] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

	useEffect(() => {
		if (bool) {
			setDebouncedBool(true);
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = undefined;
			}
		} else {
			timeoutRef.current = setTimeout(() => {
				setDebouncedBool(false);
				timeoutRef.current = undefined;
			}, debounceMillis ?? 0);
		}
	}, [bool, debounceMillis]);

	return debouncedBool;
};
