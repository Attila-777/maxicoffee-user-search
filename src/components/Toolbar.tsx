import { DuplicateIcon, TrashIcon } from "./icons";
import { useEffect, useRef } from "react";

type Props = {
    editMode: boolean;
    onToggleEditMode: () => void;

    selectedCount: number;
    totalCount: number;

    selectAllChecked: boolean;
    selectAllIndeterminate: boolean;
    onToggleSelectAll: () => void;

    onDuplicate: () => void;
    onDelete: () => void;
};

export function Toolbar({
                            editMode,
                            onToggleEditMode,
                            selectedCount,
                            totalCount,
                            selectAllChecked,
                            selectAllIndeterminate,
                            onToggleSelectAll,
                            onDuplicate,
                            onDelete,
                        }: Props) {
    return (
        <div className="toolbar">
            <div className="toolbarLeft">
                {editMode ? (
                    <>
                        <SelectAllCheckbox
                            checked={selectAllChecked}
                            indeterminate={selectAllIndeterminate}
                            onChange={onToggleSelectAll}
                            disabled={totalCount === 0}
                        />
                        <span>{selectedCount} elements selected</span>
                    </>
                ) : (
                    <span />
                )}
            </div>

            <div className="toolbarRight">
                <button className="linkBtn" onClick={onToggleEditMode} aria-label="Toggle edit mode">
                    {editMode ? "Done" : "Edit"}
                </button>

                {editMode && (
                    <>
                        <button className="iconBtn" onClick={onDuplicate} disabled={selectedCount === 0} title="Duplicate">
                            <DuplicateIcon />
                        </button>
                        <button className="iconBtn" onClick={onDelete} disabled={selectedCount === 0} title="Delete">
                            <TrashIcon />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

function SelectAllCheckbox({
                               checked,
                               indeterminate,
                               onChange,
                               disabled,
                           }: {
    checked: boolean;
    indeterminate: boolean;
    onChange: () => void;
    disabled?: boolean;
}) {
    const ref = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (ref.current) ref.current.indeterminate = indeterminate;
    }, [indeterminate]);

    return (
        <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            aria-label="Select all"
        />
    );
}