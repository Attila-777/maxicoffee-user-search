import { UserCard, type UiUser } from "./UserCard";

export function UserGrid({
                             items,
                             editMode,
                             selectedSet,
                             onToggle,
                         }: {
    items: UiUser[];
    editMode: boolean;
    selectedSet: Set<string>;
    onToggle: (uiId: string) => void;
}) {
    return (
        <div className="grid">
            {items.map((u) => (
                <UserCard
                    key={u.uiId}
                    user={u}
                    editMode={editMode}
                    selected={selectedSet.has(u.uiId)}
                    onToggleSelected={() => onToggle(u.uiId)}
                />
            ))}
        </div>
    );
}