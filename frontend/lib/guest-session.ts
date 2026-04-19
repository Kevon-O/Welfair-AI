export const GUEST_SESSION_STORAGE_KEY = "welfair_guest_session_id";

function createGuestSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `guest-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export function getGuestSessionId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(GUEST_SESSION_STORAGE_KEY);
}

// The browser owns guest identity in this guest-only flow. We generate it once
// and then reuse it for every request header the frontend sends to the backend.
export function ensureGuestSessionId(): string {
  if (typeof window === "undefined") {
    throw new Error("Guest sessions are only available in the browser.");
  }

  const existingGuestSessionId = getGuestSessionId();
  if (existingGuestSessionId) {
    return existingGuestSessionId;
  }

  const nextGuestSessionId = createGuestSessionId();
  window.localStorage.setItem(GUEST_SESSION_STORAGE_KEY, nextGuestSessionId);
  return nextGuestSessionId;
}

export function guestSessionHeader(
  guestSessionId?: string,
): Record<"x-guest-session-id", string> {
  return {
    "x-guest-session-id": guestSessionId ?? ensureGuestSessionId(),
  };
}

export function formatGuestSessionLabel(guestSessionId: string | null): string {
  if (!guestSessionId) {
    return "Guest workspace";
  }

  return `Guest ${guestSessionId.slice(0, 8)}...${guestSessionId.slice(-4)}`;
}
