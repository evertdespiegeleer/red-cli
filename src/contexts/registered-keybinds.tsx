import { createContext, useContext, useEffect, useState } from "react";

type KeyBind = {
	keyCombination: string;
	description: string;
};

type RegisteredKeybindsContextValue = {
	keyBinds: Set<KeyBind>;
	addKeyBind: (keyBind: KeyBind) => unknown;
	removeKeyBind: (keyBind: KeyBind) => unknown;
};

const registeredKeybindsContext = createContext<
	RegisteredKeybindsContextValue | undefined
>(undefined);

export const useRegisteredKeybinds = () => {
	const context = useContext(registeredKeybindsContext);
	if (!context) {
		throw new Error(
			"useRegisteredKeybinds must be used within a RegisteredKeybindsProvider",
		);
	}
	return context;
};

export const useRegisterKeyBind = (
	keyCombination: string,
	description: string,
) => {
	const { addKeyBind, removeKeyBind } = useRegisteredKeybinds();

	// biome-ignore lint/correctness/useExhaustiveDependencies: We only want to run this effect on mount and unmount
	useEffect(() => {
		const keyBind = { keyCombination, description };
		addKeyBind(keyBind);
		return () => {
			removeKeyBind(keyBind);
		};
	}, [keyCombination, description]);
};

export function RegisteredKeybindsProvider(props: {
	children: React.ReactNode;
}) {
	const [keyBinds, setKeyBinds] = useState<Set<KeyBind>>(new Set());

	const addKeyBind = (keyBind: KeyBind) => {
		setKeyBinds((current) => new Set(current).add(keyBind));
	};

	const removeKeyBind = (keyBind: KeyBind) => {
		setKeyBinds((current) => {
			const newSet = new Set(current);
			newSet.delete(keyBind);
			return newSet;
		});
	};

	return (
		<registeredKeybindsContext.Provider
			value={{ keyBinds, addKeyBind, removeKeyBind }}
		>
			{props.children}
		</registeredKeybindsContext.Provider>
	);
}
