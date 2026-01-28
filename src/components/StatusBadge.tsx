interface StatusBadgeProps {
  status: string;
  conclusion?: string | null;
}

export function getStatusInfo(status: string, conclusion?: string | null): { symbol: string; color: string } {
  let symbol = "○";
  let color = "#6b7280";

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

  return { symbol, color };
}

// Use this when StatusBadge is the only thing in a text element
export function StatusBadge({ status, conclusion }: StatusBadgeProps) {
  const { symbol, color } = getStatusInfo(status, conclusion);
  return (
    <text>
      <span fg={color}>{symbol}</span>
    </text>
  );
}

// Use this when embedding inside another text element
export function StatusSymbol({ status, conclusion }: StatusBadgeProps) {
  const { symbol, color } = getStatusInfo(status, conclusion);
  return <span fg={color}>{symbol}</span>;
}
