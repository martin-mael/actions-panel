import type { DeviceCodeResponse, AccessTokenResponse } from "../types/github.ts";

// You need to register a GitHub OAuth App and set this client ID
// Go to: https://github.com/settings/developers -> New OAuth App
// Enable "Device Flow" in the app settings
const CLIENT_ID = process.env.GITHUB_CLIENT_ID || "YOUR_CLIENT_ID_HERE";

export async function requestDeviceCode(): Promise<DeviceCodeResponse> {
  const response = await fetch("https://github.com/login/device/code", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      scope: "repo",
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to request device code: ${response.status}`);
  }

  return response.json() as Promise<DeviceCodeResponse>;
}

export async function pollForToken(deviceCode: string): Promise<AccessTokenResponse> {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      device_code: deviceCode,
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to poll for token: ${response.status}`);
  }

  return response.json() as Promise<AccessTokenResponse>;
}

export interface AuthFlowCallbacks {
  onDeviceCode: (code: DeviceCodeResponse) => void;
  onPolling: () => void;
  onSlowDown: () => void;
  onSuccess: (token: string) => void;
  onError: (error: string) => void;
}

export async function startAuthFlow(callbacks: AuthFlowCallbacks): Promise<void> {
  try {
    const deviceCode = await requestDeviceCode();
    callbacks.onDeviceCode(deviceCode);

    let interval = deviceCode.interval * 1000;
    const expiresAt = Date.now() + deviceCode.expires_in * 1000;

    while (Date.now() < expiresAt) {
      await new Promise((resolve) => setTimeout(resolve, interval));
      callbacks.onPolling();

      const tokenResponse = await pollForToken(deviceCode.device_code);

      if (tokenResponse.access_token) {
        callbacks.onSuccess(tokenResponse.access_token);
        return;
      }

      if (tokenResponse.error === "authorization_pending") {
        continue;
      }

      if (tokenResponse.error === "slow_down") {
        interval += 5000;
        callbacks.onSlowDown();
        continue;
      }

      if (tokenResponse.error === "expired_token") {
        callbacks.onError("Authentication expired. Please try again.");
        return;
      }

      if (tokenResponse.error === "access_denied") {
        callbacks.onError("Access denied by user.");
        return;
      }

      if (tokenResponse.error) {
        callbacks.onError(tokenResponse.error_description || tokenResponse.error);
        return;
      }
    }

    callbacks.onError("Authentication timed out. Please try again.");
  } catch (error) {
    callbacks.onError(error instanceof Error ? error.message : "Unknown error");
  }
}
