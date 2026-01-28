interface HelpOverlayProps {
  onClose: () => void;
}

export function HelpOverlay({ onClose }: HelpOverlayProps) {
  return (
    <box
      style={{
        flexDirection: "column",
        border: true,
        borderStyle: "double",
        padding: 2,
        width: 50,
        backgroundColor: "#1f2937",
      }}
    >
      <box style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <text>
          <strong fg="#06b6d4">Keyboard Shortcuts</strong>
        </text>
        <text>
          <span fg="#6b7280">[?] Close</span>
        </text>
      </box>
      <text> </text>
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text>
          <span fg="#eab308">Navigation</span>
        </text>
        <text>
          <span fg="#6b7280">Tab / Shift+Tab  </span>
          <span>Switch between repos</span>
        </text>
        <text>
          <span fg="#6b7280">j/k or Up/Down   </span>
          <span>Navigate runs list</span>
        </text>
        <text>
          <span fg="#6b7280">Enter            </span>
          <span>View run details</span>
        </text>
        <text>
          <span fg="#6b7280">Esc              </span>
          <span>Go back</span>
        </text>
        <text> </text>
        <text>
          <span fg="#eab308">Actions</span>
        </text>
        <text>
          <span fg="#6b7280">/                </span>
          <span>Focus search</span>
        </text>
        <text>
          <span fg="#6b7280">r                </span>
          <span>Refresh</span>
        </text>
        <text>
          <span fg="#6b7280">q                </span>
          <span>Quit</span>
        </text>
        <text>
          <span fg="#6b7280">?                </span>
          <span>Toggle help</span>
        </text>
      </box>
    </box>
  );
}
