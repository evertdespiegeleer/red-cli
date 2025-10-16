import { useRegisteredKeybinds } from "../../contexts/registered-keybinds";
import { Logo } from "../pure/logo";

export function Header() {
	const { keyBinds } = useRegisteredKeybinds();
	const sortedKeyBinds = Array.from(keyBinds).sort((a, b) =>
		a.keyCombination.localeCompare(b.keyCombination),
	);

	return (
		<box
			padding={1}
			flexDirection="row"
			gap={5}
			alignItems="center"
			flexShrink={1}
			minHeight={10}
		>
			<Logo big />
			<box flexDirection="row" gap={2}>
				{/* Keybinds */}
				<box flexDirection="column">
					{Array.from(sortedKeyBinds).map((keyBind) => (
						<box key={keyBind.keyCombination}>
							<text fg="yellow">{`<${keyBind.keyCombination}>`}</text>
						</box>
					))}
				</box>
				{/* Keybind descriptions */}
				<box flexDirection="column">
					{Array.from(sortedKeyBinds).map((keyBind) => (
						<text key={keyBind.keyCombination} fg="grey">
							{keyBind.description}
						</text>
					))}
				</box>
			</box>
		</box>
	);
}
