import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Theme } from "@radix-ui/themes";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Theme accentColor="green" grayColor="olive" radius="large" appearance="light">
      <App />
    </Theme>
  </StrictMode>
);
