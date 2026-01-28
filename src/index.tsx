import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "./App.tsx";

async function main() {
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
    useMouse: false,
  });

  // Provide a clean exit function
  const exit = () => {
    renderer.destroy();
  };

  createRoot(renderer).render(<App onExit={exit} />);
}

main().catch((error) => {
  console.error("Failed to start application:", error);
  process.exit(1);
});
