export type GithubUser = {
    id: number;
    login: string;
    avatar_url: string;
    html_url: string;
};

export type GithubSearchResponse = {
    total_count: number;
    incomplete_results: boolean;
    items: GithubUser[];
};