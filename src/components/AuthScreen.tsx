import type { DeviceCodeResponse } from "../types/github.ts";

interface AuthScreenProps {
  deviceCode: DeviceCodeResponse | null;
  error: string | null;
  isLoading: boolean;
  onLogin: () => void;
}

const ASCII_LOGO = `
   ____  _   _    _        _   _
  / ___|| | | |  / \\   ___| |_(_) ___  _ __  ___
 | |  _ | |_| | / _ \\ / __| __| |/ _ \\| '_ \\/ __|
 | |_| ||  _  |/ ___ \\ (__| |_| | (_) | | | \\__ \\
  \\____||_| |_/_/   \\_\\___|\\__|_|\\___/|_| |_|___/
`;

export function AuthScreen({ deviceCode, error, isLoading }: AuthScreenProps) {
  if (deviceCode) {
    return (
      <box style={{ flexDirection: "column", alignItems: "center", padding: 2 }}>
        <text>
          <span fg="#06b6d4">{ASCII_LOGO}</span>
        </text>
        <text> </text>
        <text>To authenticate, please visit:</text>
        <text> </text>
        <text>
          <strong fg="#3b82f6">{deviceCode.verification_uri}</strong>
        </text>
        <text> </text>
        <text>And enter the code:</text>
        <text> </text>
        <text>
          <strong fg="#eab308"> {deviceCode.user_code} </strong>
        </text>
        <text> </text>
        <text>
          <span fg="#6b7280">Waiting for authorization...</span>
        </text>
      </box>
    );
  }

  if (error) {
    return (
      <box style={{ flexDirection: "column", alignItems: "center", padding: 2 }}>
        <text>
          <span fg="#06b6d4">{ASCII_LOGO}</span>
        </text>
        <text> </text>
        <text>
          <span fg="#ef4444">Error: {error}</span>
        </text>
        <text> </text>
        <text>Press Enter to try again</text>
      </box>
    );
  }

  return (
    <box style={{ flexDirection: "column", alignItems: "center", padding: 2 }}>
      <text>
        <span fg="#06b6d4">{ASCII_LOGO}</span>
      </text>
      <text> </text>
      <text>Welcome to GH Actions Panel</text>
      <text> </text>
      {isLoading ? (
        <text>
          <span fg="#eab308">Loading...</span>
        </text>
      ) : (
        <text>Press Enter to authenticate with GitHub</text>
      )}
    </box>
  );
}
