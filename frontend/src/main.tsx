
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import { Toaster } from "./components/ui/sonner";
  import "react-day-picker/style.css";
  import "./index.css";

  createRoot(document.getElementById("root")!).render(
    <>
      <App />
      <Toaster />
    </>
  );
  