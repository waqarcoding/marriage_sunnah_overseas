
import RangeSelect from "./range_select";

function RangeRow({ label, minVal, maxVal, onMinChange, onMaxChange, minOpts, maxOpts, optional }) {
    return (
        <
            // @ts-ignore
            div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}{optional && <span className="ml-1 normal-case font-normal text-muted-foreground/60">(optional)</span>}
            </label>
            <div className="grid grid-cols-2 gap-3">
                <RangeSelect
                    label="Min"
                    value={minVal}
                    onChange={onMinChange}
                    options={minOpts}
                    placeholder="Min"
                    optional={optional}
                    note={null}
                />
                <RangeSelect
                    label="Max"
                    value={maxVal}
                    onChange={onMaxChange}
                    options={maxOpts}
                    placeholder="Max"
                    optional={optional}
                    note={null}
                />
            </div>
        </div>
    );
}

export default RangeRow;