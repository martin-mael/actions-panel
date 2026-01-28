import { StatusBadge } from "./StatusBadge.tsx";
import type { WorkflowRun } from "../types/github.ts";

interface RunsListProps {
  runs: WorkflowRun[];
  selectedIndex: number;
  filter: string;
  onSelect: (run: WorkflowRun) => void;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function getStatusColor(status: string, conclusion: string | null): string {
  if (status === "completed") {
    switch (conclusion) {
      case "success":
        return "#22c55e";
      case "failure":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  }
  return "#eab308";
}

export function RunsList({ runs, selectedIndex, filter }: RunsListProps) {
  const filteredRuns = runs.filter((run) => {
    if (!filter) return true;
    const searchLower = filter.toLowerCase();
    return (
      run.name.toLowerCase().includes(searchLower) ||
      run.head_branch.toLowerCase().includes(searchLower) ||
      String(run.run_number).includes(searchLower)
    );
  });

  if (filteredRuns.length === 0) {
    return (
      <box style={{ padding: 1 }}>
        <text>
          <span fg="#6b7280">
            {runs.length === 0 ? "No workflow runs found" : "No runs match the filter"}
          </span>
        </text>
      </box>
    );
  }

  return (
    <box style={{ flexDirection: "column", padding: 1 }}>
      {filteredRuns.map((run, index) => {
        const isSelected = index === selectedIndex;
        const statusColor = getStatusColor(run.status, run.conclusion);
        const statusText = run.conclusion || run.status;

        return (
          <box key={run.id} style={{ flexDirection: "row", gap: 2 }}>
            {isSelected ? (
              <text>
                <span fg="#06b6d4">&gt; </span>
                <StatusBadge status={run.status} conclusion={run.conclusion} />
                <span fg="#ffffff"> #{run.run_number} </span>
                <span fg="#ffffff">{run.name.slice(0, 25).padEnd(25)}</span>
                <span fg="#3b82f6">{run.head_branch.slice(0, 15).padEnd(15)}</span>
                <span fg="#6b7280">{formatTimeAgo(run.updated_at).padEnd(10)}</span>
                <span fg={statusColor}>{statusText.padEnd(10)}</span>
              </text>
            ) : (
              <text>
                <span fg="#6b7280">  </span>
                <StatusBadge status={run.status} conclusion={run.conclusion} />
                <span fg="#9ca3af"> #{run.run_number} </span>
                <span fg="#9ca3af">{run.name.slice(0, 25).padEnd(25)}</span>
                <span fg="#3b82f6">{run.head_branch.slice(0, 15).padEnd(15)}</span>
                <span fg="#6b7280">{formatTimeAgo(run.updated_at).padEnd(10)}</span>
                <span fg={statusColor}>{statusText.padEnd(10)}</span>
              </text>
            )}
          </box>
        );
      })}
    </box>
  );
}
