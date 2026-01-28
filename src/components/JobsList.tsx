import { StatusBadge } from "./StatusBadge.tsx";
import type { Job } from "../types/github.ts";

interface JobsListProps {
  jobs: Job[];
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

export function JobsList({ jobs }: JobsListProps) {
  if (jobs.length === 0) {
    return (
      <text>
        <span fg="#6b7280">No jobs found</span>
      </text>
    );
  }

  return (
    <box style={{ flexDirection: "column" }}>
      {jobs.map((job) => (
        <box key={job.id} style={{ flexDirection: "column", padding: 1 }}>
          <box style={{ flexDirection: "row" }}>
            <StatusBadge status={job.status} conclusion={job.conclusion} />
            <text>
              <strong> {job.name}</strong>
              <span fg="#6b7280"> ({formatDuration(job.started_at, job.completed_at)})</span>
            </text>
          </box>
          {job.steps && (
            <box style={{ flexDirection: "column", marginLeft: 2 }}>
              {job.steps.map((step) => (
                <box key={step.number} style={{ flexDirection: "row" }}>
                  <StatusBadge status={step.status} conclusion={step.conclusion} />
                  <text>
                    <span> {step.name}</span>
                    <span fg="#6b7280"> {formatDuration(step.started_at, step.completed_at)}</span>
                  </text>
                </box>
              ))}
            </box>
          )}
        </box>
      ))}
    </box>
  );
}
