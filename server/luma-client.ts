/**
 * Luma API client with built-in rate limiting and 429 retry logic.
 *
 * Luma enforces 300 requests per 1-minute window per API key.
 * On a 429 response the caller is blocked for a full minute.
 *
 * Strategy:
 *   - Token bucket: capacity 20, refill at 4 tokens/second (240 req/min –
 *     a comfortable safety margin below the 300 limit).
 *   - On HTTP 429: pause 61 seconds then retry (up to MAX_RETRIES times).
 *   - Hard timeout of 30 seconds per individual request.
 */

const BUCKET_CAPACITY = 20;
const REFILL_RATE_PER_MS = 4 / 1000; // 4 tokens/second → 240 req/min
const RATE_LIMIT_BACKOFF_MS = 61_000; // 61 s after a 429
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;

class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor() {
    this.tokens = BUCKET_CAPACITY;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const gained = (now - this.lastRefill) * REFILL_RATE_PER_MS;
    this.tokens = Math.min(BUCKET_CAPACITY, this.tokens + gained);
    this.lastRefill = now;
  }

  async consume(): Promise<void> {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }
    // Calculate how long to wait for 1 token to accumulate
    const waitMs = Math.ceil((1 - this.tokens) / REFILL_RATE_PER_MS);
    await sleep(waitMs);
    this.refill();
    this.tokens -= 1;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Single shared bucket for all Luma requests within this process
const bucket = new TokenBucket();

/**
 * Fetch a Luma API URL with automatic rate-limit handling.
 *
 * @param url     Full URL to call (must be a Luma API endpoint)
 * @param apiKey  Value for the `x-luma-api-key` header
 * @param init    Optional additional fetch options (headers merged, not replaced)
 * @param attempt Internal retry counter – callers should not pass this
 */
export async function lumaFetch(
  url: string,
  apiKey: string,
  init?: RequestInit,
  attempt = 0,
): Promise<Response> {
  // Throttle: wait for a token before sending
  await bucket.consume();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "x-luma-api-key": apiKey,
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Luma API request timed out after 30 seconds");
    }
    throw new Error(
      `Failed to connect to Luma API: ${err instanceof Error ? err.message : "Unknown error"}`,
    );
  }
  clearTimeout(timeoutId);

  // Rate limited – back off and retry
  if (response.status === 429) {
    if (attempt >= MAX_RETRIES) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `Luma API rate limit exceeded after ${MAX_RETRIES} retries. ` +
          (body ? `Response: ${body}` : "Please try again later."),
      );
    }
    console.warn(
      `[luma-client] HTTP 429 – rate limited. Backing off ${RATE_LIMIT_BACKOFF_MS / 1000}s ` +
        `before retry ${attempt + 1}/${MAX_RETRIES}…`,
    );
    await sleep(RATE_LIMIT_BACKOFF_MS);
    return lumaFetch(url, apiKey, init, attempt + 1);
  }

  return response;
}

/**
 * Convenience wrapper that throws on non-2xx responses and parses JSON.
 */
export async function lumaGet<T = unknown>(
  url: string,
  apiKey: string,
): Promise<T> {
  const response = await lumaFetch(url, apiKey);
  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Luma API returned status ${response.status}: ${errorText || response.statusText}`,
    );
  }
  return response.json() as Promise<T>;
}
