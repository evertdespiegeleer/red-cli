import { Logo } from "../pure/logo"

export function Header() {
    return (
        <box padding={1} flexDirection="row" gap={2} alignItems="center">
            <Logo />
        </box>
    )
}