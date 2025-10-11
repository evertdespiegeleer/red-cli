import { useKeyboard, useRenderer } from "@opentui/react";

export function DevConsole() {
    const renderer = useRenderer()

    useKeyboard((key) => {
        if (key.ctrl && key.name === 'd') {
            renderer.console.toggle()
        }
    })

    return null
}