import { useState } from "react";

export const usePropagate = <T>(initialValue: T) => {
	const [liveValue, setLiveValue] = useState<T>(initialValue);
	const [propagatedValue, setPropagatedValue] = useState<T>(initialValue);

	const propagate = () => {
		setPropagatedValue(liveValue);
	};

	const clear = () => {
		setLiveValue(initialValue);
		setPropagatedValue(initialValue);
	};

	return {
		value: liveValue,
		setValue: setLiveValue,
		propagatedValue,
		propagate,
		clear,
	} as const;
};
