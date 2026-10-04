import { createRoot } from "react-dom/client";
import { registerServiceWorker } from "@/lib/registerSW";
import { initializeSmartVersioning } from "@/lib/smartVersioning";
import "./index.css";

registerServiceWorker();
initializeSmartVersioning().catch(console.error);

createRoot(document.getElementById("root")!).render(
  <div className="flex min-h-screen items-center justify-center bg-background text-foreground text-xl font-medium">
    Coming soon
  </div>
);
