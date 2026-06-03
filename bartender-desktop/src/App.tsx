import AppRouter from "./router/AppRouter";
import { NotificationCenterProvider } from "./components/shared/NotificationCenter";

function App() {
  return (
    <NotificationCenterProvider>
      <AppRouter />
    </NotificationCenterProvider>
  );
}

export default App;