import { useState, useEffect } from "react";
import { useKeyboard } from "@opentui/react";
import { useAuthProvider, AuthContext } from "./hooks/useAuth.ts";
import { useGitHub } from "./hooks/useGitHub.ts";
import { usePolling } from "./hooks/usePolling.ts";
import { Header } from "./components/Header.tsx";
import { AuthScreen } from "./components/AuthScreen.tsx";
import { RepoList } from "./components/RepoList.tsx";
import { RunsList } from "./components/RunsList.tsx";
import { RunDetail } from "./components/RunDetail.tsx";
import { SearchInput } from "./components/SearchInput.tsx";
import { HelpOverlay } from "./components/HelpOverlay.tsx";

interface AppProps {
  onExit: () => void;
}

function MainApp({ onExit }: AppProps) {
  const auth = useAuthProvider();
  const github = useGitHub(auth.token);

  const [filter, setFilter] = useState("");
  const [selectedRunIndex, setSelectedRunIndex] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Determine if any runs are in progress for faster polling
  const hasRunningRuns = github.runs.some(
    (run) => run.status === "in_progress" || run.status === "queued"
  );

  // Auto-polling
  usePolling({
    interval: hasRunningRuns ? 10000 : 30000,
    enabled: auth.isAuthenticated && !github.selectedRun,
    onPoll: github.refresh,
  });

  // Reset selection when runs change
  useEffect(() => {
    setSelectedRunIndex(0);
  }, [github.runs]);

  const filteredRuns = github.runs.filter((run) => {
    if (!filter) return true;
    const searchLower = filter.toLowerCase();
    return (
      run.name.toLowerCase().includes(searchLower) ||
      run.head_branch.toLowerCase().includes(searchLower) ||
      String(run.run_number).includes(searchLower)
    );
  });

  // Keyboard handler
  useKeyboard((key) => {
    // Global shortcuts
    if (key.name === "q") {
      onExit();
      return;
    }

    if (key.sequence === "?") {
      setShowHelp((prev) => !prev);
      return;
    }

    if (showHelp) {
      setShowHelp(false);
      return;
    }

    // Auth screen shortcuts
    if (!auth.isAuthenticated) {
      if (key.name === "return" && !auth.isLoading) {
        auth.login();
      }
      return;
    }

    // Run detail view shortcuts
    if (github.selectedRun) {
      if (key.name === "escape") {
        github.selectRun(null);
      }
      if (key.name === "r") {
        github.refresh();
      }
      return;
    }

    // Main view shortcuts
    if (isSearchFocused) {
      if (key.name === "escape") {
        setIsSearchFocused(false);
      }
      return;
    }

    if (key.sequence === "/") {
      setIsSearchFocused(true);
      return;
    }

    if (key.name === "r") {
      github.refresh();
      return;
    }

    if (key.name === "j" || key.name === "down") {
      setSelectedRunIndex((prev) => Math.min(prev + 1, filteredRuns.length - 1));
      return;
    }

    if (key.name === "k" || key.name === "up") {
      setSelectedRunIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (key.name === "return") {
      const selectedRun = filteredRuns[selectedRunIndex];
      if (selectedRun) {
        github.selectRun(selectedRun);
      }
      return;
    }

    if (key.name === "tab") {
      const currentIndex = github.repos.findIndex((r) => r.id === github.selectedRepo?.id);
      const nextIndex = (currentIndex + 1) % github.repos.length;
      const nextRepo = github.repos[nextIndex];
      if (nextRepo) {
        github.selectRepo(nextRepo);
      }
      return;
    }
  });

  // Auth screen
  if (!auth.isAuthenticated) {
    return (
      <AuthContext.Provider value={auth}>
        <box style={{ flexDirection: "column", height: "100%" }}>
          <Header />
          <AuthScreen
            deviceCode={auth.deviceCode}
            error={auth.error}
            isLoading={auth.isLoading}
            onLogin={auth.login}
          />
        </box>
      </AuthContext.Provider>
    );
  }

  // Run detail view
  if (github.selectedRun) {
    return (
      <AuthContext.Provider value={auth}>
        <box style={{ flexDirection: "column", height: "100%" }}>
          <Header />
          <RunDetail run={github.selectedRun} jobs={github.jobs} loading={github.loading} />
        </box>
      </AuthContext.Provider>
    );
  }

  // Main view
  return (
    <AuthContext.Provider value={auth}>
      <box style={{ flexDirection: "column", height: "100%" }}>
        <Header />

        <box style={{ border: true }}>
          <RepoList
            repos={github.repos}
            selectedRepo={github.selectedRepo}
            onSelect={github.selectRepo}
          />
        </box>

        <box style={{ border: true }}>
          <SearchInput
            value={filter}
            onChange={setFilter}
            focused={isSearchFocused}
          />
        </box>

        <box style={{ flexGrow: 1, flexDirection: "column" }}>
          {github.loading ? (
            <box style={{ padding: 1 }}>
              <text>
                <span fg="#eab308">Loading...</span>
              </text>
            </box>
          ) : github.error ? (
            <box style={{ padding: 1 }}>
              <text>
                <span fg="#ef4444">Error: {github.error}</span>
              </text>
            </box>
          ) : (
            <RunsList
              runs={github.runs}
              selectedIndex={selectedRunIndex}
              filter={filter}
              onSelect={github.selectRun}
            />
          )}
        </box>

        <box style={{ border: true, padding: 1 }}>
          <text>
            <span fg="#6b7280">
              [Enter] View details [r] Refresh [/] Search [Tab] Switch repo [?] Help [q] Quit
            </span>
          </text>
        </box>

        {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
      </box>
    </AuthContext.Provider>
  );
}

export function App({ onExit }: AppProps) {
  return <MainApp onExit={onExit} />;
}
