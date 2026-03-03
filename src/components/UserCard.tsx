import {useEffect, useState} from "react";

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

    console.log("UserCard user=", user);
    function Avatar({ url }: { url: string }) {
        console.log("url "  + url);
        const [error, setError] = useState(false);

        useEffect(() => setError(false), [url]);

        return (
            <div className="avatarWrapper">
                {!error ? (
                    <img
                        className="avatarImg"
                        src={url}
                        alt=""                 // 👈 empêche l’affichage du texte alt
                        onError={() => setError(true)}
                    />
                ) : (
                    <span className="avatarFallback">AVATAR_FALLBACK</span>
                )}
            </div>
        );
    }

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

            <Avatar url={user.avatarUrl} />

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