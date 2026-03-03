import { useEffect, useReducer, useRef } from "react";
import { searchGithubUsers, type GithubApiError } from "../api/githubApi";
import type { GithubUser } from "../types/github";
import type { UiUser } from "../types/ui";

export type SearchState =
    | { status: "IDLE" }
    | { status: "LOADING" }
    | { status: "SUCCESS"; items: UiUser[] }
    | { status: "EMPTY" }
    | { status: "ERROR"; message: string };

type Action =
    | { type: "IDLE" }
    | { type: "LOADING" }
    | { type: "SUCCESS"; items: UiUser[] }
    | { type: "EMPTY" }
    | { type: "ERROR"; message: string };

function reducer(_: SearchState, action: Action): SearchState {
    switch (action.type) {
        case "IDLE":
            return { status: "IDLE" };
        case "LOADING":
            return { status: "LOADING" };
        case "SUCCESS":
            return { status: "SUCCESS", items: action.items };
        case "EMPTY":
            return { status: "EMPTY" };
        case "ERROR":
            return { status: "ERROR", message: action.message };
        default:
            return { status: "IDLE" };
    }
}

function rateLimitMessage(resetAt?: number) {
    if (!resetAt) return "GitHub API rate limit reached. Please try again later.";
    const d = new Date(resetAt);
    return `GitHub API rate limit reached. Try again after ${d.toLocaleTimeString()}.`;
}

function toMessage(e: unknown): string {
    const err = e as Partial<GithubApiError>;
    if (err.kind === "RATE_LIMIT") return rateLimitMessage((err as any).resetAt);
    if (err.kind === "HTTP")
        return `GitHub API error (${(err as any).status}). ${(err as any).message ?? ""}`.trim();
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
    const [state, dispatch] = useReducer(reducer, { status: "IDLE" } as SearchState);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const q = query.trim();

        if (!q) {
            abortRef.current?.abort();
            abortRef.current = null;
            dispatch({ type: "IDLE" });
            return;
        }

        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;

        dispatch({ type: "LOADING" });

        searchGithubUsers(q, ac.signal)
            .then((res) => {
                if (ac.signal.aborted) return;
                if (!res.items?.length) dispatch({ type: "EMPTY" });
                else dispatch({ type: "SUCCESS", items: mapGithubToUi(res.items) });
            })
            .catch((e) => {
                if (ac.signal.aborted) return;
                dispatch({ type: "ERROR", message: toMessage(e) });
            });
    }, [query]);

    return state;
}