import { StatusSymbol } from "./StatusBadge.tsx";
import type { WorkflowRun, Job } from "../types/github.ts";

interface RunDetailProps {
  run: WorkflowRun;
  jobs: Job[];
  loading: boolean;
}

function formatDuration(startDate: string | null, endDate: string | null): string {
  if (!startDate) return "-";
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const diffMs = end.getTime() - start.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const mins = Math.floor(diffSecs / 60);
  const secs = diffSecs % 60;

  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString();
}

export function RunDetail({ run, jobs, loading }: RunDetailProps) {
  return (
    <box style={{ flexDirection: "column", border: true, padding: 1 }}>
      <box style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <text>
          <strong fg="#06b6d4">Run #{run.run_number}: {run.name}</strong>
        </text>
        <text>
          <span fg="#6b7280">[Esc] Back</span>
        </text>
      </box>

      <box style={{ flexDirection: "column", padding: 1 }}>
        <box style={{ flexDirection: "row", gap: 4 }}>
          <text>
            <span fg="#6b7280">Status: </span>
            <StatusSymbol status={run.status} conclusion={run.conclusion} />
            <span> {run.conclusion || run.status}</span>
          </text>
          <text>
            <span fg="#6b7280">Branch: </span>
            <span fg="#3b82f6">{run.head_branch}</span>
          </text>
          <text>
            <span fg="#6b7280">Event: </span>
            <span>{run.event}</span>
          </text>
        </box>
        <box style={{ flexDirection: "row", gap: 4 }}>
          <text>
            <span fg="#6b7280">Commit: </span>
            <span fg="#eab308">{run.head_sha.slice(0, 7)}</span>
          </text>
          <text>
            <span fg="#6b7280">Duration: </span>
            <span>{formatDuration(run.run_started_at, run.updated_at)}</span>
          </text>
        </box>
        <text>
          <span fg="#6b7280">Started: </span>
          <span>{formatDateTime(run.run_started_at || run.created_at)}</span>
        </text>
      </box>

      <box style={{ flexDirection: "column", padding: 1 }}>
        <text>
          <strong>Jobs:</strong>
        </text>
        {loading ? (
          <text>
            <span fg="#eab308">Loading jobs...</span>
          </text>
        ) : jobs.length === 0 ? (
          <text>
            <span fg="#6b7280">No jobs found</span>
          </text>
        ) : (
          jobs.map((job, jobIndex) => (
            <box key={job.id} style={{ flexDirection: "column", marginLeft: 1 }}>
              <text>
                <span fg="#6b7280">{jobIndex === jobs.length - 1 ? "└─ " : "├─ "}</span>
                <StatusSymbol status={job.status} conclusion={job.conclusion} />
                <span> {job.name}</span>
                <span fg="#6b7280"> ({formatDuration(job.started_at, job.completed_at)})</span>
              </text>
              {job.steps && job.steps.map((step, stepIndex) => (
                <text key={step.number}>
                  <span fg="#6b7280">
                    {jobIndex === jobs.length - 1 ? "   " : "│  "}
                    {stepIndex === job.steps.length - 1 ? "└─ " : "├─ "}
                  </span>
                  <span>{step.name}</span>
                  <span fg="#6b7280"> </span>
                  <StatusSymbol status={step.status} conclusion={step.conclusion} />
                  <span fg="#6b7280"> {formatDuration(step.started_at, step.completed_at)}</span>
                </text>
              ))}
            </box>
          ))
        )}
      </box>
    </box>
  );
}
