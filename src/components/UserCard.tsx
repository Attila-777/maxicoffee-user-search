export type UiUser = {
    uiId: string;
    githubId: number;
    login: string;
    avatarUrl: string;
    profileUrl: string;
};

type Props = {
    user: UiUser;
    editMode: boolean;
    selected: boolean;
    onToggleSelected: () => void;
};

export function UserCard({ user, editMode, selected, onToggleSelected }: Props) {
    return (
        <div className="card" data-testid={`card-${user.uiId}`}>
            {editMode && (
                <input
                    className="cardCheckbox"
                    type="checkbox"
                    checked={selected}
                    onChange={onToggleSelected}
                    aria-label={`Select ${user.login}`}
                />
            )}

            <img className="avatar" src={user.avatarUrl} alt={`${user.login} avatar`} />

            <p className="cardText">ID</p>
            <p className="cardSub">{user.login}</p>

            <button
                className="viewBtn"
                onClick={() => window.open(user.profileUrl, "_blank", "noreferrer")}
            >
                View profile
            </button>
        </div>
    );
}