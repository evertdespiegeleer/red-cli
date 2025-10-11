import { Browser } from "./components/functional/browser/browser"
import { Header } from "./components/functional/header"
import { AppProvider } from "./provider"
import { useRoute } from "./routing/provider"
import { RouteTypes } from "./routing/route-types"

export function App() {
  return (
    <AppProvider>
      <box flexDirection="column" height="100%" width='100%'>
        <Header />
        <Content />
      </box>
    </AppProvider>
  )
}

function Content() {
  const { route } = useRoute()
  if (route instanceof RouteTypes.Browser) {
    return <Browser path={route.path} />
  }
  throw new Error('Unsupported route type')
}