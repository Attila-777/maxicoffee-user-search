import { useEffect, useRef, useState } from "react";
import { searchGithubUsers, type GithubApiError } from "../api/githubApi";
import type { GithubUser } from "../types/github";
import type { UiUser } from "../types/ui";

export type SearchState =
    | { status: "IDLE" }
    | { status: "LOADING" }
    | { status: "SUCCESS"; items: UiUser[] }
    | { status: "EMPTY" }
    | { status: "ERROR"; message: string };

function rateLimitMessage(resetAt?: number) {
    if (!resetAt) return "GitHub API rate limit reached. Please try again later.";
    const d = new Date(resetAt);
    return `GitHub API rate limit reached. Try again after ${d.toLocaleTimeString()}.`;
}

function toMessage(e: unknown): string {
    const err = e as Partial<GithubApiError>;
    if (err.kind === "RATE_LIMIT") return rateLimitMessage((err as any).resetAt);
    if (err.kind === "HTTP") return `GitHub API error (${(err as any).status}). ${(err as any).message ?? ""}`.trim();
    return "Unexpected error.";
}

function mapGithubToUi(users: GithubUser[]): UiUser[] {
    return users.map((u) => ({
        uiId: `${u.id}-${crypto.randomUUID()}`,
        githubId: u.id,
        login: u.login,
        avatarUrl: u.avatar_url,
        profileUrl: u.html_url,
    }));
}

export function useGithubUserSearch(query: string) {
    const [state, setState] = useState<SearchState>({ status: "IDLE" });
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const q = query.trim();

        if (!q) {
            abortRef.current?.abort();
            abortRef.current = null;
            setState({ status: "IDLE" });
            return;
        }

        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;

        setState({ status: "LOADING" });

        searchGithubUsers(q, ac.signal)
            .then((res) => {
                if (ac.signal.aborted) return;
                if (!res.items?.length) setState({ status: "EMPTY" });
                else setState({ status: "SUCCESS", items: mapGithubToUi(res.items) });
            })
            .catch((e) => {
                if (ac.signal.aborted) return;
                setState({ status: "ERROR", message: toMessage(e) });
            });
    }, [query]);

    return state;
}