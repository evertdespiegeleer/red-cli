import { Browser } from "./components/functional/browser/browser"
import { Header } from "./components/functional/header"
import { AppProvider } from "./provider"

export function App() {
    return (
      <AppProvider>
        <box flexDirection="column" height="100%" width='100%'>
          <Header />
          <Browser />
        </box>
      </AppProvider>
    )
}