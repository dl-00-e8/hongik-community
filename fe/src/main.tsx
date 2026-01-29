import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Import migration check utility (dev mode only)
if (import.meta.env.DEV) {
  import('./lib/checkMigrationStatus');
}

createRoot(document.getElementById("root")!).render(<App />);
