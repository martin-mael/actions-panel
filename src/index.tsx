import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "./App.tsx";

async function main() {
  const renderer = await createCliRenderer();
  createRoot(renderer).render(<App />);
}

main().catch((error) => {
  console.error("Failed to start application:", error);
  process.exit(1);
});
