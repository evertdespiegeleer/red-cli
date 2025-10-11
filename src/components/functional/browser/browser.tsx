import { useMemo } from "react"
import { useRoute } from "../../../routing/provider"
import { RouteTypes } from "../../../routing/route-types"

export function Browser() {
    const { route } = useRoute()

    const title = useMemo(() => {
        if (route instanceof RouteTypes.Browser) {
            return `Browser – ${route.path || '[root]'}`
        }
        throw new Error('Route is not a BrowserRoute')
    }, [route])

    return (
        <box borderColor="cyan" borderStyle="rounded" flexGrow={1} title={` ${title} `} titleAlignment="center" flexDirection="row">
            <text padding={1}>
                Browser Component
            </text>
        </box>
    )
}