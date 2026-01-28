import { useState, useEffect, useMemo } from "react";
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
import { JobLogs } from "./components/JobLogs.tsx";
import type { Job, Step } from "./types/github.ts";

interface AppProps {
  onExit: () => void;
}

type ViewMode = "list" | "run-detail" | "job-logs";

interface SelectionItem {
  type: "job" | "step";
  job: Job;
  jobIndex: number;
  step?: Step;
  stepIndex?: number;
}

function MainApp({ onExit }: AppProps) {
  const auth = useAuthProvider();
  const github = useGitHub(auth.token);

  const [filter, setFilter] = useState("");
  const [selectedRunIndex, setSelectedRunIndex] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Job/step selection state
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Build flat list of selectable items (jobs and steps)
  const selectionItems = useMemo((): SelectionItem[] => {
    const items: SelectionItem[] = [];
    github.jobs.forEach((job, jobIndex) => {
      items.push({ type: "job", job, jobIndex });
      if (job.steps) {
        job.steps.forEach((step, stepIndex) => {
          items.push({ type: "step", job, jobIndex, step, stepIndex });
        });
      }
    });
    return items;
  }, [github.jobs]);

  // Get current selection info
  const currentItem = selectionItems[selectedItemIndex];
  const selectedJobIndex = currentItem?.jobIndex ?? 0;
  const selectedStepIndex = currentItem?.type === "step" ? currentItem.stepIndex ?? null : null;

  // Determine if any runs are in progress for faster polling
  const hasRunningRuns = github.runs.some(
    (run) => run.status === "in_progress" || run.status === "queued"
  );

  // Auto-polling
  usePolling({
    interval: hasRunningRuns ? 10000 : 30000,
    enabled: auth.isAuthenticated && viewMode === "list",
    onPoll: github.refresh,
  });

  // Reset selection when runs change
  useEffect(() => {
    setSelectedRunIndex(0);
  }, [github.runs]);

  // Reset job selection when jobs change
  useEffect(() => {
    setSelectedItemIndex(0);
  }, [github.jobs]);

  // Update view mode based on selectedRun
  useEffect(() => {
    if (github.selectedRun && viewMode === "list") {
      setViewMode("run-detail");
    } else if (!github.selectedRun && viewMode !== "list") {
      setViewMode("list");
    }
  }, [github.selectedRun, viewMode]);

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

    // Logout shortcut (shift+L)
    if (key.name === "l" && key.shift && auth.isAuthenticated) {
      auth.logout();
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

    // Job logs view shortcuts
    if (viewMode === "job-logs") {
      if (key.name === "escape") {
        setViewMode("run-detail");
        github.selectJob(null);
      }
      return;
    }

    // Run detail view shortcuts
    if (viewMode === "run-detail" && github.selectedRun) {
      if (key.name === "escape") {
        github.selectRun(null);
        setViewMode("list");
        setSelectedItemIndex(0);
      }
      if (key.name === "r") {
        github.refresh();
      }
      if (key.name === "j" || key.name === "down") {
        setSelectedItemIndex((prev) => Math.min(prev + 1, selectionItems.length - 1));
      }
      if (key.name === "k" || key.name === "up") {
        setSelectedItemIndex((prev) => Math.max(prev - 1, 0));
      }
      if (key.name === "return" && currentItem) {
        // View logs for the selected job
        github.selectJob(currentItem.job);
        setViewMode("job-logs");
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
        setViewMode("run-detail");
      }
      return;
    }

    if (key.name === "tab") {
      const currentIndex = github.repos.findIndex((r) => r.id === github.selectedRepo?.id);
      let nextIndex: number;
      if (key.shift) {
        nextIndex = (currentIndex - 1 + github.repos.length) % github.repos.length;
      } else {
        nextIndex = (currentIndex + 1) % github.repos.length;
      }
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
          <Header isAuthenticated={auth.isAuthenticated} />
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

  // Job logs view
  if (viewMode === "job-logs" && github.selectedRun && github.selectedJob) {
    return (
      <AuthContext.Provider value={auth}>
        <box style={{ flexDirection: "column", height: "100%" }}>
          <Header isAuthenticated={auth.isAuthenticated} />
          <box style={{ flexDirection: "column", border: true, padding: 1, flexGrow: 1 }}>
            <box style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <text>
                <strong fg="#06b6d4">
                  Run #{github.selectedRun.run_number} &gt; {github.selectedJob.name}
                  {currentItem?.type === "step" && currentItem.step ? ` > ${currentItem.step.name}` : ""}
                </strong>
              </text>
              <text>
                <span fg="#6b7280">[Esc] Back</span>
              </text>
            </box>
            <JobLogs
              job={github.selectedJob}
              logs={github.jobLogs}
              loading={github.loading}
              selectedStepNumber={currentItem?.type === "step" ? currentItem.step?.number ?? null : null}
            />
          </box>
        </box>
      </AuthContext.Provider>
    );
  }

  // Run detail view
  if (viewMode === "run-detail" && github.selectedRun) {
    return (
      <AuthContext.Provider value={auth}>
        <box style={{ flexDirection: "column", height: "100%" }}>
          <Header isAuthenticated={auth.isAuthenticated} />
          <RunDetail
            run={github.selectedRun}
            jobs={github.jobs}
            loading={github.loading}
            selectedJobIndex={selectedJobIndex}
            selectedStepIndex={selectedStepIndex}
            onSelectJob={github.selectJob}
          />
        </box>
      </AuthContext.Provider>
    );
  }

  // Main view
  return (
    <AuthContext.Provider value={auth}>
      <box style={{ flexDirection: "column", height: "100%" }}>
        <Header isAuthenticated={auth.isAuthenticated} />

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
              [Enter] View details [r] Refresh [/] Search [Tab] Switch repo [?] Help [L] Logout [q] Quit
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
