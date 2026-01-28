interface HeaderProps {
  isAuthenticated?: boolean;
}

export function Header({ isAuthenticated }: HeaderProps) {
  return (
    <box style={{ flexDirection: "row", justifyContent: "space-between", border: true, padding: 1 }}>
      <text>
        <strong fg="#06b6d4">GH Actions Panel</strong>
      </text>
      <text>
        <span fg="#6b7280">
          {isAuthenticated && "[L] Logout  "}[q]uit
        </span>
      </text>
    </box>
  );
}
