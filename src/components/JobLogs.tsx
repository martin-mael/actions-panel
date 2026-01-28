import type { Job, Step } from "../types/github.ts";

interface JobLogsProps {
  job: Job;
  logs: string | null;
  loading: boolean;
  selectedStepNumber: number | null;
}

interface ParsedLogSection {
  stepName: string;
  stepNumber: number;
  lines: string[];
}

function parseJobLogs(logs: string): ParsedLogSection[] {
  const sections: ParsedLogSection[] = [];
  let currentSection: ParsedLogSection | null = null;

  const lines = logs.split("\n");

  for (const line of lines) {
    // GitHub log format: timestamps followed by step markers like "##[group]Step Name"
    const groupMatch = line.match(/##\[group\](.*)/);
    const endGroupMatch = line.match(/##\[endgroup\]/);

    if (groupMatch) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        stepName: groupMatch[1] || "Unknown Step",
        stepNumber: sections.length + 1,
        lines: [],
      };
    } else if (endGroupMatch) {
      if (currentSection) {
        sections.push(currentSection);
        currentSection = null;
      }
    } else if (currentSection) {
      // Remove timestamp prefix if present (format: 2024-01-28T19:15:33.1234567Z)
      const cleanLine = line.replace(/^\d{4}-\d{2}-\d{2}T[\d:.]+Z\s*/, "");
      if (cleanLine.trim()) {
        currentSection.lines.push(cleanLine);
      }
    } else if (line.trim() && !line.startsWith("##[")) {
      // Lines outside of groups
      if (!currentSection) {
        currentSection = {
          stepName: "Setup",
          stepNumber: 0,
          lines: [],
        };
      }
      const cleanLine = line.replace(/^\d{4}-\d{2}-\d{2}T[\d:.]+Z\s*/, "");
      if (cleanLine.trim()) {
        currentSection.lines.push(cleanLine);
      }
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

function getStepLogs(logs: string, step: Step): string[] {
  const sections = parseJobLogs(logs);

  // Try to find the section that matches the step name
  const section = sections.find(s =>
    s.stepName.toLowerCase().includes(step.name.toLowerCase()) ||
    step.name.toLowerCase().includes(s.stepName.toLowerCase())
  );

  if (section) {
    return section.lines;
  }

  // If no matching section found, return all logs
  return logs.split("\n").map(line =>
    line.replace(/^\d{4}-\d{2}-\d{2}T[\d:.]+Z\s*/, "")
  ).filter(line => line.trim() && !line.startsWith("##["));
}

export function JobLogs({ job, logs, loading, selectedStepNumber }: JobLogsProps) {
  if (loading) {
    return (
      <box style={{ padding: 1 }}>
        <text>
          <span fg="#eab308">Loading logs...</span>
        </text>
      </box>
    );
  }

  if (!logs) {
    return (
      <box style={{ padding: 1 }}>
        <text>
          <span fg="#6b7280">No logs available</span>
        </text>
      </box>
    );
  }

  // If a step is selected, show only that step's logs
  if (selectedStepNumber !== null) {
    const step = job.steps?.find(s => s.number === selectedStepNumber);
    if (step) {
      const stepLogs = getStepLogs(logs, step);
      return (
        <box style={{ flexDirection: "column", padding: 1 }}>
          <text>
            <strong fg="#06b6d4">Step: {step.name}</strong>
          </text>
          <text> </text>
          <scrollbox style={{ flexGrow: 1 }} focused>
            <box style={{ flexDirection: "column" }}>
              {stepLogs.length === 0 ? (
                <text>
                  <span fg="#6b7280">No log output for this step</span>
                </text>
              ) : (
                stepLogs.map((line, i) => (
                  <text key={i}>
                    <span fg="#9ca3af">{line}</span>
                  </text>
                ))
              )}
            </box>
          </scrollbox>
        </box>
      );
    }
  }

  // Show all logs grouped by section
  const sections = parseJobLogs(logs);

  return (
    <box style={{ flexDirection: "column", padding: 1 }}>
      <text>
        <strong fg="#06b6d4">Job: {job.name}</strong>
      </text>
      <text> </text>
      <scrollbox style={{ flexGrow: 1 }} focused>
        <box style={{ flexDirection: "column" }}>
          {sections.map((section, i) => (
            <box key={i} style={{ flexDirection: "column", marginBottom: 1 }}>
              <text>
                <strong fg="#eab308">▸ {section.stepName}</strong>
              </text>
              {section.lines.map((line, j) => (
                <text key={j}>
                  <span fg="#9ca3af">  {line}</span>
                </text>
              ))}
            </box>
          ))}
        </box>
      </scrollbox>
    </box>
  );
}
