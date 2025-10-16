import { useRegisteredKeybinds } from "../../contexts/registered-keybinds";
import { Logo } from "../pure/logo";

export function Header() {
	const { keyBinds } = useRegisteredKeybinds();

	return (
		<box
			padding={1}
			flexDirection="row"
			gap={2}
			alignItems="center"
			flexGrow={1}
			height={30}
		>
			<Logo />
			<box flexDirection="row" gap={2}>
				{/* Keybinds */}
				<box flexDirection="column">
					{Array.from(keyBinds).map((keyBind) => (
						<box key={keyBind.keyCombination}>
							<text fg="yellow">{`<${keyBind.keyCombination}>`}</text>
						</box>
					))}
				</box>
				{/* Keybind descriptions */}
				<box flexDirection="column">
					{Array.from(keyBinds).map((keyBind) => (
						<text key={keyBind.keyCombination} fg="grey">
							{keyBind.description}
						</text>
					))}
				</box>
			</box>
		</box>
	);
}
