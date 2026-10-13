export type ReplenishFeedback = {
  type: "error" | "warning" | "success";
  text: string;
};

/** Pull Cohere JSON `message` out of a noisy exception string. */
function extractCohereUserMessage(raw: string): string | null {
  const patterns = [
    /'message':\s*"((?:\\.|[^"\\])*)"/,
    /"message":\s*"((?:\\.|[^"\\])*)"/,
  ];
  for (const re of patterns) {
    const m = raw.match(re);
    if (m?.[1]) {
      return m[1].replace(/\\"/g, '"').trim();
    }
  }
  return null;
}

function isVerboseCohereDump(text: string): boolean {
  return (
    text.includes("headers:") ||
    text.includes("status_code:") ||
    text.includes("CohereUnavailableError") ||
    text.length > 320
  );
}

/** One-line, admin-friendly copy — no duplicated headers / stack blobs. */
export function sanitizeReplenishDisplayMessage(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) return trimmed;
  if (!isVerboseCohereDump(trimmed)) return trimmed;

  const cohereMsg = extractCohereUserMessage(trimmed);
  const missingMatch = trimmed.match(
    /Could not add AI questions\s*\((\d+)\s*still missing\)/i,
  );
  const missingSuffix = missingMatch
    ? ` (${missingMatch[1]} still missing).`
    : "";

  if (/429|TooManyRequests|Trial key/i.test(trimmed)) {
    if (cohereMsg) {
      const short =
        cohereMsg.length > 220 ? `${cohereMsg.slice(0, 217)}…` : cohereMsg;
      return `Could not add AI questions${missingSuffix} Cohere limit reached (429): ${short}`;
    }
    return `Could not add AI questions${missingSuffix} Cohere rate or trial limit (429). Upgrade your key at dashboard.cohere.com/api-keys or add questions manually.`;
  }

  if (/COHERE_API_KEY is missing/i.test(trimmed)) {
    return `Could not add AI questions${missingSuffix} Set COHERE_API_KEY in backend .env and restart the API, or add questions manually.`;
  }

  if (cohereMsg) {
    const short =
      cohereMsg.length > 220 ? `${cohereMsg.slice(0, 217)}…` : cohereMsg;
    return `Could not add AI questions${missingSuffix} ${short}`;
  }

  const prefix = trimmed.split("Cohere request failed:")[0]?.trim();
  if (prefix && prefix.length < 200) {
    return `${prefix.replace(/\.\s*$/, "")}. Check Cohere configuration or add questions manually.`;
  }

  return trimmed.length > 280 ? `${trimmed.slice(0, 277)}…` : trimmed;
}

export function buildReplenishFeedback(res: Record<string, unknown>): ReplenishFeedback {
  const added = Number(res.added ?? res.total_questions_added ?? 0);
  const stillMissingAi = Number(res.still_missing_ai ?? res.still_missing ?? 0);
  const stillMissingManual = Number(res.still_missing_manual ?? 0);
  const serverMessage =
    (typeof res.message === "string" && res.message) ||
    `AI questions replenished. Added: ${added}.`;

  const cohereErr =
    typeof res.cohere_error === "string" ? res.cohere_error.trim() : "";
  let displayMessage = serverMessage;
  if (cohereErr) {
    const alreadyInMessage =
      serverMessage.includes(cohereErr.slice(0, 80)) ||
      (serverMessage.includes("Cohere request failed") &&
        cohereErr.includes("CohereUnavailableError"));
    if (!alreadyInMessage) {
      displayMessage = `${serverMessage} ${cohereErr}`;
    }
  }
  displayMessage = sanitizeReplenishDisplayMessage(displayMessage);

  if (stillMissingAi > 0 && added === 0) {
    return { type: "error", text: displayMessage };
  }
  if (stillMissingAi > 0 || stillMissingManual > 0) {
    return { type: "warning", text: displayMessage };
  }
  return { type: "success", text: displayMessage };
}

export function replenishFeedbackBannerClass(type: ReplenishFeedback["type"]): string {
  switch (type) {
    case "error":
      return "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200";
    default:
      return "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200";
  }
}
