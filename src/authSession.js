export function getJwtPayload(token) {
  if (typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3 || !parts[1] || !parts[2]) return null;

  try {
    const base64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
    const bytes = Uint8Array.from(binary, (character) =>
      character.charCodeAt(0)
    );
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

export function isJwtUnexpired(token, now = Date.now()) {
  const payload = getJwtPayload(token);

  return (
    payload !== null &&
    Number.isFinite(payload.exp) &&
    payload.exp * 1000 > now
  );
}