type Props = { value: string; onChange: (v: string) => void };

export function SearchBar({ value, onChange }: Props) {
    return (
        <div className="searchRow">
            <input
                className="searchInput"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search input"
                aria-label="Search input"
            />
        </div>
    );
}