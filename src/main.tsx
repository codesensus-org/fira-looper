import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Layout } from "./layout.tsx";
import { HomePage } from "./pages/HomePage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Layout>
      <HomePage />
    </Layout>
  </StrictMode>,
);
