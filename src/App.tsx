import { useEffect, useMemo, useReducer, useState } from "react";
import "./styles/app.css";

import { SearchBar } from "./components/SearchBar";
import { Toolbar } from "./components/Toolbar";
import { UserGrid } from "./components/UserGrid";
import type { UiUser } from "./types/ui";

import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { useGithubUserSearch } from "./hooks/useGithubUserSearch";

type State = {
    items: UiUser[];
    selected: Set<string>;
    editMode: boolean;
};

type Action =
    | { type: "SEARCH_RESULTS"; items: UiUser[] } // SUCCESS
    | { type: "SEARCH_EMPTY" }                    // EMPTY or IDLE
    | { type: "SEARCH_ERROR" }                    // ERROR (keep items, reset selection)
    | { type: "TOGGLE_ONE"; uiId: string }
    | { type: "TOGGLE_ALL" }
    | { type: "DUPLICATE_SELECTED" }
    | { type: "DELETE_SELECTED" }
    | { type: "TOGGLE_EDIT_MODE" };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "SEARCH_RESULTS": {
            // Required: reset actions when search changes
            return { ...state, items: action.items, selected: new Set() };
        }
        case "SEARCH_EMPTY": {
            return { ...state, items: [], selected: new Set() };
        }
        case "SEARCH_ERROR": {
            return { ...state, selected: new Set() };
        }
        case "TOGGLE_ONE": {
            const next = new Set(state.selected);
            if (next.has(action.uiId)) next.delete(action.uiId);
            else next.add(action.uiId);
            return { ...state, selected: next };
        }
        case "TOGGLE_ALL": {
            if (state.items.length === 0) return { ...state, selected: new Set() };
            if (state.selected.size === state.items.length) return { ...state, selected: new Set() };
            return { ...state, selected: new Set(state.items.map((i) => i.uiId)) };
        }
        case "DELETE_SELECTED": {
            const filtered = state.items.filter((u) => !state.selected.has(u.uiId));
            return { ...state, items: filtered, selected: new Set() };
        }
        case "DUPLICATE_SELECTED": {
            const picked = state.items.filter((u) => state.selected.has(u.uiId));
            const clones = picked.map((u) => ({
                ...u,
                uiId: `${u.githubId}-${crypto.randomUUID()}`,
            }));
            return { ...state, items: [...state.items, ...clones], selected: new Set() };
        }
        case "TOGGLE_EDIT_MODE": {
            // Bonus behavior: when leaving edit mode, clear selection
            const nextEdit = !state.editMode;
            return { ...state, editMode: nextEdit, selected: nextEdit ? state.selected : new Set() };
        }
        default:
            return state;
    }
}

export default function App() {
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebouncedValue(query, 350);

    const searchState = useGithubUserSearch(debouncedQuery);

    const [state, dispatch] = useReducer(reducer, {
        items: [],
        selected: new Set<string>(),
        editMode: true,
    });

    // Sync reducer with external system (GitHub API results).
    useEffect(() => {
        if (searchState.status === "SUCCESS") {
            dispatch({ type: "SEARCH_RESULTS", items: searchState.items });
        } else if (searchState.status === "EMPTY" || searchState.status === "IDLE") {
            dispatch({ type: "SEARCH_EMPTY" });
        } else if (searchState.status === "ERROR") {
            dispatch({ type: "SEARCH_ERROR" });
        }
    }, [searchState]);

    const selectedCount = state.selected.size;
    const totalCount = state.items.length;

    const selectAllChecked = totalCount > 0 && selectedCount === totalCount;
    const selectAllIndeterminate = selectedCount > 0 && selectedCount < totalCount;

    // make Set stable for props (optional)
    const selectedSet = useMemo(() => state.selected, [state.selected]);

    return (
        <>
            <div className="header">Github Search</div>

            <div className="page container">
                <SearchBar value={query} onChange={setQuery} />

                <Toolbar
                    editMode={state.editMode}
                    onToggleEditMode={() => dispatch({ type: "TOGGLE_EDIT_MODE" })}
                    selectedCount={selectedCount}
                    totalCount={totalCount}
                    selectAllChecked={selectAllChecked}
                    selectAllIndeterminate={selectAllIndeterminate}
                    onToggleSelectAll={() => dispatch({ type: "TOGGLE_ALL" })}
                    onDuplicate={() => dispatch({ type: "DUPLICATE_SELECTED" })}
                    onDelete={() => dispatch({ type: "DELETE_SELECTED" })}
                />

                {searchState.status === "LOADING" && <div className="status">Loading…</div>}
                {searchState.status === "EMPTY" && <div className="status">No results</div>}
                {searchState.status === "ERROR" && <div className="status error">{searchState.message}</div>}

                <UserGrid
                    items={state.items}
                    editMode={state.editMode}
                    selectedSet={selectedSet}
                    onToggle={(uiId) => dispatch({ type: "TOGGLE_ONE", uiId })}
                />
            </div>
        </>
    );
}