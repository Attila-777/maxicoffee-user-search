import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Disable debounce in tests (return value immediately)
vi.mock("./hooks/useDebouncedValue", () => ({
    useDebouncedValue: (value: any) => value,
}));

import App from "./App";

function mockFetchOnce(data: any, ok = true, status = 200, headers?: Record<string, string>) {
    const fetchMock = vi.fn().mockResolvedValue({
        ok,
        status,
        headers: {
            get: (k: string) => headers?.[k.toLowerCase()] ?? null,
        },
        json: async () => data,
    } as any);

    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

const sampleUsers = [
    { id: 1, login: "alice", avatar_url: "https://example.com/a.png", html_url: "https://github.com/alice" },
    { id: 2, login: "bob", avatar_url: "https://example.com/b.png", html_url: "https://github.com/bob" },
    { id: 3, login: "carol", avatar_url: "https://example.com/c.png", html_url: "https://github.com/carol" },
];

describe("App", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.resetAllMocks();
    });

    async function searchAndLoadUsers() {
        mockFetchOnce({ total_count: 3, incomplete_results: false, items: sampleUsers });

        render(<App />);

        const user = userEvent.setup();
        const input = screen.getByLabelText("Search input");
        await user.type(input, "a"); // triggers fetch

        // wait for any user to appear (we use checkbox label as reliable indicator)
        await screen.findByLabelText("Select alice");
        return user;
    }

    it("shows 'No results' when GitHub returns an empty list", async () => {
        mockFetchOnce({ total_count: 0, incomplete_results: false, items: [] });

        render(<App />);

        const user = userEvent.setup();
        await user.type(screen.getByLabelText("Search input"), "zzzzzzzz");

        expect(await screen.findByText("No results")).toBeInTheDocument();
    });

    it("select all selects all cards and updates the counter", async () => {
        const user = await searchAndLoadUsers();

        const selectAll = screen.getByLabelText("Select all");
        await user.click(selectAll);

        // Counter text in toolbar
        expect(screen.getByText("3 elements selected")).toBeInTheDocument();

        // All per-card checkboxes checked
        expect((screen.getByLabelText("Select alice") as HTMLInputElement).checked).toBe(true);
        expect((screen.getByLabelText("Select bob") as HTMLInputElement).checked).toBe(true);
        expect((screen.getByLabelText("Select carol") as HTMLInputElement).checked).toBe(true);
    });

    it("delete removes selected cards", async () => {
        const user = await searchAndLoadUsers();

        // select two users
        await user.click(screen.getByLabelText("Select alice"));
        await user.click(screen.getByLabelText("Select bob"));

        expect(screen.getByText("2 elements selected")).toBeInTheDocument();

        // click delete icon button (title="Delete")
        const deleteBtn = screen.getByTitle("Delete");
        await user.click(deleteBtn);

        // alice and bob checkboxes gone, carol remains
        expect(screen.queryByLabelText("Select alice")).toBeNull();
        expect(screen.queryByLabelText("Select bob")).toBeNull();
        expect(screen.getByLabelText("Select carol")).toBeInTheDocument();

        // counter resets (0 selected) - toolbar shows "0 elements selected"
        expect(screen.getByText("0 elements selected")).toBeInTheDocument();
    });
});