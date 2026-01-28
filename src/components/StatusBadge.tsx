interface StatusBadgeProps {
  status: string;
  conclusion?: string | null;
}

export function StatusBadge({ status, conclusion }: StatusBadgeProps) {
  let symbol = "○";
  let color = "gray";

  if (status === "completed") {
    switch (conclusion) {
      case "success":
        symbol = "●";
        color = "#22c55e";
        break;
      case "failure":
        symbol = "✗";
        color = "#ef4444";
        break;
      case "cancelled":
        symbol = "◌";
        color = "#6b7280";
        break;
      case "skipped":
        symbol = "◌";
        color = "#6b7280";
        break;
      case "timed_out":
        symbol = "⏱";
        color = "#eab308";
        break;
      default:
        symbol = "●";
        color = "#6b7280";
    }
  } else if (status === "in_progress" || status === "queued" || status === "waiting") {
    symbol = "○";
    color = "#eab308";
  }

  return (
    <text>
      <span fg={color}>{symbol}</span>
    </text>
  );
}
