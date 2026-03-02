import {useEffect, useMemo, useState} from "react";
import "./styles/app.css";

import {SearchBar} from "./components/SearchBar";
import {Toolbar} from "./components/Toolbar";
import {UserGrid} from "./components/UserGrid";
import type {UiUser} from "./components/UserCard";
import {useDebouncedValue} from "./hooks/useDebouncedValue";
import {useGithubUserSearch} from "./hooks/useGithubUserSearch";
import type {GithubUser} from "./types/github";

function mapGithubToUi(users: GithubUser[]): UiUser[] {
    return users.map((u) => ({
        uiId: `${u.id}-${crypto.randomUUID()}`,
        githubId: u.id,
        login: u.login,
        avatarUrl: u.avatar_url,
        profileUrl: u.html_url,
    }));
}

export default function App() {
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebouncedValue(query, 350);

    const searchState = useGithubUserSearch(debouncedQuery);

    const [editMode, setEditMode] = useState(true);

    const [items, setItems] = useState<UiUser[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    // Required: reset actions when search changes.
    useEffect(() => {
        if (searchState.status === "SUCCESS") {
            setItems(mapGithubToUi(searchState.items));
            setSelected(new Set());
        } else if (searchState.status === "EMPTY") {
            setItems([]);
            setSelected(new Set());
        } else if (searchState.status === "IDLE") {
            setItems([]);
            setSelected(new Set());
        } else if (searchState.status === "ERROR") {
            // Keep current list (optional), but reset selection to avoid inconsistencies.
            setSelected(new Set());
        }
    }, [searchState]);

    const selectedCount = selected.size;
    const totalCount = items.length;

    const selectAllChecked = totalCount > 0 && selectedCount === totalCount;
    const selectAllIndeterminate = selectedCount > 0 && selectedCount < totalCount;

    const selectedSetKey = useMemo(() => selected, [selected]); // stable ref for child props

    function toggleOne(uiId: string) {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(uiId)) next.delete(uiId);
            else next.add(uiId);
            return next;
        });
    }

    function toggleSelectAll() {
        setSelected((prev) => {
            if (items.length === 0) return new Set();
            if (prev.size === items.length) return new Set();
            return new Set(items.map((i) => i.uiId));
        });
    }

    function doDelete() {
        setItems((prev) => prev.filter((u) => !selected.has(u.uiId)));
        setSelected(new Set());
    }

    function doDuplicate() {
        setItems((prev) => {
            const picked = prev.filter((u) => selected.has(u.uiId));
            const clones = picked.map((u) => ({
                ...u,
                uiId: `${u.githubId}-${crypto.randomUUID()}`,
            }));
            return [...prev, ...clones];
        });
        setSelected(new Set());
    }

    return (
        <>
            <div className="header">Github Search</div>

            <div className="page container">
                <div className="page">
                    <SearchBar value={query} onChange={setQuery}/>

                    <Toolbar
                        editMode={editMode}
                        onToggleEditMode={() => setEditMode((v) => !v)}
                        selectedCount={selectedCount}
                        totalCount={totalCount}
                        selectAllChecked={selectAllChecked}
                        selectAllIndeterminate={selectAllIndeterminate}
                        onToggleSelectAll={toggleSelectAll}
                        onDuplicate={doDuplicate}
                        onDelete={doDelete}
                    />

                    {searchState.status === "LOADING" && <div className="status">Loading…</div>}
                    {searchState.status === "EMPTY" && <div className="status">No results</div>}
                    {searchState.status === "ERROR" && <div className="status error">{searchState.message}</div>}

                    <UserGrid items={items} editMode={editMode} selectedSet={selectedSetKey} onToggle={toggleOne}/>
                </div>
            </div>
        </>
    );
}