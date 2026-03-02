import type { GithubSearchResponse } from "../types/github";

export type GithubApiError =
    | { kind: "RATE_LIMIT"; resetAt?: number }
    | { kind: "HTTP"; status: number; message?: string };

export async function searchGithubUsers(query: string, signal: AbortSignal) {
    const url = `https://api.github.com/search/users?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { signal });

    if (!res.ok) {
        if (res.status === 403) {
            const remaining = res.headers.get("x-ratelimit-remaining");
            const reset = res.headers.get("x-ratelimit-reset");
            if (remaining === "0") {
                throw { kind: "RATE_LIMIT", resetAt: reset ? Number(reset) * 1000 : undefined } satisfies GithubApiError;
            }
        }
        let msg: string | undefined;
        try {
            const j = await res.json();
            msg = j?.message;
        } catch {
            // ignore
        }
        throw { kind: "HTTP", status: res.status, message: msg } satisfies GithubApiError;
    }

    return (await res.json()) as GithubSearchResponse;
}