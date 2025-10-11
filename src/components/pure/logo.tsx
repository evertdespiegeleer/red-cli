import { RGBA } from "@opentui/core";

export function Logo() {
    return <ascii-font text="RED" style={{ fg: RGBA.fromHex('#FF0000'), font: 'tiny' }} />
}